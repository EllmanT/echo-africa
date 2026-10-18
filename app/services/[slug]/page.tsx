import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowRight } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import FaqSection from "@/components/FaqSection";
import Reveal from "@/components/Reveal";
import StoryTimeline from "@/components/about/StoryTimeline";
import PhotoReveal from "@/components/services/PhotoReveal";
import VisualFrame from "@/components/services/VisualFrame";
import {
  AutomationVisual,
  IntegrationVisual,
  LogoVisual,
  SoftwareVisual,
  WebVisual,
} from "@/components/services/visuals";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildServiceSchema } from "@/lib/seo/structured-data";
import { services, getServiceBySlug } from "@/data/services";
import { servicePageExtras } from "@/data/service-pages";

const VISUALS = {
  "web-development": WebVisual,
  "ai-automation": AutomationVisual,
  "system-integration": IntegrationVisual,
  "software-development": SoftwareVisual,
  "logo-design": LogoVisual,
} as const;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return buildMetadata({
    title: `${service.name} in Zimbabwe`,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
    keywords: service.keywords,
  });
}

const ServicePage = async ({ params: paramsPromise }: { params: Promise<{ slug: string }> }) => {
  const params = await paramsPromise;
  const service = getServiceBySlug(params.slug);
  const extras = servicePageExtras[params.slug];
  if (!service || !extras) notFound();

  const Visual = VISUALS[service.slug as keyof typeof VISUALS];
  const others = services.filter((s) => s.slug !== service.slug);
  const steps = extras.steps.map((s) => ({ ...s, tone: extras.tone }));

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ]}
      />
      <JsonLd
        data={buildServiceSchema({
          name: service.name,
          description: service.shortDescription,
          path: `/services/${service.slug}`,
        })}
      />

      <div className={`svc-${extras.tone}`}>
        <section className="grid items-center gap-10 pb-16 pt-12 md:grid-cols-2 md:gap-16 md:pb-24 md:pt-20 lg:gap-24">
          <div className="animate-rise">
            <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-ink)]">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent)]" />
              {service.name}
            </p>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-6xl">
              {extras.tagline}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">{service.heroDescription}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={extras.quoteHref}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-[color:var(--accent-ink)] active:scale-[0.97]"
              >
                Get a quote
                <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
              </Link>
              <Link
                href="/services"
                className="text-base font-medium text-foreground underline decoration-black/25 underline-offset-4 transition-colors hover:text-[color:var(--accent-ink)] hover:decoration-[color:var(--accent)]"
              >
                All services
              </Link>
            </div>
          </div>
          <div className="animate-rise" style={{ animationDelay: "120ms" }}>
            <VisualFrame label={extras.visualLabel}>
              <Visual />
            </VisualFrame>
          </div>
        </section>

        <section aria-label="Photos" className="grid gap-4 pb-16 md:grid-cols-[1.6fr_1fr] md:items-end md:gap-6 md:pb-24">
          <PhotoReveal
            src={extras.photos[0].src}
            alt={extras.photos[0].alt}
            sizes="(min-width: 768px) 60vw, 100vw"
            className="aspect-[16/10]"
          />
          <PhotoReveal
            src={extras.photos[1].src}
            alt={extras.photos[1].alt}
            sizes="(min-width: 768px) 38vw, 100vw"
            className="aspect-[4/3] md:aspect-[4/5]"
            delay={0.15}
          />
        </section>

        <section aria-labelledby="gets-heading" className="pb-16 md:pb-24">
          <Reveal>
            <h2 id="gets-heading" className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
              What you <span className="text-[color:var(--accent)]">get</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
            {service.features.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 2) * 0.08}>
                <div className="group h-full rounded-3xl border border-black/[0.08] bg-white p-7 transition-[border-color,background-color] duration-300 ease-out-strong hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent-soft)] md:p-8">
                  <span className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-[color:var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight md:text-2xl">{feature.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section aria-labelledby="steps-heading" className="pb-16 md:pb-24">
          <Reveal>
            <h2 id="steps-heading" className="text-center font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
              {extras.stepsHeading}
            </h2>
          </Reveal>
          <div className="mt-12">
            <StoryTimeline steps={steps} solid />
          </div>
        </section>
      </div>

      <FaqSection faqs={service.faqs} heading="Frequently asked questions" id="service-faq" />

      <section aria-label="Other services" className="pb-16 md:pb-24">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
            More from <span className="text-purple">Eka</span>
          </h2>
        </Reveal>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {others.map((s) => {
            const tone = servicePageExtras[s.slug]?.tone;
            return (
              <li key={s.slug} className={`svc-${tone}`}>
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 py-2.5 text-base font-medium transition-[border-color,background-color,transform] duration-200 ease-out-strong hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] active:scale-[0.97]"
                >
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                  {s.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Reveal>
        <section className={`svc-${extras.tone} mb-20 rounded-[2rem] bg-[color:var(--accent-soft)] px-6 py-14 text-center md:mb-28 md:py-20`}>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            See it built <span className="text-[color:var(--accent)]">before you pay.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
            Tell us what you need. We build it first, and you pay only when you love it.
          </p>
          <Link
            href={extras.quoteHref}
            className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-[color:var(--accent-ink)] active:scale-[0.97]"
          >
            Start the conversation
            <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
          </Link>
        </section>
      </Reveal>
    </PageShell>
  );
};

export default ServicePage;
