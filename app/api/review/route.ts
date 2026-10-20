import { NextResponse } from "next/server";

import { getAdminSettings } from "@/lib/admin/settings";
import { reviewEmail, reviewOwnerEmail } from "@/lib/email/review-template";
import { sendMail } from "@/lib/email/send";
import { upsertLead } from "@/lib/leads/repository";
import { signLeadRef } from "@/lib/leads/leadRef";
import { allowRequest, clientIp, readJsonLimited } from "@/lib/rateLimit";
import { recordReviewUsage, reviewHasBudget } from "@/lib/review/budget";
import { generateReview, ReviewGenerationError, type Review } from "@/lib/review/generate";
import { hostLabel, mailboxKey, normalizeSiteUrl, reviewRequestSchema } from "@/lib/review/schema";
import { extractSiteFacts, unreadableFacts } from "@/lib/review/siteFacts";
import { isPublicHttpUrl, fetchPublicText } from "@/lib/security/safeUrl";
import { verifyTurnstile } from "@/lib/security/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const MIN_FILL_TIME_MS = 3000;
/** Limits that protect the AI bill and the mailbox. Per IP, per address, and for the whole site per day. */
const PER_IP_PER_DAY = 3;
const PER_EMAIL_PER_DAY = 2;
const REVIEW_MAILS_PER_DAY = 80;

/** The visitor is always told their request arrived; when the AI path is closed a human replies instead. */
const queued = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, queued: true, ...extra });

export async function POST(request: Request) {
  // Room for the text of an uploaded document (the schema caps each field); the file itself is read in the browser.
  const body = await readJsonLimited(request, 24_000);
  if (body === null) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const parsed = reviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Some answers are missing or invalid", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const req = parsed.data;

  // Bots: honeypot filled or submitted implausibly fast. Pretend it worked, spend nothing.
  if (req.company || req.elapsedMs < MIN_FILL_TIME_MS) return queued();

  // Resolve what is being reviewed first (pure CPU, free): invalid input never spends a visitor's daily quota.
  // A site address must be a public one: nothing internal is ever fetched.
  let target = "";
  let siteUrl: string | null = null;
  if (req.mode === "site") {
    siteUrl = normalizeSiteUrl(req.url ?? "");
    if (!siteUrl || !isPublicHttpUrl(siteUrl)) {
      return NextResponse.json({ ok: false, error: "Enter your website address, like yourbusiness.co.zw", issues: { url: ["Enter a valid public website address"] } }, { status: 400 });
    }
    target = siteUrl;
  } else {
    target = (req.process ?? "").slice(0, 600) || `Uploaded document: ${req.documentName || "file"}`;
  }

  const ip = clientIp(request.headers);
  const settings = await getAdminSettings();
  // Every AI call costs money, so the limits fail closed: if the counter is unreachable, nobody gets a review.
  // The mailbox limit uses the normalised address, so +tags and gmail dots cannot multiply it.
  const allowed =
    (await allowRequest(`review:ip:${ip}`, PER_IP_PER_DAY, 86400, { failClosed: true })) &&
    (await allowRequest(`review:to:${mailboxKey(req.email)}`, PER_EMAIL_PER_DAY, 86400, { failClosed: true })) &&
    // A phone number is a second identity: new email aliases cannot get around the per-person limit.
    (await allowRequest(`review:wa:${req.whatsapp.replace(/\D/g, "")}`, PER_EMAIL_PER_DAY, 86400, { failClosed: true })) &&
    (await allowRequest("review:all", settings.reviewDailyCap, 86400, { failClosed: true }));
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "You have used today's free reviews. Start a project instead and we will reply personally." }, { status: 429 });
  }

  const human = await verifyTurnstile(req.turnstileToken, { action: "review", ip, failOpen: false });
  if (!human.ok) {
    return NextResponse.json({ ok: false, error: "We could not confirm you are human. Please reload the page and try again." }, { status: 400 });
  }

  // From here the visitor waits, so the reply is a stream of real progress events (one JSON object per line).
  // Everything above returns plain JSON errors; everything below ends with exactly one "done", "queued" or "error" event.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}
`));
        } catch {
          // The visitor closed the tab: keep working, the review still gets emailed.
        }
      };
      try {
        await run(send);
      } catch (error) {
        console.error("[review] unexpected failure:", error instanceof Error ? error.message : error);
        send({ t: "error", error: "Something went wrong on our side. Please try again." });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }
    },
  });

  async function run(send: (event: Record<string, unknown>) => void) {
    send({ t: "stage", stage: "start" });
    const aiOpen = settings.reviewEnabled ? await reviewHasBudget(settings.reviewMonthlyBudgetUsd) : false;

    // Try the AI path. Any failure falls through to the human-reply path below, so a visitor is never left hanging.
    let review: Review | undefined;
    let failure = aiOpen ? "" : "AI review is switched off or this month's review budget is used up";
    if (aiOpen && !process.env.ANTHROPIC_API_KEY) failure = "ANTHROPIC_API_KEY is not set";
    if (aiOpen && process.env.ANTHROPIC_API_KEY) {
      try {
        let result;
        if (req.mode === "site" && siteUrl) {
          send({ t: "stage", stage: "open" });
          const page = await fetchPublicText(siteUrl, { timeoutMs: 8000, maxBytes: 600_000, headers: { "user-agent": "Mozilla/5.0 (compatible; EkaReviewBot/1.0; +https://www.eka.dev)" } });
          // Could not connect at all (typo, no such domain, timeout): say so now instead of queuing work for a human.
          if (!page) {
            send({ t: "error", error: "We could not open that address. Check the spelling and try again.", issues: { url: ["We could not open this address"] } });
            return;
          }
          send({ t: "stage", stage: "read" });
          // Reachable but blocked or an error page: the model is told plainly that nothing could be read.
          const facts = page.ok ? extractSiteFacts(page.text, siteUrl) : unreadableFacts(siteUrl);
          send({ t: "stage", stage: "think" });
          result = await generateReview({ mode: "site", facts });
        } else {
          send({ t: "stage", stage: "read" });
          send({ t: "stage", stage: "think" });
          result = await generateReview({ mode: "process", description: req.process ?? "", document: req.documentText ?? "" });
        }
        review = result.review;
        await recordReviewUsage(result.costUsd, true);
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
        console.error("[review] generation failed:", failure);
        // A rejected answer was still paid for: record what it really cost.
        await recordReviewUsage(error instanceof ReviewGenerationError ? error.costUsd : 0, false);
      }
    }
    send({ t: "stage", stage: "write" });

    // The visitor becomes a lead either way, so the nurture emails and the admin list pick them up.
    let leadId: string | null = null;
    try {
      leadId = await upsertLead(undefined, {
        name: req.name,
        email: req.email,
        whatsapp: req.whatsapp,
        businessName: req.mode === "site" && siteUrl ? hostLabel(siteUrl) : "Free review (process)",
        services: [req.mode === "site" ? "website" : "ai-automation"],
        website: req.mode === "site" ? target : "",
        notes: `Free review (${req.mode}): ${target}`.slice(0, 700),
        status: "nurture",
        tier: "nurture",
        source: `free-review${req.source ? `:${req.source}` : ""}`.slice(0, 100),
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("[review] lead save failed:", error instanceof Error ? error.message : error);
    }

    // Mail budgets: owner alerts are never starved by visitor mail, and visitor mail has its own daily ceiling.
    const visitorMailOk = review ? await allowRequest("mail:review", REVIEW_MAILS_PER_DAY, 86400) : false;
    const ownerSubject = review ? `Free review sent: ${req.name}` : `Free review needs a human reply: ${req.name}`;
    const [emailed] = await Promise.all([
      review && visitorMailOk
        ? sendMail(reviewEmail({ name: req.name, email: req.email, mode: req.mode, review, leadId: leadId ?? undefined }))
        : Promise.resolve(false),
      sendMail(reviewOwnerEmail({ to: settings.notifyEmail, name: req.name, email: req.email, whatsapp: req.whatsapp, mode: req.mode, subject: ownerSubject, target, review, failure: review ? undefined : failure, leadId: leadId ?? undefined })),
    ]);

    const leadRef = leadId ? signLeadRef(leadId) : null;
    if (!review) send({ t: "queued", leadRef });
    else send({ t: "done", review, emailed, leadRef });
  }

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store, no-transform", "x-accel-buffering": "no" },
  });
}
