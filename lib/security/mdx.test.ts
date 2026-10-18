import { describe, expect, it } from "vitest";

import { findDisallowedMdxTags, isSafeHref } from "./mdx";

describe("findDisallowedMdxTags", () => {
  it("flags script, iframe and unknown components", () => {
    expect(findDisallowedMdxTags("hi <script>x</script> <iframe src='a'/> <Evil />").sort()).toEqual(["Evil", "iframe", "script"]);
  });
  it("allows the site's components and harmless inline html", () => {
    expect(findDisallowedMdxTags('<Callout title="a">x</Callout><Illustration name="b" /> <br/> **bold**')).toEqual([]);
  });
  it("is not fooled by mixed case or namespaces", () => {
    expect(findDisallowedMdxTags("<SCRIPT>a</SCRIPT><svg:script/>").length).toBe(2);
  });
});

describe("isSafeHref", () => {
  it("allows http(s), mailto, tel, relative and anchors", () => {
    for (const h of ["https://a.b", "http://a.b", "mailto:a@b.c", "tel:+263", "/work", "#faq"]) expect(isSafeHref(h)).toBe(true);
  });
  it("rejects script-bearing schemes", () => {
    for (const h of ["javascript:alert(1)", " JaVaScRiPt:alert(1)", "data:text/html,x", "vbscript:x", ""]) expect(isSafeHref(h)).toBe(false);
  });
});

import { neutralizeDisallowedMdx } from "./mdx";

describe("neutralizeDisallowedMdx", () => {
  it("turns disallowed tags into inert text and keeps allowed ones", () => {
    const out = neutralizeDisallowedMdx('<script>x</script> <Callout title="a">ok</Callout> <iframe src="u"/>');
    expect(out).toContain("&lt;script>");
    expect(out).toContain("&lt;/script>");
    expect(out).toContain("&lt;iframe");
    expect(out).toContain('<Callout title="a">');
    expect(out).not.toMatch(/<script|<iframe/);
  });
});
