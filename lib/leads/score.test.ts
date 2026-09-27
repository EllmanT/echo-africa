import { describe, expect, it } from "vitest";
import { scoreLead } from "./score";
import type { Service } from "./types";

const base = {
  services: ["website"] as Service[],
  timing: "asap" as const,
  role: "owner" as const,
  businessName: "Acme",
  businessDescription: "We sell farm equipment across Harare.",
  website: "acme.co.zw",
};

describe("scoreLead", () => {
  it("marks $2k+ budgets with a strong score as priority", () => {
    const r = scoreLead({ ...base, budget: "2500-5000" });
    expect(r.tier).toBe("priority");
    expect(r.score).toBeGreaterThanOrEqual(70);
  });

  it("marks $500 to $1,000 budgets as qualified", () => {
    expect(scoreLead({ ...base, budget: "500-1000" }).tier).toBe("qualified");
  });

  it("sends anything under the floor to nurture, even with a strong profile", () => {
    expect(scoreLead({ ...base, budget: "under-500" }).tier).toBe("nurture");
  });

  it("does not make a big budget priority when the rest is weak", () => {
    const r = scoreLead({
      services: ["not-sure"],
      budget: "5000-plus",
      timing: "exploring",
      role: "gathering-info",
    });
    expect(r.tier).toBe("qualified");
  });

  it("respects an admin-changed floor", () => {
    const r = scoreLead(
      { ...base, budget: "500-1000" },
      { budgetFloor: 1000, priorityBudget: 2000 }
    );
    expect(r.tier).toBe("nurture");
  });
});
