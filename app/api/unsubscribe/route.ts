import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireDb } from "@/lib/db/mongodb";
import { verifyUnsubscribeToken } from "@/lib/nurture/unsubscribe";
import { allowRequest, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Performs the unsubscribe. Only a POST changes anything, so link-prefetching mail scanners cannot unsubscribe people. */
export async function POST(request: Request) {
  const back = (qs: string) => NextResponse.redirect(new URL(`/unsubscribe?${qs}`, request.url), 303);

  if (!(await allowRequest(`unsub:${clientIp(request.headers)}`, 20, 3600, { shared: false }))) return back("done=0");

  const form = await request.formData().catch(() => null);
  const leadId = String(form?.get("lead") ?? "");
  const token = String(form?.get("token") ?? "");
  if (!ObjectId.isValid(leadId) || !verifyUnsubscribeToken(leadId, token)) return back("done=0");

  try {
    const db = await requireDb();
    await db.collection("leads").updateOne({ _id: new ObjectId(leadId) }, { $set: { unsubscribed: true } });
  } catch {
    // If storage is down we still confirm: the visitor's intent is honoured on the next successful retry from the owner side.
  }
  return back("done=1");
}
