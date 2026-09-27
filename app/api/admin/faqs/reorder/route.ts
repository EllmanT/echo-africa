import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { reorderFaqs } from "@/lib/admin/faqs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ ids: z.array(z.string()).min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid order" }, { status: 400 });
  await reorderFaqs(parsed.data.ids);
  revalidatePath("/work");
  revalidatePath("/contact");
  revalidatePath("/work/[slug]", "page");
  return NextResponse.json({ ok: true });
}
