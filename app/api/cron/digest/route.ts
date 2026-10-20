import { NextResponse } from "next/server";

import { DIGEST_SLOT } from "@/lib/admin/jobRuns";
import { getAdminSettings } from "@/lib/admin/settings";
import { getDb } from "@/lib/db/mongodb";
import { runDigest } from "@/lib/digest/send";
import { sendMail } from "@/lib/email/send";
import { isAuthorizedCron } from "@/lib/security/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Called hourly by GitHub Actions. Waits for the send hour set in the admin and for today's article, then sends the
 * short Playbook email to whoever has not had it yet. Quiet runs (too early, nothing new) write no log entry.
 */
export async function POST(request: Request) {
  if (!isAuthorizedCron(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  try {
    const result = await runDigest(startedAt);

    if (result.status === "sent" || result.status === "failed") {
      const db = await getDb();
      await db?.collection("jobRuns").insertOne({
        slot: DIGEST_SLOT,
        status: result.status === "failed" || result.failed > 0 ? "needs-review" : "ok",
        startedAt,
        finishedAt: new Date(),
        postSlug: result.slug,
        reasons: result.reason ? [result.reason] : [],
        flags: [`Sent ${result.sent}, failed ${result.failed}, still to send ${result.remaining} of ${result.subscribers} subscribers`],
      });
    }

    // A run that could not write the email is the one thing the owner needs to hear about; a quiet skip is normal.
    if (result.status === "failed") {
      const { notifyEmail } = await getAdminSettings();
      await sendMail({
        to: notifyEmail,
        subject: "[Eka Playbook] Today's email could not be written",
        text: `${result.reason}\n\nArticle: ${result.slug}\nThe job tries again within the hour.`,
        html: `<p>${(result.reason ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p><p>Article: ${result.slug}<br>The job tries again within the hour.</p>`,
      });
    }

    return NextResponse.json({ ok: result.status !== "failed", ...result }, { status: result.status === "failed" ? 502 : 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
