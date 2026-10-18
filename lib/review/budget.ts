import { getDb } from "@/lib/db/mongodb";
import { startOfMonthUtc } from "@/lib/playbook/budget";

/** Separate from the article engine's budget so neither can starve the other. Override with REVIEW_MONTHLY_BUDGET_USD. */
export function reviewMonthlyBudgetUsd(): number {
  const n = Number(process.env.REVIEW_MONTHLY_BUDGET_USD ?? 2);
  return Number.isFinite(n) && n >= 0 ? n : 2;
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
export async function reviewHasBudget(): Promise<boolean> {
  const cap = reviewMonthlyBudgetUsd();
  if (cap <= 0) return false;
  return (await reviewSpendThisMonthUsd()) < cap;
}
