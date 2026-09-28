"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ServiceTone } from "./ServiceRow";

export type ServiceAnchor = { id: string; label: string; tone: ServiceTone };

/** Chips that jump to each service. The chip for the section on screen lights up. */
const ServiceNav = ({ items }: { items: ServiceAnchor[] }) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    // No border underneath: a short fade lets the page slide away under the bar without a line.
    <nav
      aria-label="Jump to a service"
      className="sticky top-16 z-[4000] -mx-5 bg-background px-5 py-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-background after:to-transparent sm:-mx-10 sm:px-10"
    >
      <ul className="mx-auto flex max-w-4xl snap-x gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.id} className={cn("snap-start", `svc-${item.tone}`)}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium",
                "transition-[background-color,border-color,color,transform] duration-200 ease-out-strong active:scale-[0.97]",
                active === item.id
                  ? "border-[color:var(--accent-ink)] bg-[color:var(--accent-ink)] text-white"
                  : "border-black/[0.12] bg-white text-neutral-700 hover:border-[color:var(--accent)] hover:text-[color:var(--accent-ink)]"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-200 ease-out-strong",
                  active === item.id ? "bg-white" : "bg-[color:var(--accent)]"
                )}
              />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ServiceNav;
