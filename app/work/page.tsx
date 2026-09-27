import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowDown } from "react-icons/fa6";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqSection from "@/components/FaqSection";
import Reveal from "@/components/Reveal";
import ProjectRow from "@/components/work/ProjectRow";
import LogoTile from "@/components/work/LogoTile";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPublishedProjects, projectCategoryCounts } from "@/lib/content/projects";
import { getFaqsForPage } from "@/lib/content/faqs";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Our Work: Websites and Logos That Bring in Customers",
  description:
    "See the problem, the fix and the result for every project. Websites and brand identities Eka has built for businesses across Zimbabwe, from motor dealerships to mining companies.",
  path: "/work",
  keywords: ["web design portfolio Zimbabwe", "website examples Zimbabwe", "Eka case studies"],
});

const WorkPage = async () => {
  const [caseStudies, faqs] = await Promise.all([getPublishedProjects(), getFaqsForPage("work")]);
  const websites = caseStudies.filter((s) => s.category === "Website");
  const brands = caseStudies.filter((s) => s.category === "Logo & Brand Identity");
  const counts = projectCategoryCounts(caseStudies);

  const categories: { label: string; count: number | null; href?: string }[] = [
    { label: "Websites", count: counts.websites, href: "#websites" },
    { label: "Logos and brands", count: counts.brands, href: "#brands" },
    { label: "AI automation", count: null },
  ];

  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Work", path: "/work" }]} />

      <section className="mx-auto max-w-4xl pb-16 pt-14 text-center md:pb-24 md:pt-20">
        <div className="animate-rise">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            Work that brings in <span className="text-purple">customers.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Real projects for real Zimbabwean businesses. For each one you can see the problem, what we did and what
            happened next.
          </p>
        </div>

        <div className="animate-rise" style={{ animationDelay: "100ms" }}>
          <ul className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
            {categories.map((c) => {
              const inner = (
                <>
                  <span className="font-display text-5xl font-extrabold tracking-[-0.04em] text-foreground transition-colors duration-200 group-hover:text-purple">
                    {c.count ?? "Soon"}
                  </span>
                  <span className="mt-1 flex items-center justify-between text-sm font-medium text-muted-foreground">
                    {c.label}
                    {c.href && <FaArrowDown size={12} aria-hidden="true" />}
                  </span>
                </>
              );
              return (
                <li key={c.label}>
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="group flex h-full flex-col rounded-2xl border border-black/[0.08] bg-white px-6 py-5 text-left transition-[border-color,transform] duration-200 ease-out-strong hover:border-purple/40 active:scale-[0.98]"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="group flex h-full flex-col rounded-2xl border border-dashed border-black/[0.12] px-6 py-5 text-left opacity-80">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="websites" className="scroll-mt-24 pb-16 md:pb-28">
        <Reveal>
          <h2 className="text-center font-display text-6xl font-extrabold tracking-[-0.04em] md:text-8xl">Websites</h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-lg text-muted-foreground">
            Fast, clear and built to turn visitors into enquiries.
          </p>
        </Reveal>
        <div className="mt-12 md:mt-16">
          {websites.map((study, i) => (
            <ProjectRow key={study.slug} study={study} priority={i === 0} />
          ))}
        </div>
      </section>

      <section id="brands" className="scroll-mt-24 border-t border-black/[0.08] pb-8 pt-16 md:pt-28">
        <Reveal>
          <h2 className="text-center font-display text-6xl font-extrabold tracking-[-0.04em] md:text-8xl">
            Logos and brands
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-lg text-muted-foreground">
            Marks that look serious on a sign, a document and a phone screen.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-14 md:mt-16 md:grid-cols-2">
          {brands.map((study) => (
            <LogoTile key={study.slug} study={study} />
          ))}
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </PageShell>
  );
};

export default WorkPage;
