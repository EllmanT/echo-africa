import Link from "next/link";

import { getDashboardStats } from "@/lib/admin/dashboard";
import StatCard from "@/components/admin/StatCard";
import { StatusBadge, TierBadge } from "@/components/admin/Badge";

export const dynamic = "force-dynamic";

const FUNNEL_ROWS = [
  { key: "formStart", label: "Started the form" },
  { key: "formComplete", label: "Finished the form" },
  { key: "qualified", label: "Qualified ($500+)" },
  { key: "nurture", label: "Not qualified yet" },
  { key: "bookingClick", label: "Opened the booking calendar" },
  { key: "whatsappClick", label: "Clicked WhatsApp" },
] as const;

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-ZW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const DashboardPage = async () => {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="rounded-2xl border border-dashed border-black/[0.15] p-8 text-center text-muted-foreground">
        MongoDB is not configured yet. Add MONGODB_URI to see live data here.
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">The last 30 days, and everything on record.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={stats.totalLeads} />
        <StatCard label="New this week" value={stats.leadsThisWeek} />
        <StatCard label="Priority" value={stats.tierCounts.priority ?? 0} />
        <StatCard label="Qualified" value={stats.tierCounts.qualified ?? 0} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-bold tracking-tight">Funnel, last 30 days</h2>
          <div className="mt-4 divide-y divide-black/[0.06] rounded-2xl border border-black/[0.08] bg-white">
            {FUNNEL_ROWS.map((row) => (
              <div key={row.key} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold">{stats.funnel[row.key]}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold tracking-tight">Leads by status</h2>
          <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border border-black/[0.08] bg-white p-5">
            {Object.entries(stats.statusCounts).length === 0 && (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            )}
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <span key={status} className="inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-1.5 text-sm">
                <StatusBadge status={status} /> {count}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-purple hover:underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.08] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.08] text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Tier</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {stats.recentLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                    No leads yet. Once your form goes live, they will show up here within seconds.
                  </td>
                </tr>
              )}
              {stats.recentLeads.map((lead) => (
                <tr key={lead._id}>
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads?open=${lead._id}`} className="font-medium hover:text-purple">
                      {lead.businessName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{lead.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <TierBadge tier={lead.tier} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-3">{lead.score ?? "-"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
