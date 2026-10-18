/**
 * Turns a page's raw HTML into a short, plain list of facts for the free review. Pure and deterministic:
 * the model only ever sees what is extracted here, never raw markup. All of it is untrusted visitor-supplied
 * content, so the prompt wraps it in tags and tells the model to treat it as data.
 */

export type SiteFacts = {
  readable: boolean;
  url: string;
  title: string;
  description: string;
  headings: string[];
  textExcerpt: string;
  https: boolean;
  hasViewportMeta: boolean;
  hasOgImage: boolean;
  imageCount: number;
  imagesMissingAlt: number;
  mentionsWhatsapp: boolean;
  hasPhoneLink: boolean;
  hasForm: boolean;
  bytes: number;
};

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const clean = (s: string) => decode(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

function metaContent(html: string, key: string, attr: "name" | "property"): string {
  const a = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i").exec(html);
  if (a) return decode(a[1]).trim();
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i").exec(html);
  return b ? decode(b[1]).trim() : "";
}

export function unreadableFacts(url: string): SiteFacts {
  return {
    readable: false, url, title: "", description: "", headings: [], textExcerpt: "", https: url.startsWith("https:"),
    hasViewportMeta: false, hasOgImage: false, imageCount: 0, imagesMissingAlt: 0, mentionsWhatsapp: false,
    hasPhoneLink: false, hasForm: false, bytes: 0,
  };
}

export function extractSiteFacts(html: string, url: string): SiteFacts {
  if (!html || html.length < 200) return unreadableFacts(url);

  const title = clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").slice(0, 160);
  const body = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ");

  const headings: string[] = [];
  for (const m of body.matchAll(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = clean(m[2]).slice(0, 120);
    if (text && headings.length < 10) headings.push(text);
  }

  const images = Array.from(body.matchAll(/<img\b[^>]*>/gi)).map((m) => m[0]);
  const missingAlt = images.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag)).length;
  const text = clean(body);

  return {
    readable: text.length > 60,
    url,
    title,
    description: metaContent(html, "description", "name").slice(0, 300),
    headings,
    textExcerpt: text.slice(0, 2500),
    https: url.startsWith("https:"),
    hasViewportMeta: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasOgImage: Boolean(metaContent(html, "og:image", "property")),
    imageCount: images.length,
    imagesMissingAlt: missingAlt,
    mentionsWhatsapp: /wa\.me|whatsapp/i.test(html),
    hasPhoneLink: /href=["']tel:/i.test(html),
    hasForm: /<form\b/i.test(body),
    bytes: html.length,
  };
}

/** The data block the model sees. Closing-tag lookalikes are broken so page text cannot escape the wrapper. */
export function siteFactsToPrompt(f: SiteFacts): string {
  const safe = (s: string) => s.replace(/<\/?\s*(site_data|process_data)/gi, "<\\$1");
  if (!f.readable) {
    return `<site_data>\nAddress: ${safe(f.url)}\nThe page could not be read (it may block automated visitors, be slow, or be built so that its text is not in the page source). Say so honestly and keep your advice general to a small business website.\n</site_data>`;
  }
  return `<site_data>
Address: ${safe(f.url)}
Secure (https): ${f.https ? "yes" : "no"}
Mobile viewport tag: ${f.hasViewportMeta ? "present" : "missing"}
Page title: ${safe(f.title) || "(none)"}
Meta description: ${safe(f.description) || "(none)"}
Social share image: ${f.hasOgImage ? "present" : "missing"}
Images: ${f.imageCount}, without alt text: ${f.imagesMissingAlt}
WhatsApp mentioned or linked: ${f.mentionsWhatsapp ? "yes" : "no"}
Tap-to-call phone link: ${f.hasPhoneLink ? "yes" : "no"}
Contact or enquiry form on the page: ${f.hasForm ? "yes" : "no"}
Main headings: ${f.headings.length ? f.headings.map(safe).join(" | ") : "(none found)"}
Start of the page text:
${safe(f.textExcerpt)}
</site_data>`;
}
