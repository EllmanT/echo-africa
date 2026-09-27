import { testimonials } from "@/data";

export type Metric = { value: string; label: string };

/**
 * Chart data is stored ALREADY ROUNDED DOWN (never above the source).
 * Sources: Google Search Console exports and the dealership quote-request
 * reports for May, June and August 2026 (no July export exists).
 */
export type ChartSpec = {
  id: string;
  type: "line" | "bar";
  title: string;
  caption: string;
  series: { key: string; name: string; color: "purple" | "tint" | "ink" }[];
  points: { label: string; [key: string]: string | number }[];
};

export type CaseStudy = {
  slug: string;
  order: number;
  client: string;
  category: "Website" | "Logo & Brand Identity";
  location: string;
  /** Big headline on the case study page. Outcome first. */
  tagline: string;
  /** One or two plain sentences, used on cards and in metadata. */
  summary: string;
  /** Single line for the Work list. */
  resultLine: string;
  heroStats: Metric[];
  problemHeadline: string;
  problem: string;
  solution: string;
  solutionPoints: string[];
  outcomeHeadline: string;
  outcome: string;
  results?: { charts: ChartSpec[]; note: string };
  image: string;
  link?: string;
  tags: string[];
};

const SOURCE_NOTE =
  "Numbers are rounded down. Source: Google Search Console and the client's own quote request reports, May, June and August 2026.";

export const caseStudies: CaseStudy[] = [
  {
    slug: "faramatsi-motors",
    order: 1,
    client: "Faramatsi Motors",
    category: "Website",
    location: "Harare, Zimbabwe",
    tagline: "7x more people found this dealership on Google in three months.",
    summary:
      "A fast website for a Harare motor dealership that turned Google searches into quote requests.",
    resultLine: "A fast dealership site that turns Google searches into quote requests.",
    heroStats: [
      { value: "7x", label: "more Google views, May to August" },
      { value: "500+", label: "clicks from Google in August" },
      { value: "Almost 3x", label: "more quote requests across both dealership sites" },
    ],
    problemHeadline: "Buyers search on their phones. Slow websites lose them in seconds.",
    problem:
      "Faramatsi Motors sells vehicles to buyers who browse on mobile data in Zimbabwe. A heavy, slow site means the buyer leaves and calls the next dealer. They needed a site that loads fast, shows the stock clearly and makes it easy to get in touch.",
    solution:
      "We built a clean, fast website for phones first, with clear vehicle listings and simple ways to ask for a quote. Then we fixed the search basics so Google could find and show the right pages.",
    solutionPoints: [
      "Fast on mobile data, not just on fibre",
      "Clear vehicle pages with one obvious way to ask for a quote",
      "Search fixes so Google shows the right page for each vehicle",
    ],
    outcomeHeadline: "More buyers finding them, and more of them asking for quotes.",
    outcome:
      "In three months, the number of times the dealership showed up on Google grew about 7 times. Clicks from Google went from around 280 to over 500 a month, and quote requests across both Faramatsi sites nearly tripled.",
    results: {
      note: SOURCE_NOTE,
      charts: [
        {
          id: "motors-google",
          type: "bar",
          title: "Times people saw the site on Google",
          caption: "Each month, rounded down",
          series: [{ key: "views", name: "Google views", color: "purple" }],
          points: [
            { label: "May", views: 1500 },
            { label: "June", views: 4900 },
            { label: "August", views: 10900 },
          ],
        },
        {
          id: "motors-clicks",
          type: "line",
          title: "Clicks from Google to the site",
          caption: "Each month, rounded down",
          series: [{ key: "clicks", name: "Clicks", color: "purple" }],
          points: [
            { label: "May", clicks: 280 },
            { label: "June", clicks: 420 },
            { label: "August", clicks: 500 },
          ],
        },
      ],
    },
    image: "/website-images/faramatsimotors-preivew.png",
    link: "https://faramatsimotors.co.zw",
    tags: ["web development", "motor dealership", "Harare"],
  },
  {
    slug: "faramatsi-toyota",
    order: 2,
    client: "Faramatsi Toyota",
    category: "Website",
    location: "Zimbabwe",
    tagline: "From a handful of clicks to 500+ a month from Google.",
    summary:
      "A modern website for Zimbabwe's Toyota dealership, with AI features that help the team and search work that brought in first-ever clicks.",
    resultLine: "Modern design, AI features and search work that earned first-ever clicks.",
    heroStats: [
      { value: "8x", label: "more clicks from Google, May to August" },
      { value: "14x", label: "more Google views, May to August" },
      { value: "Almost 3x", label: "more quote requests across both dealership sites" },
    ],
    problemHeadline: "An official Toyota dealer that Google buyers could not find.",
    problem:
      "Faramatsi Toyota needed a website that matched the standard of the Toyota brand and still felt made for Zimbabwe. It also needed to show up when people search for a Fortuner, Prado or Hilux for sale, because that is where the buyers are.",
    solution:
      "We built a modern, brand-right site and added AI features that help the team present and manage the vehicle catalogue. Then we did the search work: clearer page titles, fixes for duplicate pages and pages built for each model people search for.",
    solutionPoints: [
      "Modern design that respects the Toyota brand",
      "AI features that save the team time on the catalogue",
      "Search work aimed at the models buyers actually look for",
    ],
    outcomeHeadline: "First-ever clicks on the searches that matter.",
    outcome:
      "Clicks from Google grew about 8 times in three months, and views grew about 14 times. Fortuner, Prado and Hilux single cab for-sale searches all earned their first-ever clicks.",
    results: {
      note: SOURCE_NOTE,
      charts: [
        {
          id: "toyota-clicks",
          type: "line",
          title: "Clicks from Google to the site",
          caption: "Each month, rounded down",
          series: [{ key: "clicks", name: "Clicks", color: "purple" }],
          points: [
            { label: "May", clicks: 60 },
            { label: "June", clicks: 140 },
            { label: "August", clicks: 510 },
          ],
        },
        {
          id: "toyota-views",
          type: "bar",
          title: "Times people saw the site on Google",
          caption: "Each month, rounded down",
          series: [{ key: "views", name: "Google views", color: "purple" }],
          points: [
            { label: "May", views: 1200 },
            { label: "June", views: 3700 },
            { label: "August", views: 17900 },
          ],
        },
        {
          id: "toyota-models",
          type: "bar",
          title: "Views on 'for sale' searches by model",
          caption: "Four weeks before the search work, against August, rounded down",
          series: [
            { key: "before", name: "Before", color: "tint" },
            { key: "after", name: "August", color: "purple" },
          ],
          points: [
            { label: "Fortuner", before: 10, after: 270 },
            { label: "Hilux Single Cab", before: 40, after: 180 },
            { label: "Hilux Double Cab", before: 40, after: 140 },
            { label: "Prado", before: 30, after: 90 },
          ],
        },
      ],
    },
    image: "/website-images/faramatsitoyota-preview.png",
    link: "https://faramatsitoyota.co.zw",
    tags: ["web development", "AI features", "automotive", "Zimbabwe"],
  },
  {
    slug: "mosalex-group",
    order: 3,
    client: "Mosalex Group",
    category: "Website",
    location: "Zimbabwe",
    tagline: "A business group that finally looks as capable as it is.",
    summary:
      "A professional website for a growing Zimbabwean business group with several areas of work.",
    resultLine: "One clear, professional home for every part of the group.",
    heroStats: [],
    problemHeadline: "Many businesses under one name. One confusing first impression.",
    problem:
      "Mosalex Group works across several areas. New clients and partners had no single place to see what the group does or to judge how serious it is.",
    solution:
      "We designed a clean site organised around each of the group's business interests, so a visitor understands the whole group in a minute. It loads fast and reads well on any device.",
    solutionPoints: [
      "One page per area of work, easy to scan",
      "Fast on any phone",
      "A clear way for new clients to make contact",
    ],
    outcomeHeadline: "A website the team is proud to share.",
    outcome:
      "The group now has a polished online presence to send to prospective clients. In their words: professional service from start to finish.",
    image: "/website-images/mosalex-preview.png",
    link: "https://mosalexgroup.com",
    tags: ["web development", "business group", "Zimbabwe"],
  },
  {
    slug: "thee-art-crafts",
    order: 4,
    client: "Thee Art Crafts",
    category: "Website",
    location: "Zimbabwe",
    tagline: "A website that lets the craft speak for itself.",
    summary:
      "A website built to show a Zimbabwean craft business's work and bring in more customers.",
    resultLine: "A brand-matched showcase that beat the client's expectations.",
    heroStats: [],
    problemHeadline: "Handmade work deserves more than a generic template.",
    problem:
      "Thee Art Crafts makes visual, handmade pieces. A stock template would have made everything look the same as every other shop and hidden what makes the work special.",
    solution:
      "We built a site around the work itself, with large images and a look that matches the brand. The client told us we understood their identity straight away.",
    solutionPoints: [
      "Large, clear images that show the craft",
      "A design matched to the brand, not a template",
      "Simple browsing on a phone",
    ],
    outcomeHeadline: "Their main showcase to new customers.",
    outcome:
      "The design exceeded the client's expectations and now works as the business's main showcase.",
    image: "/website-images/theeartcrafts-preview.png",
    link: "https://theeartcrafts.com",
    tags: ["web development", "e-commerce showcase", "Zimbabwe"],
  },
  {
    slug: "kolkart-mining",
    order: 5,
    client: "Kolkart Mining",
    category: "Logo & Brand Identity",
    location: "Zimbabwe",
    tagline: "A logo that looks as solid as a mining company should.",
    summary:
      "A clean, strong logo and brand identity for a Zimbabwean mining company.",
    resultLine: "A strong mark that works on signage, paperwork and screens.",
    heroStats: [],
    problemHeadline: "Mining is a serious business. The brand had to look it.",
    problem:
      "Kolkart Mining needed a logo that shows reliability without looking like every other generic mark in the sector.",
    solution:
      "We designed a clean, strong mark that works on signage, documents and digital use, so the brand looks the same wherever it appears.",
    solutionPoints: [
      "One mark that works at any size",
      "Ready for signage, documents and screens",
      "Clean and simple, easy to remember",
    ],
    outcomeHeadline: "A brand the client is genuinely happy with.",
    outcome: "Clean, strong and representative of the business, in the client's own words.",
    image: "/client-logos/kolkart_mining-clean.png",
    tags: ["logo design", "brand identity", "mining", "Zimbabwe"],
  },
  {
    slug: "excogitate",
    order: 6,
    client: "Excogitate",
    category: "Logo & Brand Identity",
    location: "Zimbabwe",
    tagline: "A distinct mark to build a reputation on.",
    summary:
      "Brand identity design for Excogitate, giving the business a distinct, professional mark.",
    resultLine: "A distinct identity for digital and print.",
    heroStats: [],
    problemHeadline: "To be taken seriously, the business needed to look established.",
    problem:
      "Excogitate was growing its presence in the market and needed a professional identity to build credibility from day one.",
    solution:
      "We designed a distinct logo and brand identity made for the business, ready to use across digital and print materials.",
    solutionPoints: [
      "A distinct mark that stands out",
      "Ready for digital and print",
      "A base the brand can grow on",
    ],
    outcomeHeadline: "The foundation of their market presence.",
    outcome:
      "The business now uses the identity as the base of everything it puts in front of customers.",
    image: "/client-logos/excogitate_logo-clean.png",
    tags: ["logo design", "brand identity", "Zimbabwe"],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getAdjacentStudies(slug: string): { next: CaseStudy } {
  const sorted = [...caseStudies].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((s) => s.slug === slug);
  return { next: sorted[(index + 1) % sorted.length] };
}

export function getTestimonialFor(client: string) {
  return testimonials.find((t) => t.name === client);
}

export const categoryCounts = () => ({
  websites: caseStudies.filter((s) => s.category === "Website").length,
  brands: caseStudies.filter((s) => s.category === "Logo & Brand Identity").length,
});
