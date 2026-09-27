import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db/mongodb";
import { allowRequest, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = [
  "form_start",
  "form_step",
  "form_complete",
  "lead_qualified",
  "lead_nurture",
  "booking_click",
  "whatsapp_click",
] as const;

const eventSchema = z.object({
  name: z.enum(ALLOWED),
  sessionId: z.string().max(64),
  step: z.number().int().min(0).max(10).optional(),
  path: z.string().max(200).optional(),
});

/** Lightweight funnel events for the admin dashboard. Always answers 204. */
export async function POST(request: Request) {
  try {
    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    if (!(await allowRequest(`evt:${clientIp(request.headers)}`, 120, 3600))) {
      return new NextResponse(null, { status: 204 });
    }

    const db = await getDb();
    await db?.collection("events").insertOne({ ...parsed.data, createdAt: new Date() });
  } catch {
    // Analytics must never surface errors.
  }
  return new NextResponse(null, { status: 204 });
}
