import { describe, expect, it } from "vitest";

import { NURTURE_SLOT, publishedArticleFilter, startOfHarareDayUtc } from "./jobRuns";

describe("publishedArticleFilter", () => {
  it("excludes nurture runs so they can never fill the daily article cap", () => {
    const f = publishedArticleFilter(new Date("2026-10-11T00:00:00Z"));
    expect(f.slot).toEqual({ $ne: NURTURE_SLOT });
    expect(f.status).toBe("published");
  });
});

describe("startOfHarareDayUtc", () => {
  it("is 22:00 UTC the previous day, since Harare is UTC+2", () => {
    expect(startOfHarareDayUtc(new Date("2026-10-11T18:00:00Z")).toISOString()).toBe("2026-10-10T22:00:00.000Z");
  });
  it("rolls to the next Harare day after 22:00 UTC", () => {
    expect(startOfHarareDayUtc(new Date("2026-10-11T23:00:00Z")).toISOString()).toBe("2026-10-11T22:00:00.000Z");
  });
});
