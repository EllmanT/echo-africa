import { getDb } from "@/lib/db/mongodb";
import { startOfMonthUtc } from "@/lib/playbook/budget";

/** Separate from the article engine's budget so neither can starve the other. Override with REVIEW_MONTHLY_BUDGET_USD. */
export function reviewMonthlyBudgetUsd(): number {
  const n = Number(process.env.REVIEW_MONTHLY_BUDGET_USD ?? 2);
  return Number.isFinite(n) && n >= 0 ? n : 2;
}

/** Reviews the whole site will produce in a day unless the admin changes it. */
export const DEFAULT_REVIEW_DAILY_CAP = 40;

export type ReviewUsage = { spendUsd: number; sentToday: number; sentThisMonth: number; failedThisMonth: number };

/** What the review has cost and produced, for the admin dashboard. */
export async function reviewUsage(now = new Date()): Promise<ReviewUsage> {
  const db = await getDb();
  if (!db) return { spendUsd: 0, sentToday: 0, sentThisMonth: 0, failedThisMonth: 0 };
  const monthStart = startOfMonthUtc(now);
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const col = db.collection("aiUsage");
  const [spend, sentToday, sentThisMonth, failedThisMonth] = await Promise.all([
    reviewSpendThisMonthUsd(now),
    col.countDocuments({ kind: "review", ok: true, at: { $gte: dayStart } }),
    col.countDocuments({ kind: "review", ok: true, at: { $gte: monthStart } }),
    col.countDocuments({ kind: "review", ok: false, at: { $gte: monthStart } }),
  ]);
  return { spendUsd: spend, sentToday, sentThisMonth, failedThisMonth };
}

/** Kill switch: set REVIEW_ENABLED=false in Vercel to turn the AI review off instantly (visitors get the human-reply path). */
export function reviewEnabled(): boolean {
  return process.env.REVIEW_ENABLED !== "false";
}

export async function reviewSpendThisMonthUsd(now = new Date()): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .collection("aiUsage")
    .aggregate<{ total: number }>([{ $match: { kind: "review", at: { $gte: startOfMonthUtc(now) } } }, { $group: { _id: null, total: { $sum: "$costUsd" } } }])
    .toArray();
  return rows[0]?.total ?? 0;
}

export async function recordReviewUsage(costUsd: number, ok: boolean): Promise<void> {
  try {
    const db = await getDb();
    await db?.collection("aiUsage").insertOne({ kind: "review", costUsd, ok, at: new Date() });
  } catch {
    // Accounting must never break the request.
  }
}

/** True while this month's spend is under the cap. A 0 budget means "AI off". */
export async function reviewHasBudget(cap = reviewMonthlyBudgetUsd()): Promise<boolean> {
  if (cap <= 0) return false;
  return (await reviewSpendThisMonthUsd()) < cap;
}
