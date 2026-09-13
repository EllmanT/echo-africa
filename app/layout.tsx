import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "./provider";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/seo/site";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/structured-data";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Eka — Web Development & AI Automation Agency in Zimbabwe",
    template: "%s | Eka — Web & AI Development in Zimbabwe",
  },
  description: siteConfig.description,
  keywords: [
    "web development Zimbabwe",
    "software development company Harare",
    "AI automation Zimbabwe",
    "custom software development Zimbabwe",
    "web developer Harare",
    "AI agency Africa",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Eka — Web Development & AI Automation Agency in Zimbabwe",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_ZW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eka — Web Development & AI Automation Agency in Zimbabwe",
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/eka-logo.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: { url: "/eka-logo.png", sizes: "512x512", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <JsonLd data={buildOrganizationSchema()} />
        <JsonLd data={buildWebSiteSchema()} />
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
