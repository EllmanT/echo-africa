import type { Budget, LeadTier, Role, Service, Timing } from "./types";
import { BUDGET_MIN_USD } from "./types";

export type ScoreInput = {
  services: Service[];
  budget: Budget;
  timing: Timing;
  role: Role;
  businessName?: string;
  businessDescription?: string;
  website?: string;
};

export type ScoreSettings = {
  /** Minimum budget in USD to count as qualified. */
  budgetFloor: number;
  /** Minimum budget in USD (and a score of 70) to count as priority. */
  priorityBudget: number;
};

export const DEFAULT_SCORE_SETTINGS: ScoreSettings = {
  budgetFloor: 500,
  priorityBudget: 2000,
};

const BUDGET_POINTS: Record<Budget, number> = {
  "under-500": 0,
  "500-1000": 20,
  "1000-2500": 30,
  "2500-5000": 36,
  "5000-plus": 40,
};

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

export function scoreLead(
  input: ScoreInput,
  settings: ScoreSettings = DEFAULT_SCORE_SETTINGS
): { score: number; tier: LeadTier } {
  let score = BUDGET_POINTS[input.budget] + TIMING_POINTS[input.timing] + ROLE_POINTS[input.role];

  // Service fit: they know what they want and it is something we sell.
  const concrete = input.services.filter((s) => s !== "not-sure");
  score += concrete.length === 0 ? 4 : concrete.length === 1 ? 12 : 15;

  // Business signal: a real, describable business already exists.
  if (input.businessName?.trim()) score += 3;
  if ((input.businessDescription?.trim().length ?? 0) >= 20) score += 4;
  if (input.website?.trim()) score += 3;

  const budgetUsd = BUDGET_MIN_USD[input.budget];
  let tier: LeadTier = "nurture";
  if (budgetUsd >= settings.budgetFloor) tier = "qualified";
  if (budgetUsd >= settings.priorityBudget && score >= 70) tier = "priority";

  return { score, tier };
}
