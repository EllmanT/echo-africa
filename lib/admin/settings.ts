import { getDb, requireDb } from "@/lib/db/mongodb";
import { DEFAULT_SCORE_SETTINGS } from "@/lib/leads/score";

export type AdminSettings = {
  budgetFloor: number;
  priorityBudget: number;
  notifyEmail: string;
  /** Stops the automated Playbook pipeline after this many published articles in a day. */
  dailyGenerationCap: number;
};

type SettingsDoc = { _id: string; [key: string]: unknown };

export async function getAdminSettings(): Promise<AdminSettings> {
  const db = await getDb();
  const col = db?.collection<SettingsDoc>("settings");
  const [scoreDoc, notifyDoc] = await Promise.all([
    col?.findOne({ _id: "leads" }),
    col?.findOne({ _id: "notifications" }),
  ]);

  return {
    budgetFloor: typeof scoreDoc?.budgetFloor === "number" ? scoreDoc.budgetFloor : DEFAULT_SCORE_SETTINGS.budgetFloor,
    priorityBudget:
      typeof scoreDoc?.priorityBudget === "number" ? scoreDoc.priorityBudget : DEFAULT_SCORE_SETTINGS.priorityBudget,
    notifyEmail:
      typeof notifyDoc?.notifyEmail === "string" && notifyDoc.notifyEmail
        ? notifyDoc.notifyEmail
        : (process.env.LEAD_NOTIFY_EMAIL ?? ""),
    dailyGenerationCap: typeof scoreDoc?.dailyGenerationCap === "number" ? scoreDoc.dailyGenerationCap : 3,
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
          budgetFloor: input.budgetFloor,
          priorityBudget: input.priorityBudget,
          dailyGenerationCap: input.dailyGenerationCap,
        },
      },
      { upsert: true }
    ),
    col.updateOne({ _id: "notifications" }, { $set: { notifyEmail: input.notifyEmail } }, { upsert: true }),
  ]);
}
