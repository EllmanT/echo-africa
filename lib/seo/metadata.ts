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

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      images,
      locale: "en_ZW",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
