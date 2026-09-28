import { describe, expect, it } from "vitest";
import { directivesToMdx } from "./format";

describe("directivesToMdx", () => {
  it("turns a callout and an illustration into MDX tags", () => {
    const out = directivesToMdx(
      ["Hook line.", ":::callout The short version", "- one", "- two", ":::", "", "::illustration speed | Fast pages, happy visitors"].join("\n")
    );
    expect(out).toContain('<Callout title="The short version">');
    expect(out).toContain("- one");
    expect(out).toContain("</Callout>");
    expect(out).toContain('<Illustration name="speed" caption="Fast pages, happy visitors" />');
  });

  it("closes a callout the writer forgot to close", () => {
    expect(directivesToMdx(":::callout Tip\n- a")).toContain("</Callout>");
  });

  it("strips characters that would break the MDX", () => {
    const out = directivesToMdx('::illustration chart | Sales <up> "fast" {now}');
    expect(out).not.toMatch(/[<>]{2}/);
    expect(out).toContain("&quot;fast&quot;");
    expect(out).not.toContain("{now}");
  });

  it("leaves ordinary Markdown alone", () => {
    const md = "## A heading\n\nA paragraph.\n\n1. Step one\n2. Step two";
    expect(directivesToMdx(md).trim()).toBe(md);
  });
});

import { salvageLeakedToolMarkup } from "./format";

describe("salvageLeakedToolMarkup", () => {
  it("cuts the article at a leaked closing tag and recovers the claims", () => {
    const leaked =
      'The real article.\n\nLast line.</content>\n<parameter name="claims">[{"text":"A number","sourceUrl":"https://example.com"}]';
    const out = salvageLeakedToolMarkup({ content: leaked, claims: undefined as unknown });
    expect(out.content).toBe("The real article.\n\nLast line.");
    expect(out.claims).toEqual([{ text: "A number", sourceUrl: "https://example.com" }]);
  });

  it("keeps claims the model already sent properly", () => {
    const out = salvageLeakedToolMarkup({ content: "Body</content><parameter name=\"claims\">[]", claims: [{ text: "x", sourceUrl: "y" }] });
    expect(out.claims).toEqual([{ text: "x", sourceUrl: "y" }]);
  });

  it("leaves a clean article untouched", () => {
    expect(salvageLeakedToolMarkup({ content: "Clean body.", claims: [] }).content).toBe("Clean body.");
  });

  it("survives claims that are not valid JSON", () => {
    const out = salvageLeakedToolMarkup({ content: 'Body</content><parameter name="claims">[{oops', claims: undefined as unknown });
    expect(out.content).toBe("Body");
    expect(out.claims).toBeUndefined();
  });
});
