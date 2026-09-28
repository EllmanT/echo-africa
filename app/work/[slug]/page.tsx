import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowRight, FaArrowUpRightFromSquare, FaCheck } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqSection from "@/components/FaqSection";
import Reveal from "@/components/Reveal";
import ResultsChart from "@/components/work/ResultsChart";
import Testimonial from "@/components/work/Testimonial";
import { buildMetadata } from "@/lib/seo/metadata";
import { getTestimonialFor } from "@/data/case-studies";
import { getAllProjectSlugs, getNextProject, getPublishedProjects } from "@/lib/content/projects";
import { getFaqsForPage } from "@/lib/content/faqs";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const all = await getPublishedProjects();
  const study = all.find((s) => s.slug === params.slug);
  if (!study) return {};

  return buildMetadata({
    title: `${study.client}: ${study.tagline}`,
    description: study.summary,
    path: `/work/${study.slug}`,
    keywords: study.tags,
  });
}

const CaseStudyPage = async ({ params }: { params: { slug: string } }) => {
  const [all, faqs] = await Promise.all([getPublishedProjects(), getFaqsForPage("project")]);
  const study = all.find((s) => s.slug === params.slug);
  if (!study) notFound();

  const next = getNextProject(all, study.slug);
  const testimonial = getTestimonialFor(study.client);
  const isBrand = study.category === "Logo & Brand Identity";

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: "Work", path: "/work" },
          { name: study.client, path: `/work/${study.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="mx-auto max-w-5xl pb-14 pt-14 text-center md:pb-20 md:pt-20">
        <div className="animate-rise">
          <p className="text-base font-medium text-muted-foreground">
            {study.client} <span aria-hidden="true">&middot;</span> {study.location}
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            {study.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {study.summary}
          </p>
          {study.link && (
            <a
              href={study.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/[0.12] bg-white px-7 text-base font-medium transition-[border-color,color,transform] duration-200 ease-out-strong hover:border-purple/50 hover:text-purple active:scale-[0.97]"
            >
              Visit the live site
              <FaArrowUpRightFromSquare size={13} />
            </a>
          )}
        </div>
      </section>

      <div className="animate-rise" style={{ animationDelay: "120ms" }}>
        <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-muted">
          <div className={isBrand ? "relative aspect-[16/9]" : "relative aspect-[16/10]"}>
            <Image
              src={study.image}
              alt={`${study.client} ${isBrand ? "logo" : "website preview"}`}
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className={isBrand ? "object-contain p-12 md:p-24" : "object-cover object-top"}
            />
          </div>
        </div>
      </div>

      {/* Stats lead */}
      {study.heroStats.length > 0 && (
        <section aria-label="Results at a glance" className="py-16 md:py-24">
          <dl className="grid divide-y divide-black/[0.08] border-y border-black/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0">
            {study.heroStats.map((stat) => (
              <Reveal key={stat.label} className="px-2 py-8 text-center md:px-8 md:py-12">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-6xl font-extrabold tracking-[-0.04em] text-purple md:text-7xl">
                    {stat.value}
                  </span>
                  <span className="mx-auto mt-3 block max-w-[16rem] text-base leading-snug text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      {/* Problem */}
      <section className="grid gap-8 py-14 md:grid-cols-[1fr_1.3fr] md:gap-20 md:py-24">
        <Reveal>
          <h2 className="font-display text-6xl font-extrabold leading-[0.98] tracking-[-0.04em] md:sticky md:top-28 md:text-8xl">
            The <span className="text-purple">problem</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="md:pt-3">
          <p className="font-display text-3xl font-bold leading-[1.15] tracking-[-0.02em] md:text-4xl">
            {study.problemHeadline}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">{study.problem}</p>
        </Reveal>
      </section>

      {/* What we did */}
      <section className="grid gap-8 border-t border-black/[0.08] py-14 md:grid-cols-[1fr_1.3fr] md:gap-20 md:py-24">
        <Reveal>
          <h2 className="font-display text-6xl font-extrabold leading-[0.98] tracking-[-0.04em] md:sticky md:top-28 md:text-8xl">
            What we <span className="text-purple">did</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="md:pt-3">
          <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">{study.solution}</p>
          <ul className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {study.solutionPoints.map((point) => (
              <li key={point} className="flex items-start gap-4 py-4 text-base md:text-lg">
                <FaCheck size={14} className="mt-1.5 shrink-0 text-purple" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Results charts */}
      {study.results && (
        <section aria-labelledby="results-heading" className="border-t border-black/[0.08] py-14 md:py-24">
          <Reveal>
            <h2
              id="results-heading"
              className="mx-auto max-w-3xl text-center font-display text-4xl font-bold leading-[1.08] tracking-[-0.03em] md:text-6xl"
            >
              The results, in numbers
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-x-16">
            {study.results.charts.map((chart, i) => (
              <Reveal key={chart.id} delay={i * 0.06} className={study.results!.charts.length % 2 === 1 && i === 0 ? "md:col-span-2" : ""}>
                <ResultsChart chart={chart} />
              </Reveal>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-xl text-center text-sm text-muted-foreground">{study.results.note}</p>
        </section>
      )}

      {/* Outcome */}
      <section className="border-t border-black/[0.08] py-16 text-center md:py-28">
        <Reveal>
          <h2 className="font-display text-6xl font-extrabold leading-[0.98] tracking-[-0.04em] md:text-8xl">
            The <span className="text-purple">outcome</span>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl font-display text-3xl font-bold leading-[1.15] tracking-[-0.02em] md:text-4xl">
            {study.outcomeHeadline}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {study.outcome}
          </p>
        </Reveal>

        {testimonial && <Testimonial quote={testimonial.quote} name={testimonial.name} title={testimonial.title} />}
      </section>

      {/* Next project */}
      <section aria-label="Next project" className="border-t border-black/[0.08] py-14 md:py-20">
        <Link href={`/work/${next.slug}`} className="group block text-center">
          <span className="text-base text-muted-foreground">Next project</span>
          <span className="mt-3 flex items-center justify-center gap-4 font-display text-5xl font-extrabold tracking-[-0.04em] transition-colors duration-200 group-hover:text-purple md:text-7xl">
            {next.client}
            <FaArrowRight
              className="shrink-0 transition-transform duration-200 ease-out-strong group-hover:translate-x-2"
              size={28}
              aria-hidden="true"
            />
          </span>
        </Link>
      </section>

      <FaqSection faqs={faqs} heading="Before you decide" />
    </PageShell>
  );
};

export default CaseStudyPage;
