import { generateStructured } from "./anthropic";
import { REGION_GUIDANCE, type Pillar, type Region } from "./pillars";
import type { ResearchResult } from "./research";

export type DraftArticle = {
  title: string;
  description: string;
  tags: string[];
  content: string;
  claims: { text: string; sourceUrl: string }[];
};

const ARTICLE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Plain, specific headline. No colons-as-subtitle gimmicks, no clickbait." },
    description: { type: "string", description: "One or two sentences, used on the card and for search results." },
    tags: { type: "array", items: { type: "string" }, description: "3 to 5 short lowercase tags." },
    content: {
      type: "string",
      description:
        "The full article body in Markdown. Start directly with the first paragraph, no repeated title heading. Use ## for section headings, short paragraphs, and at most one short bullet list. End with one soft, low-pressure line that relates to Eka's services, not a hard sales pitch.",
    },
    claims: {
      type: "array",
      description: "Every specific number, statistic or dated fact used in the article, each paired with the source URL it came from.",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "The exact claim as it appears in the article." },
          sourceUrl: { type: "string", description: "Must be one of the URLs given in the research." },
        },
        required: ["text", "sourceUrl"],
      },
    },
  },
  required: ["title", "description", "tags", "content", "claims"],
};

export async function writeArticle(
  pillar: Pillar,
  region: Region,
  research: ResearchResult
): Promise<DraftArticle> {
  const prompt = `Write a Playbook article for Eka (eka.dev), a Zimbabwean web development and AI automation agency, using the research below.

Pillar: ${pillar.label}. What it covers: ${pillar.guidance}
Regional angle: ${REGION_GUIDANCE[region]}

Research:
${research.summary}

Sources you may cite (use these exact URLs only, never invent a URL):
${research.sourceUrls.map((u) => `- ${u}`).join("\n") || "(none found, so do not include any claims with a sourceUrl)"}

Voice and rules:
- Simple, plain English. Short sentences. No jargon without a one-line explanation.
- Educational, not promotional: teach something real, the way Alex Hormozi's free content teaches business owners something useful before ever selling anything.
- Never use an em dash or en dash character. Use a period, comma or "and" instead.
- 500 to 900 words in the content field.
- Every specific number or statistic must be listed in the claims array with its real source URL from the list above. If you are not citing a source, do not include a specific number.
- End the content with one soft, single-sentence nod to Eka's services (websites, AI automation, custom software), never a hard sales pitch, never a discount or urgency claim.
- Do not fabricate testimonials, client names, or results that were not given to you.`;

  return generateStructured<DraftArticle>(prompt, "publish_article", ARTICLE_SCHEMA);
}
