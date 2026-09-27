import { Suspense } from "react";

import { listLeads } from "@/lib/admin/leads";
import LeadsExplorer from "@/components/admin/LeadsExplorer";

export const dynamic = "force-dynamic";

const LeadsPage = async ({
  searchParams,
}: {
  searchParams: { tier?: string; status?: string; q?: string };
}) => {
  const leads = await listLeads({
    tier: searchParams.tier,
    status: searchParams.status,
    q: searchParams.q,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everyone who has filled in the form, newest first.</p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <LeadsExplorer leads={leads} />
        </Suspense>
      </div>
    </div>
  );
};

export default LeadsPage;
