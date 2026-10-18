import { afterEach, describe, expect, it } from "vitest";

import { verifyTurnstile } from "./turnstile";

const reply = (body: unknown, ok = true) => (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;

const SECRET = "0xREAL_LOOKING_SECRET";
afterEach(() => {
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.TURNSTILE_HOSTNAMES;
});

describe("verifyTurnstile", () => {
  it("is skipped when no secret is configured (dev and previews)", async () => {
    expect(await verifyTurnstile(undefined, { action: "lead" })).toEqual({ ok: true, reason: "disabled" });
  });

  it("rejects missing, empty and oversized tokens before calling Cloudflare", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    let called = false;
    const spy = (async () => ((called = true), { ok: true, json: async () => ({}) })) as unknown as typeof fetch;
    for (const t of [undefined, "", "x".repeat(3000)]) expect((await verifyTurnstile(t, { action: "lead", fetchImpl: spy })).ok).toBe(false);
    expect(called).toBe(false);
  });

  it("accepts a valid token for the right action and hostname", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    const r = await verifyTurnstile("tok", { action: "lead", fetchImpl: reply({ success: true, action: "lead", hostname: "www.eka.dev" }) });
    expect(r.ok).toBe(true);
  });

  it("rejects failed challenges, wrong actions and foreign hostnames", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    expect((await verifyTurnstile("tok", { action: "lead", fetchImpl: reply({ success: false, "error-codes": ["invalid-input-response"] }) })).reason).toBe("invalid-input-response");
    expect((await verifyTurnstile("tok", { action: "lead", fetchImpl: reply({ success: true, action: "review", hostname: "www.eka.dev" }) })).reason).toBe("wrong-action");
    expect((await verifyTurnstile("tok", { action: "lead", fetchImpl: reply({ success: true, action: "lead", hostname: "evil.example" }) })).reason).toBe("wrong-hostname");
  });

  it("skips the hostname check for Cloudflare's published test secrets", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    const r = await verifyTurnstile("tok", { action: "lead", fetchImpl: reply({ success: true, hostname: "example.com" }) });
    expect(r.ok).toBe(true);
  });

  it("fails closed when Cloudflare is unreachable, unless failOpen is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    const boom = (async () => {
      throw new Error("network");
    }) as unknown as typeof fetch;
    expect((await verifyTurnstile("tok", { action: "lead", fetchImpl: boom })).ok).toBe(false);
    expect((await verifyTurnstile("tok", { action: "lead", fetchImpl: boom, failOpen: true })).ok).toBe(true);
    expect((await verifyTurnstile("tok", { action: "lead", fetchImpl: reply({}, false) })).ok).toBe(false);
  });
});
