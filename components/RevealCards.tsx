"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { CanvasRevealEffect } from "./ui/CanvasRevealEffect";

export type RevealCard = {
  label: string;
  title: string;
  des: string;
  /** Tailwind background for the reveal canvas, e.g. "bg-emerald-100". */
  bg: string;
  colors?: number[][];
  speed?: number;
  dotSize?: number;
};

/**
 * A row of cards that reveal what each step does. They work through the row on their own, one at a
 * time, and hovering a card takes over exactly as it always did. The cycle only runs while the
 * section is on screen and the tab is visible, and never on its own for reduced motion.
 */
const RevealCards = ({ cards, interval = 4500 }: { cards: RevealCard[]; interval?: number }) => {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = !reduce && hovered === null && inView && tabVisible;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % cards.length), interval);
    return () => clearTimeout(t);
  }, [running, active, cards.length, interval]);

  // While hovering, only the hovered card is open. Otherwise the cycle's card is, once the section is seen.
  const shown = hovered ?? (reduce || !inView ? null : active);

  return (
    <div ref={root} className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row">
      {cards.map((c, i) => (
        <Card key={c.title} card={c} revealed={shown === i} onHover={(on) => setHovered(on ? i : null)} />
      ))}
    </div>
  );
};

export default RevealCards;

const Card = ({ card, revealed, onHover }: { card: RevealCard; revealed: boolean; onHover: (on: boolean) => void }) => {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="relative mx-auto flex h-[26rem] w-full max-w-sm items-center justify-center rounded-3xl border border-black/[0.2] p-4 lg:h-[35rem]"
      style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(16,24,64,0.08)" }}
    >
      <Icon className="absolute -left-3 -top-3 h-10 w-10 text-black opacity-30" />
      <Icon className="absolute -bottom-3 -left-3 h-10 w-10 text-black opacity-30" />
      <Icon className="absolute -right-3 -top-3 h-10 w-10 text-black opacity-30" />
      <Icon className="absolute -bottom-3 -right-3 h-10 w-10 text-black opacity-30" />

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 h-full w-full"
          >
            <CanvasRevealEffect
              animationSpeed={card.speed ?? 3}
              containerClassName={cn(card.bg, "overflow-hidden rounded-3xl")}
              colors={card.colors}
              dotSize={card.dotSize}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 px-10">
        <div
          className={cn(
            "absolute left-1/2 top-1/2 mx-auto flex min-w-40 -translate-x-1/2 items-center justify-center text-center transition duration-200",
            revealed ? "-translate-y-[calc(50%+1rem)] opacity-0" : "-translate-y-1/2 opacity-100"
          )}
        >
          <PhasePill label={card.label} />
        </div>
        <h3
          className={cn(
            "relative z-10 mt-4 text-center text-3xl font-bold text-black transition duration-200",
            revealed ? "-translate-y-2 opacity-100" : "opacity-0"
          )}
        >
          {card.title}
        </h3>
        <p
          className={cn(
            "relative z-10 mt-4 text-center text-sm text-muted-foreground transition duration-200",
            revealed ? "-translate-y-2 opacity-100" : "opacity-0"
          )}
        >
          {card.des}
        </p>
      </div>
    </div>
  );
};

const PhasePill = ({ label }: { label: string }) => (
  <div className="relative inline-flex overflow-hidden rounded-full p-[1px]">
    <span
      className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]
         bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
    />
    <span className="inline-flex h-full w-full items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-2 text-2xl font-bold text-purple backdrop-blur-3xl">
      {label}
    </span>
  </div>
);

const Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);
