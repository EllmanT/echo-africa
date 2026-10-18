import { describe, expect, it } from "vitest";

import { allowRequest, clientIp, readJsonLimited } from "./rateLimit";

describe("allowRequest (no database configured)", () => {
  it("blocks after the limit using the in-memory layer", async () => {
    const key = `test:${Math.random()}`;
    const results = [];
    for (let i = 0; i < 6; i++) results.push(await allowRequest(key, 3, 60, { shared: false }));
    expect(results).toEqual([true, true, true, false, false, false]);
  });
});

describe("clientIp", () => {
  it("uses cf-connecting-ip only when the connection came from Cloudflare", () => {
    const real = new Headers({ "x-vercel-forwarded-for": "104.16.1.1", "cf-connecting-ip": "41.60.1.2" });
    expect(clientIp(real)).toBe("41.60.1.2");
    // Someone hitting Vercel directly and forging the header: their own address is used instead.
    const forged = new Headers({ "x-vercel-forwarded-for": "203.0.113.9", "cf-connecting-ip": "1.2.3.4" });
    expect(clientIp(forged)).toBe("203.0.113.9");
  });
  it("prefers platform-set headers over a caller-supplied forwarded chain", () => {
    const h = new Headers({ "x-forwarded-for": "6.6.6.6", "x-vercel-forwarded-for": "1.2.3.4" });
    expect(clientIp(h)).toBe("1.2.3.4");
  });
});

describe("readJsonLimited", () => {
  const post = (body: string, headers: Record<string, string> = {}) =>
    new Request("http://x.test", { method: "POST", body, headers });

  it("parses small bodies and rejects oversized or invalid ones", async () => {
    expect(await readJsonLimited(post('{"a":1}'))).toEqual({ a: 1 });
    expect(await readJsonLimited(post("x".repeat(2000)), 1000)).toBeNull();
    expect(await readJsonLimited(post("not json"))).toBeNull();
  });
});
