import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteAdminPost, getAdminPost, upsertAdminPost } from "@/lib/admin/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const post = await getAdminPost(params.slug);
  if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  await upsertAdminPost(params.slug, parsed.data);
  revalidatePath("/playbook");
  revalidatePath(`/playbook/${params.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  await deleteAdminPost(params.slug);
  revalidatePath("/playbook");
  return NextResponse.json({ ok: true });
}
