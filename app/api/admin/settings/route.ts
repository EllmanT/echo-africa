import { requireAdmin } from "@/lib/security/adminGuard";
import { NextResponse } from "next/server";
import { z } from "zod";

import { saveAdminSettings } from "@/lib/admin/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  notifyEmail: z.string().email(),
  dailyGenerationCap: z.number().int().min(0).max(20),
  monthlyBudgetUsd: z.number().min(0).max(500),
  reviewEnabled: z.boolean(),
  reviewDailyCap: z.number().int().min(0).max(500),
  reviewMonthlyBudgetUsd: z.number().min(0).max(100),
  digestEnabled: z.boolean(),
  digestHour: z.number().int().min(0).max(23),
  digestDailyCap: z.number().int().min(0).max(1000),
});

export async function PUT(request: Request) {
  const denied = await requireAdmin("PUT");
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the values and try again" }, { status: 400 });
  }
  try {
    await saveAdminSettings(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not save" },
      { status: 500 }
    );
  }
}
