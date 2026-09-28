import { describe, expect, it } from "vitest";

import { CostMeter } from "./anthropic";
import { hasBudget, startOfMonthUtc } from "./budget";

describe("CostMeter", () => {
  it("prices Haiku 4.5 tokens at $1 in and $5 out per million", () => {
    const meter = new CostMeter();
    meter.add("claude-haiku-4-5-20251001", { input_tokens: 10_000, output_tokens: 2_000 });
    // 10,000 * $1/M + 2,000 * $5/M = $0.01 + $0.01
    expect(meter.usd).toBeCloseTo(0.02, 6);
  });

  it("adds a cent for every web search", () => {
    const meter = new CostMeter();
    meter.add("claude-haiku-4-5-20251001", { input_tokens: 0, output_tokens: 0, server_tool_use: { web_search_requests: 2 } });
    expect(meter.usd).toBeCloseTo(0.02, 6);
    expect(meter.searches).toBe(2);
  });

  it("adds up across the research and writing calls", () => {
    const meter = new CostMeter();
    meter.add("claude-haiku-4-5-20251001", { input_tokens: 8_000, output_tokens: 600, server_tool_use: { web_search_requests: 1 } });
    meter.add("claude-haiku-4-5-20251001", { input_tokens: 2_000, output_tokens: 1_800 });
    expect(meter.usd).toBeCloseTo(0.008 + 0.003 + 0.01 + 0.002 + 0.009, 6);
    expect(meter.usd).toBeLessThan(0.05);
  });

  it("charges an unknown model at the Haiku rate rather than nothing", () => {
    const meter = new CostMeter();
    meter.add("some-new-model", { input_tokens: 1_000_000, output_tokens: 0 });
    expect(meter.usd).toBeCloseTo(1, 6);
  });

  it("ignores a response with no usage block", () => {
    const meter = new CostMeter();
    meter.add("claude-haiku-4-5-20251001", undefined);
    expect(meter.usd).toBe(0);
  });
});

describe("monthly budget", () => {
  it("allows another article while spend is under the budget, and stops at it", () => {
    expect(hasBudget(0.5, 1)).toBe(true);
    expect(hasBudget(0.999, 1)).toBe(true);
    expect(hasBudget(1, 1)).toBe(false);
    expect(hasBudget(2, 1)).toBe(false);
  });

  it("treats a zero budget as switched off", () => {
    expect(hasBudget(0, 0)).toBe(false);
  });

  it("resets on the first of the month, UTC", () => {
    expect(startOfMonthUtc(new Date("2026-10-15T13:00:00Z")).toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });
});
