import { describe, expect, it } from "vitest";

import { isPlausibleWhatsapp, normalizeWhatsapp } from "./phone";

describe("normalizeWhatsapp", () => {
  it("turns every common Zimbabwean way of typing a number into one international form", () => {
    for (const typed of ["077 123 4567", "0771234567", "771234567", "+263 77 123 4567", "263771234567", "(077) 123-4567", "00263771234567"]) {
      expect(normalizeWhatsapp(typed)).toBe("+263771234567");
    }
  });
  it("keeps other countries as typed, minus punctuation", () => {
    expect(normalizeWhatsapp("+27 82 123 4567")).toBe("+27821234567");
    expect(normalizeWhatsapp("0027821234567")).toBe("+27821234567");
    expect(normalizeWhatsapp("27821234567")).toBe("+27821234567");
  });
  it("returns an empty string for nothing", () => {
    expect(normalizeWhatsapp("   ")).toBe("");
  });
});

describe("isPlausibleWhatsapp", () => {
  it("accepts real-looking numbers and refuses junk", () => {
    expect(isPlausibleWhatsapp("+263771234567")).toBe(true);
    expect(isPlausibleWhatsapp("12345")).toBe(false);
    expect(isPlausibleWhatsapp("abc")).toBe(false);
    expect(isPlausibleWhatsapp("")).toBe(false);
    expect(isPlausibleWhatsapp("+1234567890123456")).toBe(false);
  });
});
