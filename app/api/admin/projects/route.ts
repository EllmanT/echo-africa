import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { listAdminProjects, upsertAdminProject } from "@/lib/admin/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  order: z.number().optional(),
  published: z.boolean().default(true),
  client: z.string().min(1),
  category: z.enum(["Website", "Logo & Brand Identity"]),
  location: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  resultLine: z.string().min(1),
  heroStats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  problemHeadline: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  solutionPoints: z.array(z.string()).default([]),
  outcomeHeadline: z.string().min(1),
  outcome: z.string().min(1),
  // Advanced/raw: the admin form's chart editor sends whatever JSON it parsed.
  // Real shape is ChartSpec[] (see data/case-studies.ts); not re-validated here.
  results: z.any().optional(),
  image: z.string().min(1),
  link: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET() {
  const projects = await listAdminProjects();
  return NextResponse.json({ ok: true, projects });
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the required fields", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    await upsertAdminProject(parsed.data.slug, parsed.data);
    revalidatePath("/work");
    revalidatePath(`/work/${parsed.data.slug}`);
    return NextResponse.json({ ok: true, slug: parsed.data.slug });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not save" }, { status: 500 });
  }
}
