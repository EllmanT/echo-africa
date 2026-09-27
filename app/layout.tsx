import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";

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
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Eka | Web Development & AI Automation Agency in Zimbabwe",
    template: "%s | Eka",
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
    title: "Eka | Web Development & AI Automation Agency in Zimbabwe",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_ZW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eka | Web Development & AI Automation Agency in Zimbabwe",
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
      <body className={`${inter.className} ${display.variable}`}>
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
