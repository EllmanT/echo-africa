import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/security/cron";

import { runNurtureSweep } from "@/lib/nurture/sequence";
import { NURTURE_SLOT } from "@/lib/admin/jobRuns";
import { requireDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Called hourly by GitHub Actions. Sends whichever nurture step is due for each lead, at most one per lead per call. */
export async function POST(request: Request) {
  if (!isAuthorizedCron(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  try {
    const result = await runNurtureSweep();
    const db = await requireDb();
    await db.collection("jobRuns").insertOne({
      slot: NURTURE_SLOT,
      status: result.errors.length ? "needs-review" : "ok",
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
