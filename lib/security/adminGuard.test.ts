import { describe, expect, it } from "vitest";

import { isCrossSite } from "./adminGuard";

describe("isCrossSite", () => {
  it("allows same-origin and origin-less requests", () => {
    expect(isCrossSite("https://www.eka.dev", "www.eka.dev")).toBe(false);
    expect(isCrossSite(null, "www.eka.dev")).toBe(false);
  });
  it("blocks another site and malformed origins", () => {
    expect(isCrossSite("https://evil.example", "www.eka.dev")).toBe(true);
    expect(isCrossSite("null", "www.eka.dev")).toBe(true);
  });
});
