// Tiered pricing shown on the last step of the contact form.
//
// Everything here is plain data and pure functions so the browser, the API and the admin
// can all share it. The live copy is stored in MongoDB and edited at /admin/pricing;
// DEFAULT_PRICING below is what a fresh install (or an empty database) uses.
//
// The default copy follows Hormozi's value equation without overpromising:
//   Dream outcome        -> each tier's `promise`, written around the visitor's own goal
//   Likelihood           -> the shared `guarantee` (they see it before they pay)
//   Time delay           -> `speed`, a short line, never a fixed deadline
//   Effort and sacrifice -> bullets that say what we handle so they do not have to
// Higher tiers only list what they ADD ("Everything in Growth, plus"), so cards stay short.

import { GOAL_LABELS, type Goal, type Service } from "./types";

export const TIER_CONTEXTS = ["default", "website", "ai-automation", "integration", "custom-software"] as const;
export type TierContext = (typeof TIER_CONTEXTS)[number];

export const TIER_CONTEXT_LABELS: Record<TierContext, string> = {
  default: "Not sure yet / anything else",
  website: "Website",
  "ai-automation": "AI automation",
  integration: "System integration",
  "custom-software": "Custom software",
};

export type PricingSetKey = "standard" | "logo";

export type PricingTier = {
  /** Stable id stored on the lead. Never changes once created, so old leads keep their meaning. */
  key: string;
  name: string;
  minUsd: number;
  /** null means "and above". */
  maxUsd: number | null;
  /** Small pill on the card, like "Most businesses land here". Empty for none. */
  badge: string;
  /** The nudged card. One per set at most. */
  highlight: boolean;
  /** One line. Supports {business} and {goal}. */
  promise: string;
  /** Short time line, for example "First look in days". Empty to hide. */
  speed: string;
  /** What this tier ADDS over the one before it, per service context. One bullet per entry. */
  includes: Partial<Record<TierContext, string[]>>;
  /** Counts as a real lead. When false the visitor gets the polite free-resources reply. */
  qualified: boolean;
  /** Show the Cal.com booking calendar after they submit. */
  booking: boolean;
  /** Flag as priority when the lead score reaches this. null means never priority. */
  priorityScore: number | null;
};

export type PricingConfig = {
  standard: PricingTier[];
  logo: PricingTier[];
  /** The risk-reversal line shown under the cards. */
  guarantee: string;
};

// ---------------------------------------------------------------------------
// Which tiers a visitor sees, and how their answers tailor the copy
// ---------------------------------------------------------------------------

/** Logo-only visitors get the logo ladder. Everyone else, including logo plus something, gets the standard one. */
export function pricingSetFor(services: readonly Service[]): PricingSetKey {
  return services.length > 0 && services.every((s) => s === "logo") ? "logo" : "standard";
}

const PRIMARY_ORDER: Service[] = ["website", "ai-automation", "system-integration", "custom-software"];

const CONTEXT_BY_SERVICE: Partial<Record<Service, TierContext>> = {
  website: "website",
  "ai-automation": "ai-automation",
  "system-integration": "integration",
  "custom-software": "custom-software",
};

/** The service whose bullets lead the cards. */
export function primaryContext(services: readonly Service[]): TierContext {
  const primary = PRIMARY_ORDER.find((s) => services.includes(s));
  return (primary && CONTEXT_BY_SERVICE[primary]) || "default";
}

const GOAL_PHRASES: Record<Goal, string> = {
  "more-customers": "get more customers",
  "look-professional": "look more professional",
  "save-time": "save time on manual work",
  "sell-online": "sell online",
  other: "grow",
};

export const goalPhrase = (goal?: Goal): string => (goal ? GOAL_PHRASES[goal] : "grow");
export const goalLabel = (goal?: Goal): string => (goal ? GOAL_LABELS[goal] : "");

/** Replace {business} and {goal} in admin-written copy with the visitor's own words. */
export function fillTokens(text: string, vars: { business?: string; goal?: Goal }): string {
  const business = vars.business?.trim() || "your business";
  return text.replaceAll("{business}", business).replaceAll("{goal}", goalPhrase(vars.goal));
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** "$1,000 to $5,000", or "$5,000+" for an open top tier. */
export function formatRange(tier: Pick<PricingTier, "minUsd" | "maxUsd">): string {
  return tier.maxUsd === null ? `${usd(tier.minUsd)}+` : `${usd(tier.minUsd)} to ${usd(tier.maxUsd)}`;
}

/** The bullets a tier shows for this visitor: their own service first, generic as the fallback. */
export function tierBullets(tier: PricingTier, context: TierContext): string[] {
  return (tier.includes[context]?.length ? tier.includes[context] : tier.includes.default) ?? [];
}

/** A tier's tailored text, ready to render. */
export type TailoredTier = {
  key: string;
  name: string;
  range: string;
  badge: string;
  highlight: boolean;
  promise: string;
  speed: string;
  bullets: string[];
  /** Name of the tier below this one, for the "Everything in X, plus" line. */
  stacksOn: string | null;
};

export function tailorTiers(
  tiers: PricingTier[],
  context: TierContext,
  vars: { business?: string; goal?: Goal }
): TailoredTier[] {
  return tiers.map((tier, i) => ({
    key: tier.key,
    name: tier.name,
    range: formatRange(tier),
    badge: tier.badge,
    highlight: tier.highlight,
    promise: fillTokens(tier.promise, vars),
    speed: tier.speed,
    bullets: tierBullets(tier, context).map((b) => fillTokens(b, vars)),
    stacksOn: i > 0 ? tiers[i - 1].name : null,
  }));
}

/** Where a tier sits in its set, for scoring. */
export function findTier(config: PricingConfig, services: readonly Service[], key: string) {
  const set = pricingSetFor(services);
  const tiers = config[set];
  const position = tiers.findIndex((t) => t.key === key);
  if (position === -1) return null;
  return { set, tier: tiers[position], position, count: tiers.length };
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_PRICING: PricingConfig = {
  guarantee: "We build it first. You see it before you pay, and you pay only when you love it.",

  standard: [
    {
      key: "500-1000",
      name: "Starter",
      minUsd: 500,
      maxUsd: 1000,
      badge: "",
      highlight: false,
      promise: "A solid, professional start so {business} can {goal}.",
      speed: "First look in days",
      qualified: true,
      booking: true,
      priorityScore: null,
      includes: {
        default: [
          "We recommend what will help {business} most",
          "A first version built for you to review",
          "Everything explained in plain words",
        ],
        website: [
          "A clean website that loads fast on mobile data",
          "Clear pages that show what you sell and how to reach you",
          "A WhatsApp button so customers can message you in one tap",
          "We set up your domain and hosting, so you do not have to",
        ],
        "ai-automation": [
          "One repeat task in your business handed over to automation",
          "We map the task with you first, so it fits how you already work",
          "Tested on your real examples before it goes live",
          "A short guide so your team knows how to use it",
        ],
        integration: [
          "Two of your tools connected so information moves on its own",
          "No more typing the same thing in twice",
          "Tested on your real data before it goes live",
        ],
        "custom-software": [
          "One focused tool built around how your team already works",
          "A simple first version you can start using quickly",
          "Works on any phone or computer",
        ],
      },
    },
    {
      key: "1000-5000",
      name: "Growth",
      minUsd: 1000,
      maxUsd: 5000,
      badge: "Most businesses land here",
      highlight: true,
      promise: "Built to help {business} {goal}, and keep doing it.",
      speed: "First look in days",
      qualified: true,
      booking: true,
      priorityScore: 80,
      includes: {
        default: [
          "A fuller solution built around your main goal",
          "Set up to bring in and follow up customers",
          "Help choosing what to add next",
        ],
        website: [
          "Set up to be found on Google when people search for what you sell",
          "Enquiry forms that send new leads straight to your phone or inbox",
          "We write the words for you, so you do not stare at a blank page",
        ],
        "ai-automation": [
          "Several steps connected, not just one task",
          "AI that reads messages, forms or documents for you",
          "You get an alert only when a person is really needed",
        ],
        integration: [
          "More of your systems working together as one flow",
          "Clean information moving the way you need it to",
          "An alert to you if a connection ever breaks",
        ],
        "custom-software": [
          "More features, with a login for each person on your team",
          "Simple reports so you can see what is happening",
          "Connected to your website or the tools you already use",
        ],
      },
    },
    {
      key: "5000-plus",
      name: "Scale",
      minUsd: 5000,
      maxUsd: null,
      badge: "",
      highlight: false,
      promise: "A complete system so {business} can {goal} at a bigger scale.",
      speed: "You see progress early, in stages",
      qualified: true,
      booking: true,
      priorityScore: 70,
      includes: {
        default: [
          "Web, automation and your tools joined into one plan",
          "Built in stages, so you see progress early",
          "Extra care after launch, so you are not left alone",
        ],
        website: [
          "Built around your goal: a catalogue, bookings or online sales",
          "Advanced Google setup and speed tuning",
          "Follow-up on your enquiries done for you automatically",
          "Extra care after launch, so you are not left alone",
        ],
        "ai-automation": [
          "A full workflow across your team, not one corner of it",
          "Connected to the tools you already use",
          "Checked and improved after launch as your team uses it",
        ],
        integration: [
          "Your whole set of tools joined into one flow",
          "A custom connection when a tool has no ready-made link",
          "A simple map of how everything connects, for your records",
        ],
        "custom-software": [
          "A complete system for a key part of your business",
          "Different access levels for a bigger team",
          "Room to grow as your business grows",
        ],
      },
    },
  ],

  logo: [
    {
      key: "logo-50-100",
      name: "Essential",
      minUsd: 50,
      maxUsd: 100,
      badge: "",
      highlight: false,
      promise: "A clean, simple logo so {business} looks like a real business.",
      speed: "First ideas quickly",
      qualified: true,
      booking: false,
      priorityScore: null,
      includes: {
        default: [
          "A logo made for you, not a template",
          "A first idea to react to before you commit",
          "Files ready for your WhatsApp and social media profiles",
        ],
      },
    },
    {
      key: "logo-100-500",
      name: "Standard",
      minUsd: 100,
      maxUsd: 500,
      badge: "Most popular",
      highlight: true,
      promise: "A logo {business} can put on everything, from signboards to invoices.",
      speed: "First ideas quickly",
      qualified: true,
      booking: true,
      priorityScore: null,
      includes: {
        default: [
          "More ideas to choose from, with rounds of changes",
          "Colours and lettering chosen to fit your business",
          "Files for print and screen, ready for signs, invoices and social media",
        ],
      },
    },
    {
      key: "logo-500-plus",
      name: "Brand",
      minUsd: 500,
      maxUsd: null,
      badge: "",
      highlight: false,
      promise: "A full brand so {business} looks serious everywhere it shows up.",
      speed: "First ideas quickly",
      qualified: true,
      booking: true,
      priorityScore: 70,
      includes: {
        default: [
          "A short brand guide: your colours, lettering and how to use the logo",
          "Business card, letterhead and social media designs",
          "Versions that work on light and dark backgrounds, big and small",
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Validation, used when saving from the admin and when reading a stored config
// ---------------------------------------------------------------------------

export function validatePricing(config: PricingConfig): string | null {
  const keys = new Set<string>();
  for (const setKey of ["standard", "logo"] as const) {
    const tiers = config[setKey];
    if (tiers.length < 2 || tiers.length > 4) return `${setKey}: use between 2 and 4 tiers`;
    if (tiers.filter((t) => t.highlight).length > 1) return `${setKey}: only one tier can be highlighted`;
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (!t.key || keys.has(t.key)) return `${setKey}: duplicate or empty tier key`;
      keys.add(t.key);
      if (!t.name.trim()) return `${setKey}: every tier needs a name`;
      if (t.maxUsd !== null && t.maxUsd <= t.minUsd) return `${t.name}: the top price must be above the bottom price`;
      if (i > 0 && t.minUsd < tiers[i - 1].minUsd) return `${t.name}: tiers must go from cheapest to dearest`;
      if (tierBullets(t, "default").length === 0) return `${t.name}: add at least one "Not sure yet / anything else" bullet`;
    }
  }
  return null;
}
