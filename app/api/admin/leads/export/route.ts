import { listLeads, leadsToCsv } from "@/lib/admin/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const leads = await listLeads({
    tier: url.searchParams.get("tier") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    service: url.searchParams.get("service") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });

  return new Response(leadsToCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="eka-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
