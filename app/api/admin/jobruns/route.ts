import { NextResponse } from "next/server";
import { listJobRuns } from "@/lib/admin/jobRuns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jobRuns = await listJobRuns();
  return NextResponse.json({ ok: true, jobRuns });
}
