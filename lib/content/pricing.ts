import { getDb, requireDb } from "@/lib/db/mongodb";
import { DEFAULT_PRICING, validatePricing, type PricingConfig } from "@/lib/leads/pricing";

type SettingsDoc = { _id: string; config?: PricingConfig };

/**
 * The live pricing tiers. Falls back to the built-in defaults when the database is empty,
 * unreachable, or holds something that fails validation, so the contact form never breaks.
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const db = await getDb();
    const doc = await db?.collection<SettingsDoc>("settings").findOne({ _id: "pricing" });
    if (doc?.config && !validatePricing(doc.config)) return doc.config;
  } catch {
    // Fall through: pricing must never block a lead.
  }
  return DEFAULT_PRICING;
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  const problem = validatePricing(config);
  if (problem) throw new Error(problem);
  const db = await requireDb();
  await db
    .collection<SettingsDoc>("settings")
    .updateOne({ _id: "pricing" }, { $set: { config } }, { upsert: true });
}
