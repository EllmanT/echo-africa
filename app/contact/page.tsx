import Image from "next/image";
import type { Metadata } from "next";
import { FaEnvelope, FaWhatsapp } from "react-icons/fa6";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqSection from "@/components/FaqSection";
import LeadForm from "@/components/funnel/LeadForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import { getFaqsForPage } from "@/lib/content/faqs";
import { getPricingConfig } from "@/lib/content/pricing";

// Prices are edited in the admin, so re-check them every minute (the admin also revalidates on save).
export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Start Your Project: Website, Logo or AI Automation",
  description:
    "Tell us what you need in about two minutes. We build it first and you pay only when you love it. Based in Harare, working with businesses across Africa.",
  path: "/contact",
  keywords: ["contact web developer Zimbabwe", "hire AI automation agency Harare", "website quote Zimbabwe"],
});

const NEXT_STEPS = [
  {
    title: "You tell us what you need",
    body: "About two minutes. You pick the level that fits, and we tailor it to your business.",
  },
  {
    title: "You hear from us straight away",
    body: "An email lands in your inbox with your next step. If it looks like a fit, you can book a call right after you send.",
  },
  {
    title: "We build it, you decide",
    body: "We build first. You look at it, ask for changes, and pay only when you love it.",
  },
];

const ContactPage = async () => {
  const [faqs, pricing] = await Promise.all([getFaqsForPage("contact"), getPricingConfig()]);
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />

      <section className="mx-auto max-w-3xl pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div className="animate-rise">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            Tell us about your <span className="text-purple">project.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Two minutes. No commitment. We build it first, and you pay only when you love it.
          </p>
        </div>
      </section>

      <div className="animate-rise relative overflow-hidden rounded-[2rem]" style={{ animationDelay: "120ms" }}>
        <div className="relative aspect-[16/8] w-full md:aspect-[21/8]">
          <Image
            src="/images/contact/harare-night.jpg"
            alt="Harare city centre at dusk with light trails from passing traffic"
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-[50%_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <p className="absolute bottom-5 left-6 right-6 font-display text-xl font-bold text-white md:bottom-8 md:left-10 md:text-3xl">
            Built in Harare, for businesses across Africa.
          </p>
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl gap-14 py-16 md:py-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
        <div className="relative">
          <LeadForm pricing={pricing} />
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-900 lg:aspect-[4/4.4]">
            <Image
              src="/images/contact/reception.jpg"
              alt="A warm, modern reception with a marble desk, timber wall and pendant lights"
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <p className="absolute inset-x-6 bottom-6 font-display text-xl font-bold leading-snug tracking-tight text-white md:text-2xl">
              Every request is read by the founder, personally.
            </p>
          </div>

          <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">What happens next</h2>
          <ol className="relative mt-6 space-y-7">
            <span aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px bg-purple/20" />
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4">
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-purple ring-1 ring-purple/30"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 space-y-3 border-t border-black/[0.08] pt-8">
            <p className="text-sm text-muted-foreground">Prefer to talk right now?</p>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi Tapiwa, I'd like to talk about a project.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 font-semibold transition-colors hover:text-purple"
            >
              <FaWhatsapp size={20} className="text-[#25D366]" />
              {siteConfig.whatsappDisplay}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-3 font-semibold transition-colors hover:text-purple"
            >
              <FaEnvelope size={18} className="text-purple" />
              {siteConfig.email}
            </a>
          </div>
        </aside>
      </section>

      <FaqSection faqs={faqs} heading="Quick answers" />
    </PageShell>
  );
};

export default ContactPage;
