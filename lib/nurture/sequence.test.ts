import { describe, expect, it } from "vitest";
import { pickDueStep } from "./sequence";

const STEPS = [
  { type: "a", afterHours: 1 },
  { type: "b", afterHours: 24 },
  { type: "c", afterHours: 72 },
] as const;

describe("pickDueStep", () => {
  it("returns nothing before the first step is due", () => {
    expect(pickDueStep(STEPS, [], 0.5)).toBeNull();
  });

  it("returns the first due step that has not been sent", () => {
    expect(pickDueStep(STEPS, [], 2)?.type).toBe("a");
  });

  it("skips steps already sent and picks the next due one", () => {
    expect(pickDueStep(STEPS, ["a"], 30)?.type).toBe("b");
  });

  it("never re-sends a step, even long after it was due", () => {
    expect(pickDueStep(STEPS, ["a", "b", "c"], 1000)).toBeNull();
  });

  it("only ever returns one step, the earliest unsent one, even if several are due", () => {
    expect(pickDueStep(STEPS, [], 100)?.type).toBe("a");
  });
});
