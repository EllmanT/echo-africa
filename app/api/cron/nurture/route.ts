import { NextResponse } from "next/server";

import { runNurtureSweep } from "@/lib/nurture/sequence";
import { requireDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Called hourly by GitHub Actions. Sends whichever nurture step is due for each lead, at most one per lead per call. */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  try {
    const result = await runNurtureSweep();
    const db = await requireDb();
    await db.collection("jobRuns").insertOne({
      slot: "nurture",
      status: result.errors.length ? "needs-review" : "published",
      startedAt,
      finishedAt: new Date(),
      reasons: result.errors,
      flags: [`Checked ${result.checkedPartial} partial and ${result.checkedActive} active leads, sent ${result.sent.length}`],
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
