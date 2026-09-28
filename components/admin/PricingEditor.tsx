"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PricingStep from "@/components/funnel/PricingStep";
import {
  DEFAULT_PRICING,
  TIER_CONTEXTS,
  TIER_CONTEXT_LABELS,
  formatRange,
  tailorTiers,
  type PricingConfig,
  type PricingSetKey,
  type PricingTier,
  type TierContext,
} from "@/lib/leads/pricing";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15";
const areaClass =
  "w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2.5 text-sm leading-relaxed focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15";

const SETS: { key: PricingSetKey; label: string; hint: string }[] = [
  {
    key: "standard",
    label: "Websites, AI, integration, software",
    hint: "Shown to anyone who picked something other than only a logo (including logo plus something else).",
  },
  { key: "logo", label: "Logo only", hint: "Shown only when the visitor picked just a logo." },
];

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-1.5">
    <span className="text-sm font-semibold">{children}</span>
    {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
  </div>
);

const Toggle = ({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 accent-[#7C3AED]"
    />
    <span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="block text-xs text-muted-foreground">{hint}</span>
    </span>
  </label>
);

const TierEditor = ({
  tier,
  index,
  setKey,
  onChange,
  onHighlight,
}: {
  tier: PricingTier;
  index: number;
  setKey: PricingSetKey;
  onChange: (t: PricingTier) => void;
  onHighlight: (on: boolean) => void;
}) => {
  const contexts = setKey === "logo" ? (["default"] as TierContext[]) : [...TIER_CONTEXTS];
  const [context, setContext] = useState<TierContext>(contexts[Math.min(1, contexts.length - 1)]);
  const set = <K extends keyof PricingTier>(key: K, value: PricingTier[K]) => onChange({ ...tier, [key]: value });

  return (
    <section className="rounded-2xl border border-black/[0.08] bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold tracking-tight">
          Tier {index + 1}: {tier.name || "Untitled"}
        </h3>
        <span className="text-sm text-muted-foreground">{formatRange(tier)}</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <Label>Name</Label>
          <input className={inputClass} value={tier.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label>From (USD)</Label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={tier.minUsd}
            onChange={(e) => set("minUsd", Number(e.target.value))}
          />
        </div>
        <div>
          <Label hint="Leave empty for 'and above'.">To (USD)</Label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={tier.maxUsd ?? ""}
            onChange={(e) => set("maxUsd", e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label hint="A small pill on top of the card. Leave empty for none.">Badge</Label>
          <input className={inputClass} value={tier.badge} onChange={(e) => set("badge", e.target.value)} />
        </div>
        <div>
          <Label hint="A short time line, like 'First look in days'. Never a fixed deadline you cannot keep.">Speed line</Label>
          <input className={inputClass} value={tier.speed} onChange={(e) => set("speed", e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <Label hint="Use {business} and {goal} and they are filled in with the visitor's own answers.">Promise</Label>
        <input className={inputClass} value={tier.promise} onChange={(e) => set("promise", e.target.value)} />
      </div>

      <div className="mt-5">
        <Label hint="What this tier ADDS. The card says 'Everything in the tier below, plus'. One bullet per line. Keep to 3 or 4.">
          What is included, by what the visitor picked
        </Label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {contexts.map((c) => {
            const count = tier.includes[c]?.filter((b) => b.trim()).length ?? 0;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setContext(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  context === c
                    ? "border-purple bg-purple/10 text-purple"
                    : "border-black/[0.12] text-neutral-600 hover:border-black/30"
                )}
              >
                {setKey === "logo" ? "Logo" : TIER_CONTEXT_LABELS[c]} ({count})
              </button>
            );
          })}
        </div>
        <textarea
          rows={5}
          className={areaClass}
          value={(tier.includes[context] ?? []).join("\n")}
          onChange={(e) => set("includes", { ...tier.includes, [context]: e.target.value.split("\n") })}
        />
        {context !== "default" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Empty here means the visitor sees the &quot;Not sure yet / anything else&quot; bullets instead.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-4 border-t border-black/[0.06] pt-5 md:grid-cols-2">
        <Toggle
          checked={tier.highlight}
          onChange={onHighlight}
          label="Highlight this tier"
          hint="Bigger card and purple frame, to nudge people toward it. Only one per set."
        />
        <Toggle
          checked={tier.qualified}
          onChange={(v) => set("qualified", v)}
          label="Counts as a qualified lead"
          hint="Off means they get the polite free-resources reply instead of a call."
        />
        <Toggle
          checked={tier.booking}
          onChange={(v) => set("booking", v)}
          label="Offer the booking calendar"
          hint="Off means they get a WhatsApp and email follow-up instead of the Cal.com calendar."
        />
        <div>
          <Label hint="A lead is flagged priority when its score reaches this. Empty means never priority.">
            Priority score
          </Label>
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={tier.priorityScore ?? ""}
            onChange={(e) => set("priorityScore", e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      </div>
    </section>
  );
};

const PricingEditor = ({ initial }: { initial: PricingConfig }) => {
  const router = useRouter();
  const [config, setConfig] = useState<PricingConfig>(initial);
  const [setKey, setSetKey] = useState<PricingSetKey>("standard");
  const [previewContext, setPreviewContext] = useState<TierContext>("website");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const updateTier = (i: number, tier: PricingTier) =>
    setConfig((c) => ({ ...c, [setKey]: c[setKey].map((t, j) => (j === i ? tier : t)) }));

  const highlight = (i: number, on: boolean) =>
    setConfig((c) => ({ ...c, [setKey]: c[setKey].map((t, j) => ({ ...t, highlight: on && j === i })) }));

  const previewTiers = useMemo(
    () =>
      tailorTiers(config[setKey], setKey === "logo" ? "default" : previewContext, {
        business: "Moyo Motors",
        goal: "more-customers",
      }),
    [config, setKey, previewContext]
  );

  const clean = (c: PricingConfig): PricingConfig => {
    const cleanTier = (t: PricingTier): PricingTier => {
      const includes: PricingTier["includes"] = {};
      for (const ctx of TIER_CONTEXTS) {
        const lines = (t.includes[ctx] ?? []).map((b) => b.trim()).filter(Boolean);
        if (lines.length) includes[ctx] = lines;
      }
      return { ...t, includes };
    };
    return { ...c, standard: c.standard.map(cleanTier), logo: c.logo.map(cleanTier) };
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clean(config)),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setMessage({ ok: true, text: "Saved. Live on the contact form within a minute." });
      router.refresh();
    } else {
      setMessage({ ok: false, text: json.error ?? "Could not save" });
    }
  };

  const reset = () => {
    if (window.confirm("Put every tier back to the original wording and prices? You still need to press Save.")) {
      setConfig(DEFAULT_PRICING);
      setMessage(null);
    }
  };

  const activeSet = SETS.find((s) => s.key === setKey)!;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="space-y-5">
        <div role="tablist" aria-label="Price ladder" className="flex flex-wrap gap-2">
          {SETS.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={setKey === s.key}
              type="button"
              onClick={() => setSetKey(s.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                setKey === s.key
                  ? "border-purple bg-purple/10 text-purple"
                  : "border-black/[0.12] text-neutral-600 hover:border-black/30"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{activeSet.hint}</p>

        {config[setKey].map((tier, i) => (
          <TierEditor
            key={`${setKey}-${tier.key}`}
            tier={tier}
            index={i}
            setKey={setKey}
            onChange={(t) => updateTier(i, t)}
            onHighlight={(on) => highlight(i, on)}
          />
        ))}

        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 md:p-6">
          <Label hint="Shown under the cards on both ladders. It answers 'what if I do not like it?'. Only promise what you will honour.">
            Risk-free promise
          </Label>
          <textarea
            rows={2}
            className={areaClass}
            value={config.guarantee}
            onChange={(e) => setConfig({ ...config, guarantee: e.target.value })}
          />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-colors hover:bg-purple disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save pricing"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset to original
          </button>
          {message && (
            <span className={`text-sm ${message.ok ? "text-muted-foreground" : "font-medium text-destructive"}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-3xl border border-black/[0.08] bg-muted/40 p-5">
          <p className="text-sm font-semibold">Live preview</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            As a visitor from &quot;Moyo Motors&quot; who wants to get more customers. Unsaved edits show here.
          </p>
          {setKey === "standard" && (
            <label className="mt-3 block text-xs text-muted-foreground">
              Visitor picked
              <select
                value={previewContext}
                onChange={(e) => setPreviewContext(e.target.value as TierContext)}
                className="mt-1 block h-10 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm text-foreground"
              >
                {TIER_CONTEXTS.map((c) => (
                  <option key={c} value={c}>
                    {TIER_CONTEXT_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="mt-4 pointer-events-none" aria-hidden="true">
            <PricingStep tiers={previewTiers} value={previewTiers.find((t) => t.highlight)?.key} onChange={() => {}} guarantee={config.guarantee} />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PricingEditor;
