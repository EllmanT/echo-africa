import { notFound } from "next/navigation";
import { FaLocationArrow, FaArrowUpRightFromSquare } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import MagicButton from "@/components/MagicButton";
import { buildMetadata } from "@/lib/seo/metadata";
import { caseStudies, getCaseStudyBySlug } from "@/data/case-studies";

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const study = getCaseStudyBySlug(params.slug);
  if (!study) return {};

  return buildMetadata({
    title: `${study.client} — ${study.category} Case Study`,
    description: study.summary,
    path: `/work/${study.slug}`,
    keywords: study.tags,
  });
}

const CaseStudyPage = ({ params }: { params: { slug: string } }) => {
  const study = getCaseStudyBySlug(params.slug);
  if (!study) notFound();

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: "Work", path: "/work" },
          { name: study.client, path: `/work/${study.slug}` },
        ]}
      />

      <div className="py-14 max-w-3xl">
        <p className="text-purple text-sm font-semibold uppercase tracking-wide">
          {study.category} &middot; {study.location}
        </p>
        <h1 className="heading text-left mt-2">{study.client}</h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          {study.summary}
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden border border-black/[0.06] shadow-input mb-14 max-w-4xl">
        <img
          src={study.image}
          alt={`${study.client} ${study.category.toLowerCase()} — Eka project`}
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8 pb-16 max-w-4xl">
        <div>
          <h2 className="font-bold text-lg">The problem</h2>
          <p className="text-muted-foreground mt-2 text-sm">{study.problem}</p>
        </div>
        <div>
          <h2 className="font-bold text-lg">What we did</h2>
          <p className="text-muted-foreground mt-2 text-sm">{study.solution}</p>
        </div>
        <div>
          <h2 className="font-bold text-lg">The outcome</h2>
          <p className="text-muted-foreground mt-2 text-sm">{study.outcome}</p>
        </div>
      </div>

      <div className="pb-20 flex flex-wrap gap-3 items-center">
        {study.link && (
          <a href={study.link} target="_blank" rel="noopener noreferrer">
            <MagicButton
              title="Visit live site"
              icon={<FaArrowUpRightFromSquare />}
              position="right"
            />
          </a>
        )}
        <a href="mailto:tmuranda1@gmail.com">
          <MagicButton
            title="Start a similar project"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>
    </PageShell>
  );
};

export default CaseStudyPage;
