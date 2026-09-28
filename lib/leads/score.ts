import type { LeadTier, Role, Service, Timing } from "./types";
import type { PricingTier } from "./pricing";

export type ScoreInput = {
  services: Service[];
  timing: Timing;
  role: Role;
  businessName?: string;
  businessDescription?: string;
  website?: string;
};

/** The tier the visitor picked, plus where it sits in its ladder. Null when the key is unknown. */
export type ScoredTier = {
  tier: Pick<PricingTier, "qualified" | "priorityScore">;
  position: number;
  count: number;
} | null;

/**
 * Budget points depend on the tier's position, not its dollar amount, so a logo-only lead
 * who picks the top logo tier scores like any other lead at the top of their ladder.
 * Bottom tier 20, top tier 40, evenly spaced between.
 */
function budgetPoints(position: number, count: number): number {
  if (count <= 1) return 30;
  return Math.round(20 + (position * 20) / (count - 1));
}

const TIMING_POINTS: Record<Timing, number> = {
  asap: 20,
  "one-month": 15,
  "three-months": 8,
  exploring: 2,
};

const ROLE_POINTS: Record<Role, number> = {
  owner: 15,
  "decision-maker": 13,
  "gathering-info": 3,
};

export function scoreLead(input: ScoreInput, picked: ScoredTier): { score: number; tier: LeadTier } {
  let score = (picked ? budgetPoints(picked.position, picked.count) : 0) + TIMING_POINTS[input.timing] + ROLE_POINTS[input.role];

  // Service fit: they know what they want and it is something we sell.
  const concrete = input.services.filter((s) => s !== "not-sure");
  score += concrete.length === 0 ? 4 : concrete.length === 1 ? 12 : 15;

  // Business signal: a real, describable business already exists.
  if (input.businessName?.trim()) score += 3;
  if ((input.businessDescription?.trim().length ?? 0) >= 20) score += 4;
  if (input.website?.trim()) score += 3;

  let tier: LeadTier = "nurture";
  if (picked?.tier.qualified) tier = "qualified";
  if (picked?.tier.qualified && picked.tier.priorityScore !== null && score >= picked.tier.priorityScore) tier = "priority";

  return { score, tier };
}
