"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type ServiceAnchor = { id: string; label: string };

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
    <nav aria-label="Jump to a service" className="sticky top-16 z-[4000] -mx-5 border-b border-black/[0.06] bg-background/95 px-5 py-3 sm:-mx-10 sm:px-10">
      <ul className="mx-auto flex max-w-4xl snap-x gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.id} className="snap-start">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                "inline-flex h-10 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium",
                "transition-[background-color,border-color,color,transform] duration-200 ease-out-strong active:scale-[0.97]",
                active === item.id
                  ? "border-purple bg-purple text-white"
                  : "border-black/[0.12] bg-white text-neutral-700 hover:border-purple/50 hover:text-purple"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ServiceNav;
