import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/security/cron";
import { revalidatePath } from "next/cache";

import { generateArticle, type GenerateResult } from "@/lib/playbook/generate";
import { countPublishedToday } from "@/lib/admin/jobRuns";
import { getAdminSettings } from "@/lib/admin/settings";
import { sendMail } from "@/lib/email/send";
import { siteConfig } from "@/lib/seo/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Tell the owner when a scheduled run did not produce a live article, so it is never silent again. */
async function alertOwner(subject: string, detail: string, notifyEmail: string) {
  const text = `${detail}\n\nSee the run log: ${siteConfig.url}/admin/playbook`;
  await sendMail({
    to: notifyEmail,
    subject: `[Eka Playbook] ${subject}`,
    text,
    html: `<p>${detail.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p><p><a href="${siteConfig.url}/admin/playbook">Open the run log</a></p>`,
  });
}

/** Called by GitHub Actions once a day. Never touched directly by a browser. */
export async function POST(request: Request) {
  if (!isAuthorizedCron(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getAdminSettings();
  const cap = settings.dailyGenerationCap ?? 1;
  const doneToday = await countPublishedToday();
  if (doneToday >= cap) {
    // A real, intentional skip (already wrote today's article), so this stays a green run.
    return NextResponse.json({ ok: true, skipped: true, reason: `Daily cap of ${cap} already reached (${doneToday} published today)` });
  }

  const url = new URL(request.url);
  const slot = url.searchParams.get("slot") ?? "scheduled";

  let result: GenerateResult;
  try {
    result = await generateArticle(slot);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await alertOwner("Run crashed", `The scheduled article run crashed: ${message}`, settings.notifyEmail);
    return NextResponse.json({ ok: false, status: "failed", error: message }, { status: 500 });
  }

  if (result.status === "published") {
    revalidatePath("/playbook");
    revalidatePath(`/playbook/${result.slug}`);
    return NextResponse.json({ ok: true, ...result });
  }

  // Anything else means no article went live today. Make it loud: email, and a red run on GitHub where it is a real fault.
  if (result.status === "failed") {
    await alertOwner("Run failed", result.error ?? "The article run failed.", settings.notifyEmail);
    return NextResponse.json({ ok: false, ...result }, { status: 502 });
  }
  if (result.status === "skipped") {
    await alertOwner("Run skipped", result.error ?? "The article run was skipped.", settings.notifyEmail);
    return NextResponse.json({ ok: false, ...result }, { status: 503 });
  }
  // "draft": written but held back by a guardrail. Not a fault, but it needs a human.
  await alertOwner("Article needs review", `A new article was written but not published: ${(result.reasons ?? []).join("; ")}`, settings.notifyEmail);
  return NextResponse.json({ ok: true, ...result });
}
