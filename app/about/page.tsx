import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import Experience from "@/components/Experience";
import Reveal from "@/components/Reveal";
import HowWeWork from "@/components/about/HowWeWork";
import PhotoTrio from "@/components/about/PhotoTrio";
import StoryTimeline from "@/components/about/StoryTimeline";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Eka is founded by Tapiwa Muranda, a full-stack developer and AI practitioner based in Harare, Zimbabwe, building websites, custom software, and AI automation for African businesses.",
  path: "/about",
  keywords: ["Tapiwa Muranda", "Eka founder", "software developer Zimbabwe"],
});

const PHOTOS = [
  {
    src: "/images/about/harare-morning.jpg",
    alt: "Harare city centre on a bright morning, with tall buildings above green trees",
  },
  {
    src: "/images/about/victoria-falls-bridge.jpg",
    alt: "The Victoria Falls bridge arching over the Zambezi gorge",
  },
  {
    src: "/images/contact/harare-night.jpg",
    alt: "Harare city centre at dusk with light trails from passing traffic",
  },
];

/** What Eka builds, each wearing its colour from the Services page and linking to that service. */
const WHAT_WE_BUILD = [
  { label: "Websites", href: "/services/web-development", tone: "web" },
  { label: "AI automation", href: "/services/ai-automation", tone: "ai" },
  { label: "Integrations", href: "/services/system-integration", tone: "int" },
  { label: "Custom software", href: "/services/software-development", tone: "soft" },
  { label: "Logos", href: "/services/logo-design", tone: "logo" },
] as const;

const STORY = [
  {
    tone: "web",
    title: "Learned the craft",
    body: "Full-stack development and AI automation at Axis Solutions, plus a JS Mastery certification. Real systems, real deadlines.",
  },
  {
    tone: "ai",
    title: "Started Eka in Harare",
    body: "Too many good Zimbabwean businesses were stuck with slow, forgettable websites, or none at all. So Eka builds first, and you pay only when you love it.",
  },
  {
    tone: "int",
    title: "Real businesses, real results",
    body: "Dealerships, craft makers, mining and more. Faramatsi Motors turned Google searches into quote requests. Every project is a site we are proud to show.",
  },
  {
    tone: "soft",
    title: "Still hands-on",
    body: "Tapiwa reads every request that comes through this site himself, and answers it himself.",
  },
] as const;

// Drop a portrait at public/images/about/tapiwa.jpg and it appears here on the next deploy.
const hasPortrait = fs.existsSync(path.join(process.cwd(), "public", "images", "about", "tapiwa.jpg"));

const AboutPage = () => {
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "About", path: "/about" }]} />

      <section className="mx-auto max-w-3xl pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div className="animate-rise">
          <p aria-hidden="true" className="mb-6 flex items-center justify-center gap-2">
            {["#2563EB", "#7C3AED", "#16A34A", "#F59E0B", "#E5533D"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            About <span className="text-spectrum">Eka.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Eka is a {siteConfig.city}-based web development and AI automation agency, working with businesses across
            Zimbabwe and Africa.
          </p>
        </div>
      </section>

      <PhotoTrio photos={PHOTOS} />

      <section className="mx-auto max-w-2xl pb-16 text-center md:pb-24">
        <Reveal>
          <p className="font-display text-3xl font-bold leading-[1.15] tracking-[-0.02em] md:text-4xl">
            Modern tools, applied to real business problems. <span className="text-purple">Not templates dressed up as custom work.</span>
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            We work with Next.js, TypeScript and AI automation with n8n. That means fast websites, systems that talk to each
            other, and software that does the boring work for you.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            And we work on a zero-risk basis. We build your website, logo or AI system first, and you only pay once you are
            satisfied with the result.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <ul className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
            {WHAT_WE_BUILD.map(({ label, href, tone }) => (
              <li key={label} className={`svc-${tone}`}>
                <Link
                  href={href}
                  className="group inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium transition-[border-color,background-color,transform] duration-200 ease-out-strong hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] active:scale-[0.97]"
                >
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="py-16 md:py-24">
        <Reveal>
          <h2 className="text-center font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            Our <span className="text-purple">story</span>
          </h2>
        </Reveal>
        <div className="mt-14">
          <StoryTimeline steps={[...STORY]} />
        </div>
      </section>

      <section className="mx-auto max-w-2xl py-16 text-center md:py-24">
        <Reveal>
          <div className="mx-auto h-[7.5rem] w-[7.5rem] rounded-full bg-[conic-gradient(from_200deg,#2563eb,#7c3aed,#e5533d,#f59e0b,#16a34a,#2563eb)] p-[3px]">
            <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br from-purple to-[#5b21b6]">
              {hasPortrait ? (
                <Image src="/images/about/tapiwa.jpg" alt="Tapiwa Muranda" fill sizes="120px" className="object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-3xl font-extrabold text-white">
                  TM
                </span>
              )}
            </div>
          </div>
          <h2 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">Tapiwa Muranda</h2>
          <p className="mt-1 text-base font-medium text-muted-foreground">Founder, Eka</p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Tapiwa is a full-stack developer and AI practitioner. Before founding Eka he worked in full-stack development
            and AI automation at Axis Solutions, and he is JS Mastery certified. He reads every request that comes through
            this site himself.
          </p>
        </Reveal>
      </section>

      <section className="py-16 md:py-24">
        <Reveal>
          <h2 className="text-center font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            How we <span className="text-purple">work</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-12 max-w-5xl">
          <HowWeWork />
        </div>
      </section>

      <Experience />

      <Reveal>
        <section className="mb-20 rounded-[2rem] bg-purple/[0.07] px-6 py-14 text-center md:mb-28 md:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            Let&apos;s build something you&apos;ll <span className="text-purple">love.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
            Tell us what you need. We build it first, and you pay only when you love it.
          </p>
          <Link
            href="/contact?from=about#start"
            className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]"
          >
            Start the conversation
            <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
          </Link>
        </section>
      </Reveal>
    </PageShell>
  );
};

export default AboutPage;
