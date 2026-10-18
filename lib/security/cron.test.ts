import { describe, expect, it } from "vitest";

import { isAuthorizedCron } from "./cron";

const SECRET = "a-long-enough-secret-value";

describe("isAuthorizedCron", () => {
  it("accepts the exact bearer secret", () => {
    expect(isAuthorizedCron(`Bearer ${SECRET}`, SECRET)).toBe(true);
  });
  it("rejects a wrong or missing header", () => {
    expect(isAuthorizedCron("Bearer nope", SECRET)).toBe(false);
    expect(isAuthorizedCron(null, SECRET)).toBe(false);
  });
  it("fails closed when the secret is unset, so 'Bearer undefined' never works", () => {
    expect(isAuthorizedCron("Bearer undefined", undefined)).toBe(false);
    expect(isAuthorizedCron("Bearer ", "")).toBe(false);
  });
  it("rejects a secret that is too short to be safe", () => {
    expect(isAuthorizedCron("Bearer short", "short")).toBe(false);
  });
});
