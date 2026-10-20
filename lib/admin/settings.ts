import { getDb, requireDb } from "@/lib/db/mongodb";
import { DEFAULT_MONTHLY_BUDGET_USD } from "@/lib/playbook/budget";
import { DEFAULT_REVIEW_DAILY_CAP, reviewMonthlyBudgetUsd } from "@/lib/review/budget";

export type AdminSettings = {
  notifyEmail: string;
  /** Stops the automated Playbook pipeline after this many published articles in a day. */
  dailyGenerationCap: number;
  /** Hard monthly ceiling for the article engine, in USD. Once the month's real spend reaches it, no more articles are written until next month. */
  monthlyBudgetUsd: number;
  /** Master switch for the instant review. Off means visitors are told a person will reply. */
  reviewEnabled: boolean;
  /** Most reviews the whole site will produce in one day, whoever asks. */
  reviewDailyCap: number;
  /** Hard monthly ceiling for review spend, in USD. */
  reviewMonthlyBudgetUsd: number;
};

type SettingsDoc = { _id: string; [key: string]: unknown };

export async function getAdminSettings(): Promise<AdminSettings> {
  const db = await getDb();
  const col = db?.collection<SettingsDoc>("settings");
  const [scoreDoc, notifyDoc, reviewDoc] = await Promise.all([
    col?.findOne({ _id: "leads" }),
    col?.findOne({ _id: "notifications" }),
    col?.findOne({ _id: "review" }),
  ]);

  return {
    notifyEmail:
      typeof notifyDoc?.notifyEmail === "string" && notifyDoc.notifyEmail
        ? notifyDoc.notifyEmail
        : (process.env.LEAD_NOTIFY_EMAIL ?? ""),
    dailyGenerationCap: typeof scoreDoc?.dailyGenerationCap === "number" ? scoreDoc.dailyGenerationCap : 1,
    monthlyBudgetUsd:
      typeof scoreDoc?.monthlyBudgetUsd === "number" ? scoreDoc.monthlyBudgetUsd : DEFAULT_MONTHLY_BUDGET_USD,
    // The env kill switch always wins: REVIEW_ENABLED=false turns the review off whatever the admin says.
    reviewEnabled: process.env.REVIEW_ENABLED === "false" ? false : reviewDoc?.enabled !== false,
    reviewDailyCap: typeof reviewDoc?.dailyCap === "number" ? reviewDoc.dailyCap : DEFAULT_REVIEW_DAILY_CAP,
    reviewMonthlyBudgetUsd: typeof reviewDoc?.monthlyBudgetUsd === "number" ? reviewDoc.monthlyBudgetUsd : reviewMonthlyBudgetUsd(),
  };
}

export async function saveAdminSettings(input: AdminSettings): Promise<void> {
  const db = await requireDb();
  const col = db.collection<SettingsDoc>("settings");
  await Promise.all([
    col.updateOne(
      { _id: "leads" },
      {
        $set: {
          dailyGenerationCap: input.dailyGenerationCap,
          monthlyBudgetUsd: input.monthlyBudgetUsd,
        },
      },
      { upsert: true }
    ),
    col.updateOne(
      { _id: "review" },
      { $set: { enabled: input.reviewEnabled, dailyCap: input.reviewDailyCap, monthlyBudgetUsd: input.reviewMonthlyBudgetUsd } },
      { upsert: true }
    ),
    col.updateOne({ _id: "notifications" }, { $set: { notifyEmail: input.notifyEmail } }, { upsert: true }),
  ]);
}
