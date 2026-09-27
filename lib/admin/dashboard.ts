import { getDb } from "@/lib/db/mongodb";

export type DashboardStats = {
  totalLeads: number;
  leadsThisWeek: number;
  tierCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  funnel: {
    formStart: number;
    formComplete: number;
    qualified: number;
    nurture: number;
    bookingClick: number;
    whatsappClick: number;
  };
  recentLeads: Array<{
    _id: string;
    name: string;
    businessName: string;
    tier?: string;
    status: string;
    createdAt: Date;
    score?: number;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const db = await getDb();
  if (!db) return null;

  const leads = db.collection("leads");
  const events = db.collection("events");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalLeads, leadsThisWeek, tierAgg, statusAgg, recentLeadsRaw, eventAgg] = await Promise.all([
    leads.countDocuments({}),
    leads.countDocuments({ createdAt: { $gte: weekAgo } }),
    leads.aggregate([{ $group: { _id: "$tier", count: { $sum: 1 } } }]).toArray(),
    leads.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
    leads.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    events
      .aggregate([{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: "$name", count: { $sum: 1 } } }])
      .toArray(),
  ]);

  const tierCounts = Object.fromEntries(tierAgg.map((r) => [String(r._id ?? "unscored"), r.count as number]));
  const statusCounts = Object.fromEntries(statusAgg.map((r) => [String(r._id ?? "unknown"), r.count as number]));
  const eventCounts = Object.fromEntries(eventAgg.map((r) => [String(r._id), r.count as number]));

  return {
    totalLeads,
    leadsThisWeek,
    tierCounts,
    statusCounts,
    funnel: {
      formStart: eventCounts.form_start ?? 0,
      formComplete: eventCounts.form_complete ?? 0,
      qualified: eventCounts.lead_qualified ?? 0,
      nurture: eventCounts.lead_nurture ?? 0,
      bookingClick: eventCounts.booking_click ?? 0,
      whatsappClick: eventCounts.whatsapp_click ?? 0,
    },
    recentLeads: recentLeadsRaw.map((l) => ({
      _id: l._id.toString(),
      name: l.name ?? "Unknown",
      businessName: l.businessName ?? "-",
      tier: l.tier,
      status: l.status,
      createdAt: l.createdAt,
      score: l.score,
    })),
  };
}
