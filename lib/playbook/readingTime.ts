/** Words per minute for an easy, skimmed business read. */
const WORDS_PER_MINUTE = 200;

/** Plain-text word count of an article's Markdown/MDX, ignoring tags, image syntax and punctuation-only tokens. */
export function countWords(source: string): number {
  return source
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`~\[\]()-]+/g, " ")
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w)).length;
}

/** Whole minutes, never less than 1. */
export function readingMinutes(source: string): number {
  return Math.max(1, Math.round(countWords(source) / WORDS_PER_MINUTE));
}
