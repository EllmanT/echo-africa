import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteAdminProject, getAdminProject, upsertAdminProject } from "@/lib/admin/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    order: z.number().optional(),
    published: z.boolean().optional(),
    client: z.string().min(1).optional(),
    category: z.enum(["Website", "Logo & Brand Identity"]).optional(),
    location: z.string().min(1).optional(),
    tagline: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    resultLine: z.string().min(1).optional(),
    heroStats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    problemHeadline: z.string().min(1).optional(),
    problem: z.string().min(1).optional(),
    solution: z.string().min(1).optional(),
    solutionPoints: z.array(z.string()).optional(),
    outcomeHeadline: z.string().min(1).optional(),
    outcome: z.string().min(1).optional(),
    results: z.any().optional(),
    image: z.string().min(1).optional(),
    link: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const project = await getAdminProject(params.slug);
  if (!project) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, project });
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  }
  try {
    await upsertAdminProject(params.slug, parsed.data);
    revalidatePath("/work");
    revalidatePath(`/work/${params.slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not save" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  try {
    await deleteAdminProject(params.slug);
    revalidatePath("/work");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not delete" }, { status: 500 });
  }
}
