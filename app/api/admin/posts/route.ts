import { requireAdmin } from "@/lib/security/adminGuard";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { listAdminPosts, upsertAdminPost } from "@/lib/admin/posts";
import { findDisallowedMdxTags } from "@/lib/security/mdx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  content: z.string().min(1),
  published: z.boolean().default(true),
});

export async function GET() {
  const denied = await requireAdmin("GET");
  if (denied) return denied;
  const posts = await listAdminPosts();
  return NextResponse.json({ ok: true, posts });
}

export async function POST(request: Request) {
  const denied = await requireAdmin("POST");
  if (denied) return denied;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the required fields" }, { status: 400 });
  }
  const badTags = parsed.data.content ? findDisallowedMdxTags(parsed.data.content) : [];
  if (badTags.length) {
    return NextResponse.json({ ok: false, error: `These tags are not allowed in articles: ${badTags.join(", ")}` }, { status: 400 });
  }
  await upsertAdminPost(parsed.data.slug, { ...parsed.data, source: "manual" });
  revalidatePath("/playbook");
  revalidatePath(`/playbook/${parsed.data.slug}`);
  return NextResponse.json({ ok: true, slug: parsed.data.slug });
}
