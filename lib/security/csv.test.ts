import { describe, expect, it } from "vitest";

import { csvCell } from "./csv";

describe("csvCell", () => {
  it("neutralises formula starters", () => {
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe(`"'=HYPERLINK(""http://x"")"`);
    expect(csvCell("+1+1")).toBe("'+1+1");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
  it("leaves plain text and empties alone", () => {
    expect(csvCell("hello")).toBe("hello");
    expect(csvCell(null)).toBe("");
  });
});
