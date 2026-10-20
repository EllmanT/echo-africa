"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

import { AutomationScene, IntegrationScene, LogoScene, NotSureScene, SoftwareScene, WebScene } from "@/components/picker/Scenes";
import Reveal from "@/components/Reveal";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

type Layout = "feature" | "wide" | "compact";
type Option = { key: string; title: string; line: string; color: string; layout: Layout; className: string; Scene: () => React.JSX.Element };

const EASE = [0.23, 1, 0.32, 1] as const;

// Same colour per service as the hero dots and the Services page: blue web, purple AI, green integration, amber software, coral logos.
// The order is the order of the bento: the website leads, the two "do the work for me" services stack beside it.
const OPTIONS: Option[] = [
  { key: "website", title: "A website that gets you customers", line: "Built in days. You pay only if you love it.", color: "#2563EB", layout: "feature", className: "md:col-span-2 lg:col-span-3 lg:row-span-2", Scene: WebScene },
  { key: "ai-automation", title: "AI that does the boring work", line: "Hand repeat tasks to software. Get your hours back.", color: "#7C3AED", layout: "wide", className: "lg:col-span-3", Scene: AutomationScene },
  { key: "system-integration", title: "Your tools, talking to each other", line: "Stop typing the same thing three times.", color: "#16A34A", layout: "wide", className: "lg:col-span-3", Scene: IntegrationScene },
  { key: "logo", title: "A logo you are proud of", line: "See the ideas before you pay a cent.", color: "#E5533D", layout: "compact", className: "lg:col-span-2", Scene: LogoScene },
  { key: "custom-software", title: "Software built around you", line: "Your way of working, not a template.", color: "#D97706", layout: "compact", className: "lg:col-span-2", Scene: SoftwareScene },
  { key: "not-sure", title: "Not sure yet?", line: "Tell us the problem. We point you to the fix.", color: "#3A3D4A", layout: "compact", className: "md:col-span-2 lg:col-span-2", Scene: NotSureScene },
];

const sceneBox: Record<Layout, string> = {
  feature: "lg:absolute lg:inset-x-6 lg:bottom-4 lg:mt-0 lg:h-[54%]",
  wide: "lg:absolute lg:right-3 lg:top-1/2 lg:mt-0 lg:h-[88%] lg:w-[52%] lg:-translate-y-1/2",
  compact: "lg:absolute lg:inset-x-4 lg:bottom-1 lg:mt-0 lg:h-[46%]",
};
const textBox: Record<Layout, string> = {
  feature: "lg:max-w-[22rem]",
  wide: "lg:max-w-[44%]",
  compact: "lg:max-w-none",
};

/** A circle that is a plus until it is chosen, then a filled check: the tile tells you it is a choice and what you chose. */
const Mark = ({ on, color }: { on: boolean; color: string }) => (
  <span aria-hidden="true" className="absolute right-4 top-4 z-10 h-7 w-7">
    <svg viewBox="0 0 28 28" className="h-full w-full">
      <circle cx="14" cy="14" r="12.5" fill="#fff" fillOpacity="0.85" stroke={color} strokeOpacity="0.35" strokeWidth="1.4" />
      <path d="M14 9 V19 M9 14 H19" stroke={color} strokeOpacity="0.7" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
    <AnimatePresence initial={false}>
      {on && (
        <motion.svg
          key="check"
          viewBox="0 0 28 28"
          className="absolute inset-0 h-full w-full"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", duration: 0.32, bounce: 0 }}
        >
          <circle cx="14" cy="14" r="14" fill={color} />
          <path d="M8.5 14.4 l3.6 3.6 7.4-8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      )}
    </AnimatePresence>
  </span>
);

const Tile = ({ option, selected, onToggle }: { option: Option; selected: boolean; onToggle: () => void }) => {
  const { title, line, color, layout, className, Scene } = option;
  const ref = useRef<HTMLButtonElement>(null);
  // The drawing plays only while the tile is on screen.
  const visible = useInView(ref, { margin: "-6% 0px" });

  return (
    <li className={cn("min-w-0", className)}>
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        onClick={onToggle}
        style={{ ["--accent" as string]: color }}
        className={cn(
          "group relative flex h-full min-h-[21rem] w-full flex-col overflow-hidden rounded-[28px] border p-6 text-left md:p-7 lg:min-h-0",
          "bg-[color-mix(in_srgb,var(--accent)_5%,white)] transition-[transform,border-color,box-shadow,background-color] duration-200 ease-out-strong",
          "active:scale-[0.985] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.008]",
          selected
            ? "border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_9%,white)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            : "border-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
        )}
      >
        <Mark on={selected} color={color} />
        <span className={cn("block pr-9", textBox[layout])}>
          <span className="block font-display text-xl font-bold leading-[1.12] tracking-[-0.03em] text-foreground md:text-2xl">{title}</span>
          <span className="mt-2 block text-base leading-snug text-muted-foreground">{line}</span>
        </span>
        <span data-play={visible} className={cn("pk-scene pointer-events-none relative mt-5 block h-44 w-full md:h-52", sceneBox[layout])}>
          <Scene />
        </span>
      </button>
    </li>
  );
};

/**
 * First qualification question, on the homepage. Visitors tap everything that fits (more than one is normal),
 * and a floating dock carries the whole choice into the form, which opens on the next step with those services
 * already picked. Choosing "not sure" clears the rest, and choosing anything else clears "not sure".
 */
const ServicePicker = () => {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (key: string) => {
    setPicked((current) => {
      if (current.includes(key)) return current.filter((k) => k !== key);
      track("picker_select");
      return key === "not-sure" ? ["not-sure"] : [...current.filter((k) => k !== "not-sure"), key];
    });
  };

  const chosen = OPTIONS.filter((o) => picked.includes(o.key));
  const services = chosen.filter((o) => o.key !== "not-sure").map((o) => o.key);
  const href = `/contact?${services.length ? `service=${services.join(",")}&` : ""}from=home-picker#start`;

  return (
    <section id="start-here" aria-labelledby="picker-heading" className="relative py-16 md:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="picker-heading" className="heading">
            What do you need?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:text-lg">
            Tap everything that fits. We build it first, and you pay only when you love it.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <ul className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:auto-rows-[15.5rem] lg:grid-cols-6 lg:gap-5">
          {OPTIONS.map((option) => (
            <Tile key={option.key} option={option} selected={picked.includes(option.key)} onToggle={() => toggle(option.key)} />
          ))}
        </ul>
      </Reveal>

      {/* The dock sticks to the bottom of the screen while this section is in view, then leaves with it. */}
      <div className="pointer-events-none sticky bottom-5 z-20 mx-auto mt-6 flex h-14 max-w-6xl justify-center" aria-live="polite">
        <AnimatePresence>
          {chosen.length > 0 && (
            <motion.div
              key="dock"
              initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
              transition={{ type: "spring", duration: 0.38, bounce: 0 }}
              className="pk-dock pointer-events-auto flex items-center gap-4 rounded-full border border-white/70 bg-white/75 py-2 pl-5 pr-2 shadow-[0_10px_34px_rgba(20,20,40,0.14),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-xl backdrop-saturate-150"
            >
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="flex -space-x-1.5">
                  {chosen.map((o) => (
                    <span key={o.key} className="h-5 w-5 rounded-full border-2 border-white" style={{ backgroundColor: o.color }} />
                  ))}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {chosen.length === 1 ? (chosen[0].key === "not-sure" ? "Not sure yet" : "1 picked") : `${chosen.length} picked`}
                </span>
              </span>
              <Link
                href={href}
                onClick={() => track("picker_continue")}
                className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/30"
              >
                Continue
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServicePicker;
