import { getDb } from "@/lib/db/mongodb";

/** Default monthly ceiling for the article engine, in US dollars. Editable in the admin settings. */
export const DEFAULT_MONTHLY_BUDGET_USD = 1;

/** First moment of the current month, in UTC. The budget resets then. */
export function startOfMonthUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** What the article engine has actually cost so far this month, from the usage each run recorded. */
export async function monthlySpendUsd(now = new Date()): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .collection("jobRuns")
    .aggregate<{ total: number }>([
      { $match: { startedAt: { $gte: startOfMonthUtc(now) }, costUsd: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$costUsd" } } },
    ])
    .toArray();
  return rows[0]?.total ?? 0;
}

/**
 * True when there is still room for another article. Compared against the budget itself, so a run that
 * starts just under the cap can overshoot by at most one article (a few cents).
 */
export function hasBudget(spentUsd: number, budgetUsd: number): boolean {
  return spentUsd < budgetUsd;
}
