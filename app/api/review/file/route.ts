import { NextResponse } from "next/server";

import { getDb } from "@/lib/db/mongodb";
import { parseLeadRef } from "@/lib/leads/leadRef";
import { allowRequest, clientIp } from "@/lib/rateLimit";
import { MAX_STORED_FILE_BYTES, saveLeadFile } from "@/lib/review/leadFiles";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Keeps the document a visitor shared with their free review, attached to their lead.
 * Only reachable with a signed lead reference, which the review route hands out once a real submission has passed
 * the bot check and the rate limits. One file per lead, 4MB, and only genuine PDF or Word content is accepted.
 */
export async function POST(request: Request) {
  // Cheap checks first, before the body is read.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_STORED_FILE_BYTES + 64 * 1024) {
    return NextResponse.json({ ok: false, error: "File is too large" }, { status: 413 });
  }
  const ip = clientIp(request.headers);
  if (!(await allowRequest(`reviewfile:ip:${ip}`, 6, 86400, { failClosed: true }))) {
    return NextResponse.json({ ok: false, error: "Too many uploads today" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload" }, { status: 400 });
  }
  const leadId = parseLeadRef(String(form.get("leadRef") ?? ""));
  const file = form.get("file");
  if (!leadId || !(file instanceof File)) return NextResponse.json({ ok: false, error: "Invalid upload" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_STORED_FILE_BYTES) return NextResponse.json({ ok: false, error: "File is too large" }, { status: 413 });

  // Only a lead created by the free review can take a file, so a leaked lead reference from another flow is useless here.
  const db = await getDb();
  const lead = await db?.collection("leads").findOne({ _id: new ObjectId(leadId) as never }, { projection: { source: 1 } });
  if (!lead || !/^free-review/.test(String(lead.source ?? ""))) return NextResponse.json({ ok: false, error: "Invalid upload" }, { status: 400 });

  try {
    const saved = await saveLeadFile(leadId, { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) });
    if (saved === "invalid") return NextResponse.json({ ok: false, error: "Please send a PDF or Word (.docx) file" }, { status: 400 });
    if (saved === "exists") return NextResponse.json({ ok: true, kept: true });
    return NextResponse.json({ ok: true, kept: true });
  } catch (error) {
    console.error("[review-file] save failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "Could not keep the file" }, { status: 500 });
  }
}
