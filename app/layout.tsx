import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eka.dev",
  description:
    "Eka.dev builds AI-powered tools to solve business challenges across Africa, including invoice automation, document processing, ERP integration, and more. Streamline operations and boost efficiency with Eka’s innovative AI solutions.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
