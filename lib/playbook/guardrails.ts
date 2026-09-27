import type { DraftArticle } from "./write";

export type GuardrailResult = {
  /** Hard failures. Any of these sends the article to draft instead of publishing. */
  reasons: string[];
  /** Soft warnings. The article still publishes, but these are shown in the admin. */
  flags: string[];
};

const DASH_RE = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const BANNED_PHRASES = [
  "guarantee #1",
  "guaranteed to rank",
  "100% guaranteed",
  "risk-free investment",
  "get rich",
  "act now or",
  "limited time only",
];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeTitle(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

function titleOverlap(a: string, b: string): number {
  const setA = normalizeTitle(a);
  const setB = normalizeTitle(b);
  if (!setA.size || !setB.size) return 0;
  let shared = 0;
  Array.from(setA).forEach((w) => {
    if (setB.has(w)) shared++;
  });
  return shared / Math.min(setA.size, setB.size);
}

/** Best-effort: fetches a source URL and checks whether any number from the claim appears in its text. Never throws. */
async function claimLooksSupported(claim: { text: string; sourceUrl: string }): Promise<boolean> {
  const numbers = claim.text.match(/\d[\d,.]*%?/g);
  if (!numbers?.length) return true; // Nothing numeric to verify.

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(claim.sourceUrl, { signal: controller.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; EkaPlaybookBot/1.0)" } });
    clearTimeout(timeout);
    if (!res.ok) return true; // Can't verify, don't punish the article for a flaky fetch.
    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, " ");
    return numbers.some((n) => text.includes(n));
  } catch {
    return true; // Network hiccup: treat as unverifiable, not as failed.
  }
}

export async function runGuardrails(
  draft: DraftArticle,
  allowedSourceUrls: string[],
  recentTitles: string[]
): Promise<GuardrailResult> {
  const reasons: string[] = [];
  const flags: string[] = [];

  const fullText = `${draft.title}\n${draft.description}\n${draft.content}`;
  if (DASH_RE.test(fullText)) {
    reasons.push("Contains an em dash or en dash character");
  }

  const words = wordCount(draft.content);
  if (words < 300) reasons.push(`Too short: ${words} words`);
  if (words > 1400) reasons.push(`Too long: ${words} words`);

  const sentences = draft.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length ? words / sentences.length : 0;
  if (avgSentenceLength > 28) flags.push(`Long average sentence length (${avgSentenceLength.toFixed(1)} words)`);

  const lowerText = fullText.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase)) reasons.push(`Contains a disallowed claim: "${phrase}"`);
  }

  const allowedSet = new Set(allowedSourceUrls);
  for (const claim of draft.claims) {
    if (!allowedSet.has(claim.sourceUrl)) {
      reasons.push(`Claim cites a URL that was not actually searched: "${claim.sourceUrl}"`);
    }
  }

  for (const title of recentTitles) {
    if (titleOverlap(draft.title, title) > 0.6) {
      flags.push(`Title looks similar to a recent post: "${title}"`);
    }
  }

  if (reasons.length === 0) {
    const checks = await Promise.all(draft.claims.map(claimLooksSupported));
    checks.forEach((supported, i) => {
      if (!supported) flags.push(`Could not confirm this number appears on its source page: "${draft.claims[i].text}"`);
    });
  }

  return { reasons, flags };
}
