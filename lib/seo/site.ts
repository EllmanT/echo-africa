export const siteConfig = {
  name: "Eka",
  legalName: "Eka",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eka.dev").replace(/\/$/, ""),
  email: "tmuranda1@gmail.com",
  whatsappNumber: "263778115084",
  whatsappDisplay: "+263 77 811 5084",
  calUrl: "https://cal.com/tapiwa-muranda-midm4h",
  founder: "Tapiwa Muranda",
  linkedin: "https://www.linkedin.com/in/tapiwa-muranda-85747b335/",
  // Public social and contact links. Empty strings are hidden in the footer.
  // TODO(owner): add the Facebook page link when it is ready.
  social: {
    linkedin: "https://www.linkedin.com/in/tapiwa-muranda-85747b335/",
    facebook: "",
    whatsapp: "https://wa.me/263778115084",
    instagram: "",
    x: "",
    youtube: "",
  },
  description:
    "Eka builds websites, custom software, and AI automation for businesses in Zimbabwe and across Africa. You only pay when you love the result.",
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
