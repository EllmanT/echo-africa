import { NextResponse } from "next/server";

import { leadRequestSchema } from "@/lib/leads/schema";
import { scoreLead } from "@/lib/leads/score";
import { findTier, formatRange } from "@/lib/leads/pricing";
import { recordEmail, upsertLead } from "@/lib/leads/repository";
import { getPricingConfig } from "@/lib/content/pricing";
import { getAdminSettings } from "@/lib/admin/settings";
import { leadConfirmationEmail, ownerNotificationEmail } from "@/lib/email/templates";
import { sendMail } from "@/lib/email/send";
import { allowRequest, clientIp, readJsonLimited } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { parseLeadRef, signLeadRef } from "@/lib/leads/leadRef";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_TIME_MS = 2500;
const OWNER_MAILS_PER_DAY = 150;
const CONFIRM_MAILS_PER_DAY = 200;
const CONFIRM_MAILS_PER_ADDRESS_PER_DAY = 2;

export async function POST(request: Request) {
  const body = await readJsonLimited(request);
  if (body === null) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Some answers are missing or invalid", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const req = parsed.data;
  // Only a reference this server signed can update an existing lead; anything else starts a new one.
  const existingLeadId = parseLeadRef(req.leadId);

  const ip = clientIp(request.headers);
  if (!(await allowRequest(`lead:${ip}`, 20, 3600))) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Step 2 of the form: contact details captured, lead saved as "partial".
  if (req.stage === "partial") {
    try {
      const leadId = await upsertLead(existingLeadId, {
        ...req.data,
        status: "partial",
        source: req.source,
      });
      return NextResponse.json({ ok: true, leadId: signLeadRef(leadId) });
    } catch (error) {
      console.error("[leads] partial save failed:", error instanceof Error ? error.message : error);
      // Never block the visitor: the final submit still emails the owner.
      return NextResponse.json({ ok: true, leadId: null });
    }
  }

  // Bots: honeypot filled or finished implausibly fast. Pretend it worked.
  if (req.company || req.elapsedMs < MIN_FILL_TIME_MS) {
    return NextResponse.json({ ok: true, leadId: null, tier: "nurture" });
  }

  // Bot check. Lead capture fails open if Cloudflare itself is down (the other limits still apply), but a missing or bad token is refused.
  const human = await verifyTurnstile(req.turnstileToken, { action: "lead", ip, failOpen: true });
  if (!human.ok) {
    return NextResponse.json({ ok: false, error: "We could not confirm you are human. Please reload the page and try again." }, { status: 400 });
  }

  const [pricing, adminSettings] = await Promise.all([getPricingConfig(), getAdminSettings()]);

  // The chosen range must be one of the tiers this visitor was actually offered.
  const picked = findTier(pricing, req.data.services, req.data.budget);
  if (!picked) {
    return NextResponse.json(
      { ok: false, error: "That price range is no longer available. Please go back and pick again." },
      { status: 400 }
    );
  }
  const budgetLabel = formatRange(picked.tier);
  const booking = picked.tier.qualified && picked.tier.booking;
  const { score, tier } = scoreLead(req.data, picked);

  let leadId: string | null = null;
  try {
    leadId = await upsertLead(existingLeadId, {
      ...req.data,
      status: tier === "nurture" ? "nurture" : "new",
      tier,
      score,
      budgetLabel,
      budgetMinUsd: picked.tier.minUsd,
      budgetSet: picked.set,
      budgetTierName: picked.tier.name,
      source: req.source,
      completedAt: new Date(),
    });
  } catch (error) {
    // Storage failed, but the owner email below still preserves the lead.
    console.error("[leads] save failed:", error instanceof Error ? error.message : error);
  }

  // Email budgets: the lead is always saved, but a flood must not turn this form into a mail cannon
  // (sender reputation) or use up the SMTP daily cap that the owner alerts depend on.
  const ownerBudgetOk = await allowRequest("mail:owner", OWNER_MAILS_PER_DAY, 86400);
  const confirmBudgetOk =
    (await allowRequest("mail:confirm", CONFIRM_MAILS_PER_DAY, 86400)) &&
    (await allowRequest(`mail:to:${req.data.email}`, CONFIRM_MAILS_PER_ADDRESS_PER_DAY, 86400));

  const [ownerOk, leadOk] = await Promise.all([
    ownerBudgetOk
      ? sendMail(ownerNotificationEmail(req.data, tier, score, `${picked.tier.name}, ${budgetLabel}`, adminSettings.notifyEmail))
      : Promise.resolve(false),
    confirmBudgetOk
      ? sendMail(leadConfirmationEmail(req.data, tier, { leadId: leadId ?? undefined, booking, budgetLabel, tierName: picked.tier.name }))
      : Promise.resolve(false),
  ]);

  if (leadId) {
    await Promise.all([
      recordEmail(leadId, "owner-notification", ownerOk),
      recordEmail(leadId, "lead-confirmation", leadOk),
    ]);
  }

  return NextResponse.json({ ok: true, leadId: leadId ? signLeadRef(leadId) : null, tier, booking });
}
