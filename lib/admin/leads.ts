import { ObjectId, type Filter } from "mongodb";

import { getDb, requireDb } from "@/lib/db/mongodb";
import type { LeadDoc } from "@/lib/leads/repository";
import { LEAD_STATUSES, budgetDisplay } from "@/lib/leads/types";

export type AdminLead = LeadDoc & { _id: string };

export type LeadFilters = { tier?: string; status?: string; service?: string; q?: string };

export async function listLeads(filters: LeadFilters = {}): Promise<AdminLead[]> {
  const db = await getDb();
  if (!db) return [];

  const query: Filter<LeadDoc> = {};
  if (filters.tier) query.tier = filters.tier as LeadDoc["tier"];
  if (filters.status) query.status = filters.status as LeadDoc["status"];
  if (filters.service) query.services = filters.service as never;
  if (filters.q) {
    const rx = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: rx }, { businessName: rx }, { email: rx }] as Filter<LeadDoc>["$or"];
  }

  const docs = await db.collection<LeadDoc>("leads").find(query).sort({ createdAt: -1 }).limit(300).toArray();
  return docs.map((d) => ({ ...d, _id: d._id!.toString() }) as AdminLead);
}

export async function getLeadById(id: string): Promise<AdminLead | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  if (!db) return null;
  const doc = await db.collection<LeadDoc>("leads").findOne({ _id: new ObjectId(id) as never });
  if (!doc) return null;
  return { ...doc, _id: doc._id!.toString() } as AdminLead;
}

export async function updateLeadAdmin(
  id: string,
  patch: Partial<Pick<LeadDoc, "status" | "internalNotes" | "tags">>
): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("Invalid lead id");
  if (patch.status && !LEAD_STATUSES.includes(patch.status)) throw new Error("Invalid status");
  const db = await requireDb();
  await db
    .collection<LeadDoc>("leads")
    .updateOne({ _id: new ObjectId(id) as never }, { $set: { ...patch, updatedAt: new Date() } });
}

function csvCell(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(leads: AdminLead[]): string {
  const headers = [
    "createdAt",
    "status",
    "tier",
    "score",
    "name",
    "email",
    "whatsapp",
    "businessName",
    "services",
    "budget",
    "timing",
    "role",
    "goal",
    "website",
    "notes",
    "tags",
  ];
  const rows = leads.map((l) =>
    [
      l.createdAt ? new Date(l.createdAt).toISOString() : "",
      l.status ?? "",
      l.tier ?? "",
      l.score ?? "",
      l.name ?? "",
      l.email ?? "",
      l.whatsapp ?? "",
      l.businessName ?? "",
      (l.services ?? []).join("|"),
      budgetDisplay(l),
      l.timing ?? "",
      l.role ?? "",
      l.goal ?? "",
      l.website ?? "",
      l.notes ?? "",
      (l.tags ?? []).join("|"),
    ]
      .map(csvCell)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
