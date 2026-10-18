import { findDisallowedMdxTags } from "@/lib/security/mdx";
import { requireAdmin } from "@/lib/security/adminGuard";
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

export async function GET(_request: Request, { params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = await paramsPromise;
  const denied = await requireAdmin("GET");
  if (denied) return denied;
  const post = await getAdminPost(params.slug);
  if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: Request, { params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = await paramsPromise;
  const denied = await requireAdmin("PATCH");
  if (denied) return denied;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  const badTags = parsed.data.content ? findDisallowedMdxTags(parsed.data.content) : [];
  if (badTags.length) {
    return NextResponse.json({ ok: false, error: `These tags are not allowed in articles: ${badTags.join(", ")}` }, { status: 400 });
  }
  await upsertAdminPost(params.slug, parsed.data);
  revalidatePath("/playbook");
  revalidatePath(`/playbook/${params.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = await paramsPromise;
  const denied = await requireAdmin("DELETE");
  if (denied) return denied;
  await deleteAdminPost(params.slug);
  revalidatePath("/playbook");
  return NextResponse.json({ ok: true });
}
