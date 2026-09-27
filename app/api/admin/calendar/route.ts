import { NextResponse } from "next/server";
import { z } from "zod";

import { getCalendarConfig, saveCalendarConfig } from "@/lib/playbook/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  pillars: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        guidance: z.string().min(1),
        weight: z.number().min(0).max(100),
      })
    )
    .min(1),
  regionWeights: z.object({
    zimbabwe: z.number().min(0).max(100),
    africa: z.number().min(0).max(100),
    global: z.number().min(0).max(100),
  }),
});

export async function GET() {
  const config = await getCalendarConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Check the values and try again" }, { status: 400 });
  await saveCalendarConfig(parsed.data);
  return NextResponse.json({ ok: true });
}
