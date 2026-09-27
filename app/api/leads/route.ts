import { NextResponse } from "next/server";

import { leadRequestSchema } from "@/lib/leads/schema";
import { scoreLead } from "@/lib/leads/score";
import { getScoreSettings, recordEmail, upsertLead } from "@/lib/leads/repository";
import { getAdminSettings } from "@/lib/admin/settings";
import { leadConfirmationEmail, ownerNotificationEmail } from "@/lib/email/templates";
import { sendMail } from "@/lib/email/send";
import { allowRequest, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_TIME_MS = 2500;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
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

  const ip = clientIp(request.headers);
  if (!(await allowRequest(`lead:${ip}`, 20, 3600))) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Step 2 of the form: contact details captured, lead saved as "partial".
  if (req.stage === "partial") {
    try {
      const leadId = await upsertLead(req.leadId, {
        ...req.data,
        status: "partial",
        source: req.source,
      });
      return NextResponse.json({ ok: true, leadId });
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

  const [scoreSettings, adminSettings] = await Promise.all([getScoreSettings(), getAdminSettings()]);
  const { score, tier } = scoreLead(req.data, scoreSettings);

  let leadId: string | null = null;
  try {
    leadId = await upsertLead(req.leadId, {
      ...req.data,
      status: tier === "nurture" ? "nurture" : "new",
      tier,
      score,
      source: req.source,
      completedAt: new Date(),
    });
  } catch (error) {
    // Storage failed, but the owner email below still preserves the lead.
    console.error("[leads] save failed:", error instanceof Error ? error.message : error);
  }

  const [ownerOk, leadOk] = await Promise.all([
    sendMail(ownerNotificationEmail(req.data, tier, score, adminSettings.notifyEmail)),
    sendMail(leadConfirmationEmail(req.data, tier, leadId ?? undefined)),
  ]);

  if (leadId) {
    await Promise.all([
      recordEmail(leadId, "owner-notification", ownerOk),
      recordEmail(leadId, "lead-confirmation", leadOk),
    ]);
  }

  return NextResponse.json({ ok: true, leadId, tier });
}
