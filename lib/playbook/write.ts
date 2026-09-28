import { generateStructured, type CostMeter } from "./anthropic";
import { REGION_GUIDANCE, type Pillar, type Region } from "./pillars";
import type { ResearchResult } from "./research";
import { SCENE_GUIDE } from "@/components/playbook/scenes";
import { directivesToMdx, normalizeDashes, salvageLeakedToolMarkup } from "./format";

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
        "The full article body in Markdown with two plain-text directives (see the prompt). Start directly with the first paragraph, no repeated title heading. Never type angle brackets. Follow the layout in the prompt exactly.",
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
  research: ResearchResult,
  meter?: CostMeter
): Promise<DraftArticle> {
  const scenes = Object.entries(SCENE_GUIDE)
    .map(([name, use]) => `- ${name}: ${use}`)
    .join("\n");

  const prompt = `Write a Playbook article for Eka (eka.dev), a Zimbabwean web development and AI automation agency, using the research below.

Pillar: ${pillar.label}. What it covers: ${pillar.guidance}
Regional angle: ${REGION_GUIDANCE[region]}

Research:
${research.summary}

Sources you may cite (use these exact URLs only, never invent a URL):
${research.sourceUrls.map((u) => `- ${u}`).join("\n") || "(none found, so do not include any claims with a sourceUrl)"}

VOICE (very important). Write the way Alex Hormozi teaches: direct, warm, and dead simple.
- Talk to one business owner as "you". Sound like a smart friend, not a company.
- Grade 5 reading level. Short words. Most sentences under 15 words. One idea per paragraph. Paragraphs of 1 to 3 sentences.
- Say the plain thing. "Your site is slow" not "performance is suboptimal". Explain any tech word in five words or fewer, or skip it.
- Be concrete. Give a real example a Zimbabwean shop owner would recognise. Use numbers only when they came from the research.
- Teach something they can use today. Give value first. Never hype, never fear-mongering.

LAYOUT (follow it in this order). The whole article is about 350 to 450 words, a 2 minute read. Shorter is better.
1. Hook: 2 or 3 short lines that name the problem in the reader's own words. No heading.
2. A short-version box, written exactly like this (blank lines matter):

:::callout The short version
- First key point in a few words
- Second key point
- Third key point
:::

3. Three sections. Each starts with a ## heading written as a plain statement or question, then 2 to 4 short paragraphs.
4. Put an illustration on its own line between sections, 3 or 4 in total, written exactly like this:
::illustration speed | A short plain caption, under 10 words
   Pick the name that fits the idea. Use each name once at most. The available names are:
${scenes}
5. One numbered list (1. 2. 3.) of simple steps the reader can follow, in one of the sections.
6. Optionally one line that works as a pull quote, written as: > A short, punchy sentence worth remembering.
7. Finish with one soft, single sentence that mentions how Eka can help (websites, AI automation, custom software). No pressure, no discount, no urgency.

RULES
- Never type an angle bracket, curly brace or any HTML tag. Use only plain Markdown plus the two directives above (:::callout ... ::: and ::illustration name | caption). Write "under" or "over" instead of the signs.
- Never use an em dash or en dash character. Use a period, comma or "and" instead.
- Every specific number or statistic must be listed in the claims array with its real source URL from the list above. If you are not citing a source, do not include a specific number.
- Stay on websites, being found online, AI, automation and practical business software. Do not write about payments, banking, exchange rates, currency policy, elections or politics. Never repeat a company's own marketing numbers as if they were proven; say "the company says".
- Do not state how long a task takes, how much something costs, or how much time or money it saves, unless the research says so.
- Only say what the research actually says. Never invent what "used to" happen, what a rule "means" for the reader, or what happens if they do not comply. If the research does not state it, leave it out.
- For tax, legal or regulatory topics, report what the notice says in plain words and end with "confirm the latest with the authority or your accountant".
- Only attribute a number to the source that actually gave it. Never write "according to Google" or similar unless the research says so.
- Do not fabricate testimonials, client names, or results that were not given to you.`;

  // Now and then the model runs its "content" field into the next one. Salvage the article from
  // that, and only ask again if it is still unusable.
  let draft = salvageLeakedToolMarkup(
    await generateStructured<DraftArticle>(prompt, "publish_article", ARTICLE_SCHEMA, meter)
  );
  for (let attempt = 0; attempt < 2 && /<\/?(content|claims|invoke|parameter)/i.test(draft.content ?? ""); attempt++) {
    draft = salvageLeakedToolMarkup(
      await generateStructured<DraftArticle>(prompt, "publish_article", ARTICLE_SCHEMA, meter)
    );
  }
  // The model may leave claims out when it cites nothing.
  return {
    ...draft,
    title: normalizeDashes(draft.title ?? ""),
    description: normalizeDashes(draft.description ?? ""),
    content: normalizeDashes(directivesToMdx(draft.content ?? "")),
    claims: Array.isArray(draft.claims) ? draft.claims : [],
    tags: Array.isArray(draft.tags) ? draft.tags.map(normalizeDashes) : [],
  };
}
