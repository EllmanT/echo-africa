"use client";

import { FaCheck, FaRegClock, FaShieldHalved } from "react-icons/fa6";

import { cn } from "@/lib/utils";
import type { TailoredTier } from "@/lib/leads/pricing";

const TierCard = ({
  tier,
  selected,
  onSelect,
}: {
  tier: TailoredTier;
  selected: boolean;
  onSelect: () => void;
}) => {
  const featured = tier.highlight;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative block w-full rounded-2xl border text-left",
        "transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out-strong active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/20",
        featured ? "p-6 md:p-7" : "p-5",
        selected
          ? "border-purple bg-purple/[0.06] shadow-[0_10px_28px_-14px_rgba(124,58,237,0.45)]"
          : featured
            ? "border-purple/35 bg-purple/[0.03] shadow-[0_10px_28px_-18px_rgba(124,58,237,0.4)] hover:border-purple/60"
            : "border-black/[0.12] bg-white hover:border-black/30"
      )}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-5 inline-flex h-6 items-center rounded-full bg-purple px-3 text-xs font-semibold text-white">
          {tier.badge}
        </span>
      )}

      <span className="flex items-start justify-between gap-4">
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
              selected ? "border-purple bg-purple text-white" : "border-black/25 bg-white"
            )}
          >
            {selected && <FaCheck size={11} />}
          </span>
          <span className="font-display text-lg font-bold tracking-tight md:text-xl">{tier.name}</span>
        </span>
        <span
          className={cn(
            "shrink-0 text-right font-display font-extrabold tracking-[-0.02em] tabular-nums",
            featured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          )}
        >
          {tier.range}
        </span>
      </span>

      <span className="mt-3 block text-base leading-snug text-foreground/80">{tier.promise}</span>

      {tier.bullets.length > 0 && (
        <span className="mt-4 block">
          {tier.stacksOn && (
            <span className="mb-2 block text-sm font-semibold text-foreground">Everything in {tier.stacksOn}, plus:</span>
          )}
          <span className="block space-y-2">
            {tier.bullets.map((b) => (
              <span key={b} className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground md:text-[0.9375rem]">
                <FaCheck size={11} aria-hidden="true" className="mt-1 shrink-0 text-purple" />
                <span>{b}</span>
              </span>
            ))}
          </span>
        </span>
      )}

      {tier.speed && (
        <span className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground/70">
          <FaRegClock size={12} aria-hidden="true" />
          {tier.speed}
        </span>
      )}
    </button>
  );
};

/**
 * The last question of the form: three price tiers as radio cards.
 * The copy inside is already tailored by the caller, so this component only lays it out.
 */
const PricingStep = ({
  tiers,
  value,
  onChange,
  guarantee,
  alsoNote,
}: {
  tiers: TailoredTier[];
  value?: string;
  onChange: (key: string) => void;
  guarantee: string;
  alsoNote?: string;
}) => (
  <div>
    <div role="radiogroup" aria-label="Investment range" className="space-y-6 pt-3">
      {tiers.map((t) => (
        <TierCard key={t.key} tier={t} selected={value === t.key} onSelect={() => onChange(t.key)} />
      ))}
    </div>

    {alsoNote && <p className="mt-5 text-sm text-muted-foreground">{alsoNote}</p>}

    <p className="mt-5 flex items-start gap-3 rounded-xl bg-black/[0.03] px-4 py-3.5 text-sm leading-snug text-foreground/80">
      <FaShieldHalved size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-purple" />
      {guarantee}
    </p>
  </div>
);

export default PricingStep;
