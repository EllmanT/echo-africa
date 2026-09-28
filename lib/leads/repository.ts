import { ObjectId } from "mongodb";

import { requireDb } from "@/lib/db/mongodb";
import type { LeadInput } from "./schema";
import type { LeadStatus, LeadTier } from "./types";

export type LeadDoc = Partial<LeadInput> & {
  _id?: ObjectId;
  status: LeadStatus;
  tier?: LeadTier;
  score?: number;
  /** Snapshot of the chosen price range as the visitor saw it, so later admin edits do not rewrite history. */
  budgetLabel?: string;
  budgetMinUsd?: number;
  /** Which ladder they were shown: "standard" or "logo". */
  budgetSet?: string;
  /** Name of the tier they chose, for example "Growth". */
  budgetTierName?: string;
  source?: string;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  emailsSent?: { type: string; at: Date; ok: boolean }[];
  /** True once the lead has clicked an unsubscribe link. Nurture emails stop; the two transactional emails on submit already happened by then. */
  unsubscribed?: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
};

function toObjectId(id?: string): ObjectId | null {
  return id && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/** Create or update a lead. Returns the id as a string. */
export async function upsertLead(
  leadId: string | undefined,
  fields: Partial<LeadDoc>
): Promise<string> {
  const db = await requireDb();
  const col = db.collection<LeadDoc>("leads");
  const now = new Date();
  const existing = toObjectId(leadId);

  if (existing) {
    const res = await col.findOneAndUpdate(
      { _id: existing },
      { $set: { ...fields, updatedAt: now } },
      { returnDocument: "after" }
    );
    if (res) return existing.toHexString();
  }

  const inserted = await col.insertOne({
    status: "partial",
    createdAt: now,
    ...fields,
    updatedAt: now,
  } as LeadDoc);
  return inserted.insertedId.toHexString();
}

export async function recordEmail(leadId: string, type: string, ok: boolean) {
  const oid = toObjectId(leadId);
  if (!oid) return;
  try {
    const db = await requireDb();
    await db
      .collection<LeadDoc>("leads")
      .updateOne({ _id: oid }, { $push: { emailsSent: { type, at: new Date(), ok } } });
  } catch {
    // Logging an email outcome is best effort.
  }
}
