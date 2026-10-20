import { describe, expect, it } from "vitest";

import { MAX_DOCUMENT_CHARS, shapeText } from "./extractDocument";
import { safeFileName, sniffFileKind } from "./leadFiles";

const bytes = (s: string) => new Uint8Array(Buffer.from(s, "latin1"));

describe("sniffFileKind", () => {
  it("recognises a PDF by its first bytes", () => {
    expect(sniffFileKind(bytes("%PDF-1.7 rest"))).toBe("pdf");
  });
  it("accepts a zip only when it holds a Word document", () => {
    expect(sniffFileKind(bytes("PK\u0003\u0004....word/document.xml...."))).toBe("docx");
    expect(sniffFileKind(bytes("PK\u0003\u0004....a.txt...."))).toBeNull();
  });
  it("refuses everything else, whatever it is called", () => {
    expect(sniffFileKind(bytes("<script>alert(1)</script>"))).toBeNull();
    expect(sniffFileKind(bytes("MZ\u0090\u0000 program"))).toBeNull();
    expect(sniffFileKind(new Uint8Array())).toBeNull();
  });
});

describe("safeFileName", () => {
  it("forces the real extension and strips path and header characters", () => {
    const traversal = safeFileName("../../etc/passwd.exe", "pdf");
    expect(traversal).not.toMatch(/[/\\]/);
    expect(traversal.endsWith(".pdf")).toBe(true);
    expect(safeFileName('a"b\r\nc.docx', "docx")).not.toMatch(/["\r\n]/);
  });
  it("keeps a normal name and falls back when empty", () => {
    expect(safeFileName("Order process.pdf", "pdf")).toBe("Order process.pdf");
    expect(safeFileName("", "docx")).toBe("document.docx");
  });
});

describe("shapeText", () => {
  it("removes control characters and tidies whitespace", () => {
    expect(shapeText("a\u0000b   c\n\n\n\nd").text).toBe("a b c\n\nd");
  });
  it("keeps long documents inside the budget and says it cut", () => {
    const r = shapeText("word ".repeat(5000));
    expect(r.truncated).toBe(true);
    expect(r.text.length).toBeLessThanOrEqual(MAX_DOCUMENT_CHARS);
  });
});
