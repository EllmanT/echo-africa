"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import { FaArrowRight, FaCircleQuestion, FaCode, FaGlobe, FaPenNib, FaPlug, FaRobot } from "react-icons/fa6";

import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

type Option = { key: string; title: string; line: string; color: string; Icon: IconType };

// Same colour per service as the hero dots and the Services page: blue web, purple AI, green integration, amber software, coral logos.
const OPTIONS: Option[] = [
  { key: "website", title: "A website that gets you customers", line: "Built in days. You pay only if you love it.", color: "#2563EB", Icon: FaGlobe },
  { key: "logo", title: "A logo you are proud of", line: "See the ideas before you pay a cent.", color: "#E5533D", Icon: FaPenNib },
  { key: "ai-automation", title: "AI that does the boring work", line: "Hand repeat tasks to software. Get your hours back.", color: "#7C3AED", Icon: FaRobot },
  { key: "custom-software", title: "Software built around you", line: "Your way of working, not a template.", color: "#F59E0B", Icon: FaCode },
  { key: "system-integration", title: "Your tools, talking to each other", line: "Stop typing the same thing three times.", color: "#16A34A", Icon: FaPlug },
  { key: "not-sure", title: "Not sure yet?", line: "Tell us the problem. We point you to the fix.", color: "#6A6D7C", Icon: FaCircleQuestion },
];

/**
 * First qualification question, on the homepage. A tap carries the choice into the form, which opens on the next
 * step with this service already picked. Links, not buttons: it navigates, and it works before any JS loads.
 */
const ServicePicker = () => (
  <section id="start-here" aria-labelledby="picker-heading" className="relative py-16 md:py-24">
    <Reveal>
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="picker-heading" className="heading">
          What do you need?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:text-lg">
          Tap one. Two minutes, no commitment. We build it first, you pay only when you love it.
        </p>
      </div>
    </Reveal>

    <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {OPTIONS.map(({ key, title, line, color, Icon }, i) => (
        <li key={key}>
          <Reveal delay={i * 0.05} className="h-full">
            <Link
              href={`/contact?service=${key}&from=home-picker#start`}
              style={{ ["--accent" as string]: color }}
              className={cn(
                "group flex h-full flex-col rounded-3xl border border-black/[0.08] bg-white p-6 md:p-7",
                "transition-[transform,border-color,box-shadow] duration-200 ease-out-strong",
                "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/20",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:border-[color:var(--accent)]"
              )}
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: color }}
              >
                <Icon size={20} />
              </span>
              <span className="mt-5 block font-display text-xl font-bold leading-snug tracking-tight md:text-2xl">{title}</span>
              <span className="mt-2 block text-base leading-snug text-muted-foreground">{line}</span>
              <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold" style={{ color }}>
                Start here
                <FaArrowRight size={12} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  </section>
);

export default ServicePicker;
