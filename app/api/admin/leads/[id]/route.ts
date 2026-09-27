import { NextResponse } from "next/server";
import { z } from "zod";

import { updateLeadAdmin } from "@/lib/admin/leads";
import { LEAD_STATUSES } from "@/lib/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  internalNotes: z.string().max(4000).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  }
  try {
    await updateLeadAdmin(params.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not save" },
      { status: 400 }
    );
  }
}
