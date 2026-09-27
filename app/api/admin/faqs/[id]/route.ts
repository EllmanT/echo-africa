import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteFaq, updateFaq } from "@/lib/admin/faqs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  question: z.string().min(3).max(200).optional(),
  answer: z.string().min(3).max(2000).optional(),
  published: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  try {
    await updateFaq(params.id, parsed.data);
    revalidatePath("/work");
    revalidatePath("/contact");
    revalidatePath("/work/[slug]", "page");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not save" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteFaq(params.id);
    revalidatePath("/work");
    revalidatePath("/contact");
    revalidatePath("/work/[slug]", "page");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not delete" }, { status: 400 });
  }
}
