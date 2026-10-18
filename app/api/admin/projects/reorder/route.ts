import { requireAdmin } from "@/lib/security/adminGuard";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { reorderAdminProjects } from "@/lib/admin/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ slugs: z.array(z.string()).min(1) });

export async function POST(request: Request) {
  const denied = await requireAdmin("POST");
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid order" }, { status: 400 });
  await reorderAdminProjects(parsed.data.slugs);
  revalidatePath("/work");
  return NextResponse.json({ ok: true });
}
