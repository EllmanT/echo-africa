import { research as researchTurn, extractResearchText, extractSearchedUrls } from "./anthropic";
import { REGION_GUIDANCE, type Pillar, type Region } from "./pillars";

export type ResearchResult = {
  summary: string;
  sourceUrls: string[];
};

/**
 * One web-search-enabled turn: Claude picks a specific, current angle inside
 * the given pillar and researches it. The summary and the list of URLs it
 * actually searched are handed to the writer next, so the writer can only
 * cite sources that were really retrieved.
 */
export async function runResearch(pillar: Pillar, region: Region, recentTitles: string[]): Promise<ResearchResult> {
  const avoidList = recentTitles.length
    ? `Do not repeat these recent Playbook topics, and pick something genuinely different:\n${recentTitles.map((t) => `- ${t}`).join("\n")}`
    : "";

  const prompt = `You are researching for a short educational blog post for Eka, a Zimbabwean web development and AI automation agency. The post lives in "The Playbook", a free-value section of the agency's site aimed at small and medium business owners in Africa.

Pillar: ${pillar.label}
What this pillar covers: ${pillar.guidance}
Regional angle: ${REGION_GUIDANCE[region]}

${avoidList}

Use web search to find one specific, current, real fact, statistic, news item or example that fits this pillar and regional angle. Prefer sources from the last 12 months.

Then write:
1. A single specific topic/headline idea for the post (one line).
2. A short research summary (150 to 300 words) covering what you found, in plain English, with the source URL next to every specific number or claim.

Do not invent numbers. If you cannot find a good current source, say so plainly and suggest a topic that does not depend on a specific statistic.`;

  const message = await researchTurn(prompt, 4);
  const summary = extractResearchText(message);
  const sourceUrls = extractSearchedUrls(message);

  if (!summary.trim()) {
    throw new Error("Research step returned no usable content");
  }

  return { summary, sourceUrls };
}
