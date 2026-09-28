export const SERVICES = [
  "website",
  "logo",
  "ai-automation",
  "system-integration",
  "custom-software",
  "not-sure",
] as const;
export type Service = (typeof SERVICES)[number];

export const SERVICE_LABELS: Record<Service, string> = {
  website: "A website",
  logo: "A logo and brand",
  "ai-automation": "AI automation",
  "system-integration": "System integration",
  "custom-software": "Custom software",
  "not-sure": "Not sure yet",
};

export const TIMINGS = ["asap", "one-month", "three-months", "exploring"] as const;
export type Timing = (typeof TIMINGS)[number];

export const TIMING_LABELS: Record<Timing, string> = {
  asap: "As soon as possible",
  "one-month": "Within a month",
  "three-months": "In the next 3 months",
  exploring: "Just exploring",
};

export const ROLES = ["owner", "decision-maker", "gathering-info"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "I own the business",
  "decision-maker": "I make the decisions",
  "gathering-info": "I'm gathering info for someone",
};

export const GOALS = [
  "more-customers",
  "look-professional",
  "save-time",
  "sell-online",
  "other",
] as const;
export type Goal = (typeof GOALS)[number];

export const GOAL_LABELS: Record<Goal, string> = {
  "more-customers": "Get more customers",
  "look-professional": "Look more professional",
  "save-time": "Save time on manual work",
  "sell-online": "Sell online",
  other: "Something else",
};

export type LeadTier = "priority" | "qualified" | "nurture";

export const LEAD_STATUSES = [
  "partial",
  "new",
  "contacted",
  "call-booked",
  "won",
  "lost",
  "nurture",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Budgets are now tiers edited in the admin (see pricing.ts), so a lead stores the tier key
 * plus a label snapshot. These labels only cover leads saved before tiers existed.
 */
export const LEGACY_BUDGET_LABELS: Record<string, string> = {
  "under-500": "Under $500",
  "500-1000": "$500 to $1,000",
  "1000-2500": "$1,000 to $2,500",
  "2500-5000": "$2,500 to $5,000",
  "5000-plus": "$5,000 or more",
};

/** What to show for a saved lead's budget: the snapshot, else a legacy label, else the raw key. */
export const budgetDisplay = (lead: { budget?: string; budgetLabel?: string }): string =>
  lead.budgetLabel || (lead.budget ? (LEGACY_BUDGET_LABELS[lead.budget] ?? lead.budget) : "-");
