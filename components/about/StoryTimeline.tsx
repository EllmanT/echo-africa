"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

type Step = { tone: "web" | "ai" | "int" | "soft" | "logo"; title: string; body: string };

/** A short story down a line that fills in as you scroll. Each step lights up in its own colour as it arrives. */
const StoryTimeline = ({ steps, solid = false }: { steps: Step[]; solid?: boolean }) => {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });

  return (
    <ol ref={ref} className={cn("relative mx-auto max-w-2xl", solid && steps[0] && `svc-${steps[0].tone}`)}>
      <span aria-hidden="true" className="absolute bottom-2 left-[1.05rem] top-2 w-px bg-black/[0.1]" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY: reduce ? 1 : fill }}
        className={cn(
          "absolute bottom-2 left-[1.05rem] top-2 w-[2px] origin-top -translate-x-px",
          solid ? "bg-[color:var(--accent)]" : "bg-gradient-to-b from-[#2563eb] via-[#7c3aed] via-50% to-[#e5533d]"
        )}
      />
      {steps.map((step, i) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className={cn(`svc-${step.tone}`, "relative pb-12 pl-14 last:pb-0")}
        >
          <motion.span
            aria-hidden="true"
            initial={{ scale: reduce ? 1 : 0.6 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="absolute left-0 top-0 flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-full border-2 border-[color:var(--accent)] bg-white font-display text-xs font-bold text-[color:var(--accent-ink)]"
          >
            {i + 1}
          </motion.span>
          <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{step.title}</h3>
          <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{step.body}</p>
        </motion.li>
      ))}
    </ol>
  );
};

export default StoryTimeline;
