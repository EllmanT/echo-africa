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

  // Two ways in: the confirm page posts a form, and mailbox apps (Gmail, Apple Mail) post "List-Unsubscribe=One-Click"
  // to the link in the email's header, where the lead and token ride in the query string.
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const oneClick = String(form?.get("List-Unsubscribe") ?? "") === "One-Click";
  const leadId = String(form?.get("lead") ?? url.searchParams.get("lead") ?? "");
  const token = String(form?.get("token") ?? url.searchParams.get("token") ?? "");
  if (!ObjectId.isValid(leadId) || !verifyUnsubscribeToken(leadId, token)) {
    return oneClick ? NextResponse.json({ ok: false }, { status: 400 }) : back("done=0");
  }

  try {
    const db = await requireDb();
    await db.collection("leads").updateOne({ _id: new ObjectId(leadId) }, { $set: { unsubscribed: true } });
  } catch {
    // If storage is down we still confirm: the visitor's intent is honoured on the next successful retry from the owner side.
  }
  return oneClick ? NextResponse.json({ ok: true }) : back("done=1");
}
