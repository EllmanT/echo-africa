"use client";

import { FaCheck } from "react-icons/fa6";

import { cn } from "@/lib/utils";

/** A big, tappable answer. `multi` renders a checkbox, otherwise a radio. */
const ChoiceTile = ({
  label,
  description,
  selected,
  onSelect,
  multi = false,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  multi?: boolean;
}) => (
  <button
    type="button"
    role={multi ? "checkbox" : "radio"}
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left",
      "transition-[border-color,background-color,transform] duration-150 ease-out-strong active:scale-[0.99]",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/20",
      selected
        ? "border-purple bg-purple/[0.05]"
        : "border-black/[0.12] bg-white hover:border-black/30"
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center border transition-colors duration-150",
        multi ? "rounded-md" : "rounded-full",
        selected ? "border-purple bg-purple text-white" : "border-black/25 bg-white"
      )}
    >
      {selected && <FaCheck size={11} />}
    </span>
    <span className="min-w-0">
      <span className="block text-base font-semibold leading-snug md:text-lg">{label}</span>
      {description && <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{description}</span>}
    </span>
  </button>
);

export default ChoiceTile;
