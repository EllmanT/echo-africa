export type CaseStudy = {
  slug: string;
  client: string;
  category: "Website" | "Logo & Brand Identity";
  location: string;
  summary: string;
  problem: string;
  solution: string;
  outcome: string;
  image: string;
  link?: string;
  tags: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "faramatsi-motors",
    client: "Faramatsi Motors",
    category: "Website",
    location: "Harare, Zimbabwe",
    summary:
      "A fast, mobile-friendly website for one of Harare's motor dealerships, built to load quickly on any device and make it easy for buyers to browse stock and get in touch.",
    problem:
      "Faramatsi Motors needed a professional web presence that could showcase their vehicle stock and build trust with buyers browsing on mobile data in Zimbabwe, where slow, bloated websites lose customers fast.",
    solution:
      "We designed and built a clean, fast-loading website optimised for mobile devices and Zimbabwean network conditions, with clear vehicle listings and direct contact paths for interested buyers.",
    outcome:
      "A website that works reliably on any device, giving the dealership a professional online presence that matches the quality of their in-person service.",
    image: "/website-images/faramatsimotors-preivew.png",
    link: "https://faramatsimotors.co.zw",
    tags: ["web development", "motor dealership", "Harare"],
  },
  {
    slug: "faramatsi-toyota",
    client: "Faramatsi Toyota",
    category: "Website",
    location: "Zimbabwe",
    summary:
      "A modern website for Zimbabwe's Toyota dealership, combining clean design with AI-assisted features the client's team didn't expect from a local web project.",
    problem:
      "As an official Toyota dealership, Faramatsi Toyota needed a website that reflected the brand's standards while still feeling built specifically for the Zimbabwean market.",
    solution:
      "We built a modern, brand-appropriate site and layered in AI-assisted features to help the team manage and present their vehicle catalogue more efficiently than a typical dealership site.",
    outcome:
      "A dealership website the client's team describes as exceeding expectations — modern, professional, and genuinely useful day to day.",
    image: "/website-images/faramatsitoyota-preview.png",
    link: "https://faramatsitoyota.co.zw",
    tags: ["web development", "AI features", "automotive", "Zimbabwe"],
  },
  {
    slug: "mosalex-group",
    client: "Mosalex Group",
    category: "Website",
    location: "Zimbabwe",
    summary:
      "A professional website for a growing Zimbabwean business group, built to help win new clients and present the group's range of interests clearly.",
    problem:
      "Mosalex Group needed a site that could present a multi-interest business group professionally and credibly to prospective clients and partners.",
    solution:
      "We designed a clean, professional site structured around the group's different business interests, built to load fast and present well on any device.",
    outcome:
      "A polished online presence the client is proud to share with prospective clients — professional service from start to finish, in their own words.",
    image: "/website-images/mosalex-preview.png",
    link: "https://mosalexgroup.com",
    tags: ["web development", "business group", "Zimbabwe"],
  },
  {
    slug: "thee-art-crafts",
    client: "Thee Art Crafts",
    category: "Website",
    location: "Zimbabwe",
    summary:
      "A website built to showcase a Zimbabwean craft business's work and bring in more customers, with a design that immediately understood the brand.",
    problem:
      "Thee Art Crafts needed an online showcase that did justice to the visual, handmade nature of their work — something a generic template couldn't deliver.",
    solution:
      "We built a site designed specifically to let the craft work speak for itself visually, with a brand-matched design the client noted understood their identity immediately.",
    outcome:
      "A website that exceeded the client's expectations for design quality, now serving as the business's main showcase to new customers.",
    image: "/website-images/theeartcrafts-preview.png",
    link: "https://theeartcrafts.com",
    tags: ["web development", "e-commerce showcase", "Zimbabwe"],
  },
  {
    slug: "kolkart-mining",
    client: "Kolkart Mining",
    category: "Logo & Brand Identity",
    location: "Zimbabwe",
    summary:
      "A clean, strong logo and brand identity for a Zimbabwean mining company, designed to represent the business professionally across all its materials.",
    problem:
      "Kolkart Mining needed a logo that projected the seriousness and reliability expected in the mining sector, without an identity that felt generic.",
    solution:
      "We designed a clean, strong mark built to work across signage, documents, and digital use — representing the brand consistently wherever it appears.",
    outcome:
      "A logo the client is genuinely happy with — clean, strong, and representative of their brand, in their own words.",
    image: "/client-logos/kolkart_mining-clean.png",
    tags: ["logo design", "brand identity", "mining", "Zimbabwe"],
  },
  {
    slug: "excogitate",
    client: "Excogitate",
    category: "Logo & Brand Identity",
    location: "Zimbabwe",
    summary:
      "Brand identity design for Excogitate, built to give the business a distinct, professional mark to build on.",
    problem:
      "Excogitate needed a professional brand identity to establish credibility as they grew their presence in the market.",
    solution:
      "We designed a distinct logo and brand identity tailored to the business, ready to use across digital and print materials.",
    outcome:
      "A professional brand identity the business now uses as the foundation of its market presence.",
    image: "/client-logos/excogitate_logo-clean.png",
    tags: ["logo design", "brand identity", "Zimbabwe"],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
