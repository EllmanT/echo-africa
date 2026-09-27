import { describe, expect, it, beforeAll } from "vitest";
import { unsubscribeToken, verifyUnsubscribeToken } from "./unsubscribe";

describe("unsubscribe token", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-real";
  });

  it("verifies a token it issued for the same lead", () => {
    const token = unsubscribeToken("lead123");
    expect(verifyUnsubscribeToken("lead123", token)).toBe(true);
  });

  it("rejects a token issued for a different lead", () => {
    const token = unsubscribeToken("lead123");
    expect(verifyUnsubscribeToken("lead456", token)).toBe(false);
  });

  it("rejects a tampered token", () => {
    const token = unsubscribeToken("lead123");
    expect(verifyUnsubscribeToken("lead123", `${token}x`)).toBe(false);
  });
});
