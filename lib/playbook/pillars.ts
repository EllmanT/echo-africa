export type Pillar = {
  key: string;
  label: string;
  /** What the writer should cover, and why it serves the funnel. */
  guidance: string;
  /** Relative chance of being picked for a given slot. */
  weight: number;
};

export const DEFAULT_PILLARS: Pillar[] = [
  {
    key: "get-online",
    label: "Get online",
    weight: 20,
    guidance:
      "Why a business needs to be online, the real cost of not having a website or Google listing, and how to get started without wasting money. Practical, encouraging, aimed at an owner who has put this off.",
  },
  {
    key: "speed-seo",
    label: "Speed and being found",
    weight: 20,
    guidance:
      "Website speed, mobile data and search ranking for African businesses. Concrete, testable tips (page weight, image size, Google Business Profile, page titles). Avoid jargon; explain any technical term in one plain sentence.",
  },
  {
    key: "ai-automation",
    label: "AI and automation",
    weight: 20,
    guidance:
      "Practical AI automation for small and medium businesses: WhatsApp bots, invoicing, reporting, document processing, n8n-style workflows. Show a specific before/after, not abstract AI hype.",
  },
  {
    key: "news-translated",
    label: "News, translated",
    weight: 15,
    guidance:
      "Take one real, recent piece of tech, AI or digital-economy news from Africa or globally and translate it into what it actually means for a small business owner: should they care, and what should they do about it.",
  },
  {
    key: "case-teardown",
    label: "Case teardown",
    weight: 10,
    guidance:
      "Break down a real, publicly visible website or digital presence (an anonymised or a well-known public example, not a private client) and point out one or two concrete things it does well or badly, with a lesson the reader can apply.",
  },
  {
    key: "tools-tips",
    label: "Tools and quick tips",
    weight: 15,
    guidance:
      "One tight, specific tip a business owner can act on today: a free tool, a five-minute fix, a checklist item. Short and dense with value, not a long essay.",
  },
];

export type Region = "zimbabwe" | "africa" | "global";

export const DEFAULT_REGION_WEIGHTS: Record<Region, number> = {
  zimbabwe: 50,
  africa: 30,
  global: 20,
};

export const REGION_GUIDANCE: Record<Region, string> = {
  zimbabwe: "Ground this specifically in Zimbabwe: local examples, ZWL/USD pricing context, ZIMRA/local platforms where relevant.",
  africa: "Ground this in Africa broadly, not only Zimbabwe: examples can come from Nigeria, Kenya, South Africa, Ghana, etc.",
  global: "This can reference global examples and trends, but always end by relating it back to what an African small business should take from it.",
};
