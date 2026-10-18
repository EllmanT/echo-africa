import { describe, expect, it } from "vitest";

import { isCloudflareIp } from "./cloudflare";

describe("isCloudflareIp", () => {
  it("accepts addresses inside Cloudflare's published ranges", () => {
    for (const ip of ["173.245.48.1", "104.16.0.1", "104.23.255.255", "172.67.10.20", "162.159.1.1", "198.41.200.5", "131.0.72.9", "2606:4700::1", "2606:4700:ffff::1", "2a06:98c0::1", "2a06:98c7:ffff::1"])
      expect(isCloudflareIp(ip)).toBe(true);
  });
  it("rejects addresses just outside the ranges and ordinary clients", () => {
    for (const ip of ["104.15.255.255", "104.32.0.0", "172.63.255.255", "162.160.0.0", "8.8.8.8", "203.0.113.5", "2606:4701::1", "2a06:98c8::1", "::1", "garbage", "", "999.1.1.1"])
      expect(isCloudflareIp(ip)).toBe(false);
  });
  it("handles missing values", () => {
    expect(isCloudflareIp(null)).toBe(false);
    expect(isCloudflareIp(undefined)).toBe(false);
  });
});
