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

describe("legacy unsubscribe links", () => {
  it("still accepts tokens signed directly with SESSION_SECRET", async () => {
    process.env.SESSION_SECRET = "test-secret-not-real";
    const { createHmac } = await import("node:crypto");
    const legacy = createHmac("sha256", "test-secret-not-real").update("lead123").digest("hex").slice(0, 32);
    expect(verifyUnsubscribeToken("lead123", legacy)).toBe(true);
  });
});
