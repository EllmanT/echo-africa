import type { Metadata } from "next";
import { siteConfig } from "./site";

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
}): Metadata {
  // Pages without a distinct `image` inherit the root app/opengraph-image.tsx
  // via Next's file-convention metadata resolution — no need to repeat it here.
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined;

  // Next's `title.template` only rewrites the <title> tag, not openGraph/twitter
  // titles — apply the same "%s | Eka — ..." suffix here so shared links match
  // what shows in the browser tab, rather than showing a bare "About"/"Contact".
  const socialTitle = title.includes(siteConfig.name) ? title : `${title} | Eka — Web & AI Development in Zimbabwe`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      images,
      locale: "en_ZW",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}
