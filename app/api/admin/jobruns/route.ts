import { requireAdmin } from "@/lib/security/adminGuard";
import { NextResponse } from "next/server";
import { listJobRuns } from "@/lib/admin/jobRuns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin("GET");
  if (denied) return denied;
  const jobRuns = await listJobRuns();
  return NextResponse.json({ ok: true, jobRuns });
}
