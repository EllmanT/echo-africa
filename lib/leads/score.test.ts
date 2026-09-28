import { describe, expect, it } from "vitest";
import { scoreLead, type ScoredTier } from "./score";
import { DEFAULT_PRICING, findTier, pricingSetFor } from "./pricing";
import type { Service } from "./types";

const base = {
  services: ["website"] as Service[],
  timing: "asap" as const,
  role: "owner" as const,
  businessName: "Acme",
  businessDescription: "We sell farm equipment across Harare.",
  website: "acme.co.zw",
};

const pick = (services: Service[], key: string): ScoredTier => findTier(DEFAULT_PRICING, services, key);

describe("pricingSetFor", () => {
  it("gives logo-only visitors the logo ladder", () => {
    expect(pricingSetFor(["logo"])).toBe("logo");
  });
  it("gives logo plus anything else the standard ladder", () => {
    expect(pricingSetFor(["logo", "website"])).toBe("standard");
    expect(pricingSetFor(["website"])).toBe("standard");
    expect(pricingSetFor(["not-sure"])).toBe("standard");
  });
});

describe("findTier", () => {
  it("does not accept a logo tier for a website lead, or the reverse", () => {
    expect(findTier(DEFAULT_PRICING, ["website"], "logo-50-100")).toBeNull();
    expect(findTier(DEFAULT_PRICING, ["logo"], "1000-5000")).toBeNull();
  });
});

describe("scoreLead", () => {
  it("marks the middle tier as qualified when the profile is average", () => {
    const r = scoreLead({ ...base, role: "gathering-info", timing: "exploring" }, pick(base.services, "1000-5000"));
    expect(r.tier).toBe("qualified");
  });

  it("makes the middle tier priority when the profile is very strong", () => {
    const r = scoreLead(base, pick(base.services, "1000-5000"));
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.tier).toBe("priority");
  });

  it("marks the top tier priority at a strong score", () => {
    expect(scoreLead(base, pick(base.services, "5000-plus")).tier).toBe("priority");
  });

  it("marks the entry tier qualified but never priority", () => {
    expect(scoreLead(base, pick(base.services, "500-1000")).tier).toBe("qualified");
  });

  it("does not make a big budget priority when the rest is weak", () => {
    const r = scoreLead(
      { services: ["not-sure"], timing: "exploring", role: "gathering-info" },
      pick(["not-sure"], "5000-plus")
    );
    expect(r.tier).toBe("qualified");
  });

  it("never tosses a logo-only lead, even at the cheapest logo tier", () => {
    const logo: Service[] = ["logo"];
    const r = scoreLead({ ...base, services: logo }, pick(logo, "logo-50-100"));
    expect(r.tier).toBe("qualified");
  });

  it("scores a top logo tier like a top standard tier", () => {
    const logo: Service[] = ["logo"];
    const logoTop = scoreLead({ ...base, services: logo }, pick(logo, "logo-500-plus"));
    const stdTop = scoreLead({ ...base, services: logo }, pick(["website"], "5000-plus"));
    expect(logoTop.score).toBe(stdTop.score);
    expect(logoTop.tier).toBe("priority");
  });

  it("sends an unknown or unqualified tier to nurture", () => {
    expect(scoreLead(base, null).tier).toBe("nurture");
    const off: ScoredTier = { tier: { qualified: false, priorityScore: null }, position: 0, count: 3 };
    expect(scoreLead(base, off).tier).toBe("nurture");
  });

  it("respects an admin who removes the priority flag", () => {
    const off: ScoredTier = { tier: { qualified: true, priorityScore: null }, position: 2, count: 3 };
    expect(scoreLead(base, off).tier).toBe("qualified");
  });
});
