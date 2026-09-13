import Link from "next/link";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { caseStudies } from "@/data/case-studies";

export const metadata: Metadata = buildMetadata({
  title: "Our Work — Websites & Brand Identity for Zimbabwean Businesses",
  description:
    "Case studies of websites, AI features, and brand identity work Eka has built for businesses across Zimbabwe — from motor dealerships to mining companies.",
  path: "/work",
  keywords: [
    "web design portfolio Zimbabwe",
    "website examples Zimbabwe",
    "Eka case studies",
  ],
});

const WorkPage = () => {
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Work", path: "/work" }]} />

      <div className="py-14 max-w-2xl">
        <h1 className="heading text-left">
          Our <span className="text-purple">work</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          A look at websites and brand identities we&apos;ve built for businesses
          across Zimbabwe — real projects, real clients.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pb-20">
        {caseStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/work/${study.slug}`}
            className="rounded-3xl border border-black/[0.06] shadow-input bg-white overflow-hidden group/bento hover:shadow-xl transition duration-200"
          >
            <div className="relative h-56 bg-muted overflow-hidden">
              <img
                src={study.image}
                alt={`${study.client} — ${study.category} project preview`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-wide text-purple font-semibold">
                {study.category}
              </p>
              <h2 className="font-bold text-lg mt-1">{study.client}</h2>
              <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                {study.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
};

export default WorkPage;
