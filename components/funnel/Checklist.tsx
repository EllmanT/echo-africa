"use client";

import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";

import { cn } from "@/lib/utils";

export type ChecklistGroup = { title: string; items: string[] };

const STORAGE_KEY = "eka_launch_checklist";

/** Tick-off checklist. Progress is remembered in this browser only. */
const Checklist = ({ groups }: { groups: ChecklistGroup[] }) => {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(JSON.parse(saved));
    } catch {
      // Private mode or blocked storage: the checklist still works for this visit.
    }
  }, []);

  const toggle = (key: string) => {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore.
      }
      return next;
    });
  };

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const count = Object.values(done).filter(Boolean).length;

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-2 border-b border-black/[0.06] bg-background/95 px-2 py-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            {count} of {total} done
          </span>
          <span className="text-muted-foreground">Your progress is saved on this device</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
          <div
            className="h-full rounded-full bg-purple transition-[width] duration-300 ease-out-strong"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.title} className="mt-12">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">{group.title}</h2>
          <ul className="mt-5 divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {group.items.map((item) => {
              const key = `${group.title}::${item}`;
              const checked = Boolean(done[key]);
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(key)}
                    className="flex w-full items-start gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/20"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-150",
                        checked ? "border-purple bg-purple text-white" : "border-black/25 bg-white"
                      )}
                    >
                      {checked && <FaCheck size={11} />}
                    </span>
                    <span
                      className={cn(
                        "text-base leading-snug transition-colors duration-150 md:text-lg",
                        checked && "text-muted-foreground line-through decoration-black/20"
                      )}
                    >
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default Checklist;
