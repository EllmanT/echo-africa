/**
 * Article bodies are MDX. next-mdx-remote already blocks JS expressions, but raw HTML tags pass straight
 * through to the page, so a <script> or <iframe> in a post body would run for every visitor.
 * Two layers: save-time validation (this file) and render-time blocking (components/playbook/mdx.tsx).
 */

/** Tags an article may use: the site's two components plus harmless inline HTML. */
export const SAFE_MDX_TAGS = ["Illustration", "Callout", "br", "hr", "img", "a", "em", "strong", "code", "pre"] as const;

/** Returns the distinct tag names in `content` that are not on the allow-list (case-sensitive: MDX components are). */
export function findDisallowedMdxTags(content: string): string[] {
  const found = new Set<string>();
  for (const m of content.matchAll(/<\/?([A-Za-z][\w:.-]*)/g)) {
    if (!(SAFE_MDX_TAGS as readonly string[]).includes(m[1])) found.add(m[1]);
  }
  return Array.from(found);
}

/** Link targets an article may point to. Anything else (javascript:, data:, vbscript:) is dropped. */
export function isSafeHref(href: string | undefined): boolean {
  if (!href) return false;
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href.trim());
}

/**
 * Render-time defence. MDX does not route raw block HTML (<script>, <iframe>...) through the components map,
 * so the source itself is neutralised: any tag not on the allow-list has its "<" turned into "&lt;" and is
 * shown as inert text. Applied to every article before it is compiled, whatever put it in the database.
 */
export function neutralizeDisallowedMdx(content: string): string {
  return content.replace(/<(\/?)([A-Za-z][\w:.-]*)/g, (match, slash: string, name: string) =>
    (SAFE_MDX_TAGS as readonly string[]).includes(name) ? match : `&lt;${slash}${name}`
  );
}
