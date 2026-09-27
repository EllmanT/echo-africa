import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { generateArticle } from "@/lib/playbook/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** The admin "Generate now" button. Ignores the daily cap: the owner asked for it on purpose. */
export async function POST() {
  const result = await generateArticle("manual");
  if (result.status === "published") {
    revalidatePath("/playbook");
    revalidatePath(`/playbook/${result.slug}`);
  }
  return NextResponse.json({ ok: result.status !== "failed", ...result });
}
