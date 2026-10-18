import { beforeAll, describe, expect, it } from "vitest";

import { parseLeadRef, signLeadRef } from "./leadRef";

const ID = "64b7f0c2a1b2c3d4e5f60718";

describe("lead reference", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-real";
  });
  it("round-trips a signed reference", () => {
    expect(parseLeadRef(signLeadRef(ID))).toBe(ID);
  });
  it("rejects a bare id, which is all an email link reveals", () => {
    expect(parseLeadRef(ID)).toBeUndefined();
  });
  it("rejects a tampered id or signature", () => {
    const [, sig] = signLeadRef(ID).split(".");
    expect(parseLeadRef(`64b7f0c2a1b2c3d4e5f60719.${sig}`)).toBeUndefined();
    expect(parseLeadRef(`${ID}.${"0".repeat(24)}`)).toBeUndefined();
  });
});
