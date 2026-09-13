export const siteConfig = {
  name: "Eka",
  legalName: "Eka",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://eka.dev").replace(/\/$/, ""),
  email: "tmuranda1@gmail.com",
  founder: "Tapiwa Muranda",
  linkedin: "https://www.linkedin.com/in/tapiwa-muranda-85747b335/",
  description:
    "Eka builds websites, custom software, and AI automation for businesses in Zimbabwe and across Africa — you only pay when you love the result.",
  tagline: "Web development and AI automation for African businesses.",
  city: "Harare",
  country: "Zimbabwe",
  countryCode: "ZW" as const,
  areaServed: ["Harare", "Zimbabwe", "Africa"],
  ogImage: "/opengraph-image",
} as const;

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
