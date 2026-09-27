import { requireDb } from "@/lib/db/mongodb";
import type { LeadDoc } from "@/lib/leads/repository";
import { sendMail } from "@/lib/email/send";
import { NURTURE_STEPS, PARTIAL_STEPS } from "@/lib/email/nurture-templates";

export type NurtureSweepResult = {
  checkedPartial: number;
  checkedActive: number;
  sent: { leadId: string; type: string; ok: boolean }[];
  errors: string[];
};

export const hoursSince = (date: Date): number => (Date.now() - date.getTime()) / (1000 * 60 * 60);

/** Pure: which step (if any) is next due, given what has already been sent and how much time has passed. Oldest-due first, one at a time. */
export function pickDueStep<T extends { type: string; afterHours: number }>(
  steps: readonly T[],
  sentTypes: string[],
  hoursElapsed: number
): T | null {
  for (const step of steps) {
    if (sentTypes.includes(step.type)) continue;
    if (hoursElapsed < step.afterHours) continue;
    return step;
  }
  return null;
}

/**
 * Runs one pass over all leads and sends whichever nurture email is due.
 * Idempotent: a step is only ever sent once per lead, tracked in
 * lead.emailsSent. Safe to call as often as the cron schedule likes.
 */
export async function runNurtureSweep(): Promise<NurtureSweepResult> {
  const db = await requireDb();
  const leads = db.collection<LeadDoc & { _id: import("mongodb").ObjectId }>("leads");
  const result: NurtureSweepResult = { checkedPartial: 0, checkedActive: 0, sent: [], errors: [] };

  // Abandoned partial submissions: nudge at 1h and 24h, then stop.
  const partialLeads = await leads.find({ status: "partial", unsubscribed: { $ne: true } }).toArray();
  result.checkedPartial = partialLeads.length;

  for (const lead of partialLeads) {
    if (!lead.email) continue;
    const sentTypes = (lead.emailsSent ?? []).map((e) => e.type);
    const step = pickDueStep(PARTIAL_STEPS, sentTypes, hoursSince(lead.createdAt));
    if (!step) continue;
    try {
      const mail = step.build(lead, lead._id.toString());
      const ok = await sendMail(mail);
      await leads.updateOne({ _id: lead._id }, { $push: { emailsSent: { type: step.type, at: new Date(), ok } } });
      result.sent.push({ leadId: lead._id.toString(), type: step.type, ok });
    } catch (error) {
      result.errors.push(`${lead._id.toString()} ${step.type}: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Completed leads still open (not yet booked, won or lost): the day 1/3/6/10 sequence.
  const activeLeads = await leads
    .find({ status: { $in: ["new", "contacted", "nurture"] }, unsubscribed: { $ne: true }, completedAt: { $exists: true } })
    .toArray();
  result.checkedActive = activeLeads.length;

  for (const lead of activeLeads) {
    if (!lead.email || !lead.completedAt) continue;
    const sentTypes = (lead.emailsSent ?? []).map((e) => e.type);
    const step = pickDueStep(NURTURE_STEPS, sentTypes, hoursSince(lead.completedAt));
    if (!step) continue;
    try {
      const mail = step.build(lead, lead._id.toString());
      const ok = await sendMail(mail);
      await leads.updateOne({ _id: lead._id }, { $push: { emailsSent: { type: step.type, at: new Date(), ok } } });
      result.sent.push({ leadId: lead._id.toString(), type: step.type, ok });
    } catch (error) {
      result.errors.push(`${lead._id.toString()} ${step.type}: ${error instanceof Error ? error.message : error}`);
    }
  }

  return result;
}
