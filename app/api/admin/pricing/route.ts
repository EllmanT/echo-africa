import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { savePricingConfig } from "@/lib/content/pricing";
import { validatePricing, type PricingConfig } from "@/lib/leads/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bullets = z.array(z.string().trim().min(1).max(160)).max(8);

const includes = z
  .object({
    default: bullets.optional(),
    website: bullets.optional(),
    "ai-automation": bullets.optional(),
    integration: bullets.optional(),
    "custom-software": bullets.optional(),
  })
  .strict();

const tier = z.object({
  key: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(40),
  minUsd: z.number().min(0).max(1_000_000),
  maxUsd: z.number().min(0).max(1_000_000).nullable(),
  badge: z.string().trim().max(40),
  highlight: z.boolean(),
  promise: z.string().trim().min(1).max(200),
  speed: z.string().trim().max(60),
  includes,
  qualified: z.boolean(),
  booking: z.boolean(),
  priorityScore: z.number().int().min(0).max(100).nullable(),
});

const schema = z.object({
  standard: z.array(tier).min(2).max(4),
  logo: z.array(tier).min(2).max(4),
  guarantee: z.string().trim().min(1).max(240),
});

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the values and try again" }, { status: 400 });
  }
  const config = parsed.data as PricingConfig;
  const problem = validatePricing(config);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 });

  try {
    await savePricingConfig(config);
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not save" },
      { status: 500 }
    );
  }
}
