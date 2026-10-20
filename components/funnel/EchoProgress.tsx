"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Same five colours as the hero dots and the Services page: web, logos, AI, software, integration. */
const DOTS = ["#2563EB", "#E5533D", "#7C3AED", "#F59E0B", "#16A34A"];

/** A circle that slowly turns into other shapes and back, so the wait never feels frozen. */
const SHAPES = [
  "50% 50% 50% 50% / 50% 50% 50% 50%",
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "14% 14% 14% 14% / 14% 14% 14% 14%",
  "70% 30% 30% 70% / 60% 40% 60% 40%",
  "50% 50% 50% 50% / 50% 50% 50% 50%",
];

/** Dots that ring outward like an echo. Decorative: the real status is the labelled progress bar below it. */
export function EchoDots({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className={cn("relative mx-auto h-40 w-40", className)}>
      {DOTS.map((color, i) => {
        const angle = (i / DOTS.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 46;
        const y = Math.sin(angle) * 46;
        return (
          <span key={color} className="absolute left-1/2 top-1/2" style={{ transform: `translate(${x}px, ${y}px)` }}>
            {/* The echo: a ring that leaves the dot and fades. */}
            {!reduce &&
              [0, 1].map((ring) => (
                <motion.span
                  key={ring}
                  className="absolute left-1/2 top-1/2 -ml-4 -mt-4 block h-8 w-8 rounded-full border-2"
                  style={{ borderColor: color }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 2.6], opacity: [0.5, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: [0.23, 1, 0.32, 1], delay: i * 0.32 + ring * 1.2 }}
                />
              ))}
            <motion.span
              className="absolute left-1/2 top-1/2 -ml-3 -mt-3 block h-6 w-6"
              style={{ backgroundColor: color }}
              animate={reduce ? undefined : { borderRadius: SHAPES, rotate: [0, 90, 180, 270, 360], scale: [1, 1.18, 0.92, 1.1, 1] }}
              transition={{ duration: 6 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            />
          </span>
        );
      })}
    </div>
  );
}

/** A labelled progress bar. `value` is 0 to 1 and moves with the real work being done on the server. */
export function EchoBar({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="w-full max-w-xs">
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="relative h-1.5 w-full overflow-hidden rounded-full bg-purple/15">
        <motion.span
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#E5533D]"
          initial={false}
          animate={{ scaleX: Math.max(0.03, value) }}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <p className="mt-2 text-right text-xs font-semibold tabular-nums text-muted-foreground">{pct}%</p>
    </div>
  );
}
