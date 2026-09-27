import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f6fa]">{children}</div>;
}
