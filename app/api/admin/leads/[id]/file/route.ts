import { requireAdmin } from "@/lib/security/adminGuard";
import { getLeadFile } from "@/lib/review/leadFiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download the document a lead shared with their review. Admin only. */
export async function GET(_request: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin("GET");
  if (denied) return denied;
  const { id } = await paramsPromise;
  const file = await getLeadFile(id);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename="${file.fileName.replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
