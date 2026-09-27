import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { generateArticle } from "@/lib/playbook/generate";
import { countPublishedToday } from "@/lib/admin/jobRuns";
import { getAdminSettings } from "@/lib/admin/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Called by GitHub Actions 3x a day. Never touched directly by a browser. */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getAdminSettings();
  const cap = settings.dailyGenerationCap ?? 3;
  const doneToday = await countPublishedToday();
  if (doneToday >= cap) {
    return NextResponse.json({ ok: true, skipped: true, reason: `Daily cap of ${cap} already reached (${doneToday} published today)` });
  }

  const url = new URL(request.url);
  const slot = url.searchParams.get("slot") ?? "scheduled";

  const result = await generateArticle(slot);
  if (result.status === "published") {
    revalidatePath("/playbook");
    revalidatePath(`/playbook/${result.slug}`);
  }

  return NextResponse.json({ ok: result.status !== "failed", ...result });
}
