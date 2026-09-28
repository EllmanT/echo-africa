import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRICING,
  fillTokens,
  formatRange,
  primaryContext,
  tailorTiers,
  validatePricing,
  type PricingConfig,
} from "./pricing";

const clone = (): PricingConfig => JSON.parse(JSON.stringify(DEFAULT_PRICING));

describe("default pricing", () => {
  it("is valid", () => {
    expect(validatePricing(DEFAULT_PRICING)).toBeNull();
  });

  it("uses the agreed ranges and highlights the middle tier of each ladder", () => {
    expect(DEFAULT_PRICING.standard.map(formatRange)).toEqual(["$500 to $1,000", "$1,000 to $5,000", "$5,000+"]);
    expect(DEFAULT_PRICING.logo.map(formatRange)).toEqual(["$50 to $100", "$100 to $500", "$500+"]);
    expect(DEFAULT_PRICING.standard.map((t) => t.highlight)).toEqual([false, true, false]);
    expect(DEFAULT_PRICING.logo.map((t) => t.highlight)).toEqual([false, true, false]);
  });

  it("never uses em or en dashes in copy", () => {
    expect(JSON.stringify(DEFAULT_PRICING)).not.toMatch(/[–—]/);
  });

  it("keeps every card short enough not to overwhelm", () => {
    for (const set of [DEFAULT_PRICING.standard, DEFAULT_PRICING.logo]) {
      for (const tier of set) {
        for (const bullets of Object.values(tier.includes)) expect(bullets!.length).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe("tailoring", () => {
  it("fills the visitor's business and goal into the copy", () => {
    expect(fillTokens("Help {business} {goal}.", { business: "Moyo Motors", goal: "more-customers" })).toBe(
      "Help Moyo Motors get more customers."
    );
    expect(fillTokens("Help {business} {goal}.", {})).toBe("Help your business grow.");
  });

  it("picks the bullets for the service the visitor chose, and stacks on the tier below", () => {
    const tiers = tailorTiers(DEFAULT_PRICING.standard, primaryContext(["ai-automation"]), {});
    expect(tiers[0].bullets[0]).toMatch(/automation/i);
    expect(tiers[0].stacksOn).toBeNull();
    expect(tiers[1].stacksOn).toBe("Starter");
  });

  it("leads with the website when several services are picked, and falls back for 'not sure'", () => {
    expect(primaryContext(["logo", "ai-automation", "website"])).toBe("website");
    expect(primaryContext(["not-sure"])).toBe("default");
  });

  it("falls back to the generic bullets when a service has none", () => {
    const cfg = clone();
    delete cfg.standard[0].includes.website;
    const tiers = tailorTiers(cfg.standard, "website", {});
    expect(tiers[0].bullets[0]).toBe("We recommend what will help your business most");
  });
});

describe("validatePricing", () => {
  it("rejects two highlighted tiers", () => {
    const cfg = clone();
    cfg.standard[0].highlight = true;
    expect(validatePricing(cfg)).toMatch(/highlighted/);
  });
  it("rejects a top price at or below the bottom price", () => {
    const cfg = clone();
    cfg.standard[1].maxUsd = 900;
    expect(validatePricing(cfg)).toMatch(/top price/);
  });
  it("rejects tiers that are out of order", () => {
    const cfg = clone();
    cfg.logo[2].minUsd = 10;
    expect(validatePricing(cfg)).toMatch(/cheapest to dearest/);
  });
  it("requires generic bullets so no visitor sees an empty card", () => {
    const cfg = clone();
    cfg.logo[0].includes = {};
    expect(validatePricing(cfg)).toMatch(/at least one/);
  });
});
