import { describe, expect, it } from "vitest";

import { normalizeDashes } from "./format";

const EM = "—";
const EN = "–";

describe("normalizeDashes", () => {
  it("turns an em dash into a comma pause", () => {
    expect(normalizeDashes(`Shopping online right now${EM}and why it matters`)).toBe("Shopping online right now, and why it matters");
    expect(normalizeDashes(`Wait ${EM} what?`)).toBe("Wait, what?");
  });

  it("keeps number ranges readable", () => {
    expect(normalizeDashes(`Costs 5${EN}10 dollars`)).toBe("Costs 5-10 dollars");
  });

  it("turns other en dashes into a comma pause", () => {
    expect(normalizeDashes(`Slow ${EN} very slow`)).toBe("Slow, very slow");
  });

  it("leaves text without dashes alone, including ordinary hyphens", () => {
    expect(normalizeDashes("A well-built, mobile-first site.")).toBe("A well-built, mobile-first site.");
  });

  it("leaves no banned character behind", () => {
    const out = normalizeDashes(`a${EM}b ${EN} c 1${EN}2 d${EN}e`);
    expect(out).not.toMatch(/[–—]/);
  });
});
