import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaMobileScreenButton, FaShieldHalved, FaComments } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import Experience from "@/components/Experience";
import Reveal from "@/components/Reveal";
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
    ratio: "aspect-[3/4]",
    offset: "md:mt-10",
    delay: 0,
  },
  {
    src: "/images/about/victoria-falls-bridge.jpg",
    alt: "The Victoria Falls bridge arching over the Zambezi gorge",
    ratio: "aspect-[3/4]",
    offset: "",
    delay: 0.1,
  },
  {
    src: "/images/contact/harare-night.jpg",
    alt: "Harare city centre at dusk with light trails from passing traffic",
    ratio: "aspect-[3/4]",
    offset: "md:mt-10",
    delay: 0.2,
  },
];

const HOW_WE_WORK = [
  {
    Icon: FaShieldHalved,
    title: "We build it first",
    body: "You see the finished work before you pay. Love it, pay. Do not, walk away.",
  },
  {
    Icon: FaComments,
    title: "Plain words",
    body: "No jargon and no fog. You always know what we are doing and why.",
  },
  {
    Icon: FaMobileScreenButton,
    title: "Made for phones",
    body: "Most of your customers are on a phone with limited data. We build for that first.",
  },
];

// Drop a portrait at public/images/about/tapiwa.jpg and it appears here on the next deploy.
const hasPortrait = fs.existsSync(path.join(process.cwd(), "public", "images", "about", "tapiwa.jpg"));

const AboutPage = () => {
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "About", path: "/about" }]} />

      <section className="mx-auto max-w-3xl pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div className="animate-rise">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            About <span className="text-purple">Eka.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Eka is a {siteConfig.city}-based web development and AI automation agency, working with businesses across
            Zimbabwe and Africa.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-3 pb-16 md:gap-6 md:pb-24">
        {PHOTOS.map((p) => (
          <Reveal key={p.src} delay={p.delay} className={p.offset}>
            <div className={`relative ${p.ratio} overflow-hidden rounded-2xl bg-muted md:rounded-[2rem]`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 896px) 270px, 33vw" className="object-cover" />
            </div>
          </Reveal>
        ))}
      </div>

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
      </section>

      <section className="mx-auto max-w-2xl border-t border-black/[0.08] py-16 text-center md:py-24">
        <Reveal>
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-black/[0.06] bg-gradient-to-br from-purple to-[#5b21b6]">
            {hasPortrait ? (
              <Image src="/images/about/tapiwa.jpg" alt="Tapiwa Muranda" fill sizes="112px" className="object-cover" />
            ) : (
              <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-3xl font-extrabold text-white">
                TM
              </span>
            )}
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

      <section className="border-t border-black/[0.08] py-16 md:py-24">
        <Reveal>
          <h2 className="text-center font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            How we <span className="text-purple">work</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-4xl divide-y divide-black/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0">
          {HOW_WE_WORK.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08} className="px-4 py-8 text-center md:px-8 md:py-4">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple/10 text-purple">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-base leading-relaxed text-muted-foreground">{body}</p>
            </Reveal>
          ))}
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
            href="/contact"
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
