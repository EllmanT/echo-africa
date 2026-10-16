"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

/** One accent per item. The matching .svc-* class in globals.css sets --accent, --accent-ink and --accent-soft. */
export type AccordionTone = "web" | "ai" | "int" | "soft" | "logo";

export type AccordionItem = {
  title: string;
  body: string;
  points?: string[];
  tone: AccordionTone;
  Icon: IconType;
};

/**
 * A set of panels that open one at a time, by themselves. The open panel's progress line fills over
 * `interval` ms and, when it finishes, hands over to the next one (the line itself is the timer, so
 * pausing it pauses the cycle exactly). Hover, focus or a click focuses one panel: the cycle pauses
 * and the others fold down to a title. A click pins it; clicking it again lets the cycle run again.
 * Runs only while on screen and while the tab is visible, and never on its own for reduced motion.
 */
const AutoAccordion = ({ items, interval = 5200, className }: { items: AccordionItem[]; interval?: number; className?: string }) => {
  const reduce = useReducedMotion();
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [engaged, setEngaged] = useState(false); // pointer or keyboard focus is inside
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

  const auto = !reduce && !pinned;
  const running = auto && !engaged && inView && tabVisible;

  return (
    <div
      ref={root}
      role="list"
      className={cn("flex flex-col gap-3 lg:h-[28rem] lg:flex-row", className)}
      onPointerLeave={() => setEngaged(false)}
    >
      {items.map((item, i) => {
        const open = i === active;
        const panelId = `${uid}-panel-${i}`;
        const { Icon } = item;
        return (
          <div
            key={item.title}
            role="listitem"
            style={{ flexGrow: open ? 4 : 1 }}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse") return;
              setEngaged(true);
              setActive(i);
            }}
            className={cn(
              `svc-${item.tone}`,
              "relative overflow-hidden rounded-3xl border transition-[flex-grow,background-color,border-color] duration-[650ms] ease-out-strong lg:min-w-0 lg:basis-0",
              open ? "border-[color:var(--accent)]/30 bg-[color-mix(in_srgb,var(--accent)_6%,white)]" : "border-black/[0.08] bg-white"
            )}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => {
                if (open) setPinned((p) => !p);
                else {
                  setActive(i);
                  setPinned(true);
                }
              }}
              onFocus={() => {
                setEngaged(true);
                setActive(i);
              }}
              onBlur={() => setEngaged(false)}
              className="relative z-10 flex w-full items-center gap-4 p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] lg:absolute lg:inset-0 lg:flex-col lg:items-start lg:justify-between lg:p-7"
            >
              <span
                className={cn(
                  "flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-display text-sm font-bold tabular-nums transition-colors duration-300",
                  open ? "bg-[color:var(--accent)] text-white" : "bg-[color-mix(in_srgb,var(--accent)_12%,white)] text-[color:var(--accent-ink)]"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl font-bold tracking-tight lg:hidden">{item.title}</span>
              {/* Folded title, standing on its end. Decorative: the real title is in the panel. */}
              <span
                aria-hidden="true"
                className={cn(
                  "hidden font-display text-2xl font-bold tracking-tight transition-opacity duration-300 [writing-mode:vertical-rl] lg:block lg:rotate-180",
                  open ? "opacity-0" : "opacity-100 delay-200"
                )}
              >
                {item.title}
              </span>
            </button>

            <Icon
              aria-hidden="true"
              size={26}
              className={cn(
                "absolute right-7 top-7 hidden text-[color:var(--accent)] transition-opacity duration-300 lg:block",
                open ? "opacity-100 delay-300" : "opacity-0"
              )}
            />

            <div
              id={panelId}
              aria-hidden={!open}
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-out-strong lg:absolute lg:inset-x-0 lg:bottom-0 lg:block",
                open ? "opacity-100 lg:delay-200" : "opacity-0"
              )}
            >
              <div className="overflow-hidden lg:overflow-visible">
                <div className="px-5 pb-7 lg:w-[26rem] lg:max-w-full lg:px-8 lg:pb-9">
                  <h3 className="hidden font-display text-3xl font-extrabold leading-tight tracking-[-0.02em] lg:block">{item.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground lg:mt-3 lg:text-lg">{item.body}</p>
                  {item.points && (
                    <ul className="mt-4 space-y-2">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-[15px]">
                          <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {open && auto && (
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-black/[0.05]">
                <span
                  key={`${i}-${pinned}`}
                  className="acc-bar block h-full bg-[color:var(--accent)]"
                  style={{ animationDuration: `${interval}ms`, animationPlayState: running ? "running" : "paused" }}
                  onAnimationEnd={() => setActive((a) => (a + 1) % items.length)}
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AutoAccordion;
