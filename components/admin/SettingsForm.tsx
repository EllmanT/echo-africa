"use client";

import { useState } from "react";
import type { AdminSettings } from "@/lib/admin/settings";

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
    <label className="text-sm font-semibold">{label}</label>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    <div className="mt-3">{children}</div>
  </div>
);

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15";

const SettingsForm = ({ initial, spentUsd = 0, reviewSpentUsd = 0 }: { initial: AdminSettings; spentUsd?: number; reviewSpentUsd?: number }) => {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(res.ok ? { ok: true, text: "Saved" } : { ok: false, text: json.error ?? "Could not save" });
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      <Field label="Notification email" hint="Where new lead alerts are sent. Defaults to your own inbox.">
        <input
          type="email"
          value={values.notifyEmail}
          onChange={(e) => setValues({ ...values, notifyEmail: e.target.value })}
          className={inputClass}
        />
      </Field>

      <Field label="Playbook daily cap" hint="The automated article pipeline stops for the day after publishing this many, to control cost.">
        <input
          type="number"
          min={0}
          max={20}
          value={values.dailyGenerationCap}
          onChange={(e) => setValues({ ...values, dailyGenerationCap: Number(e.target.value) })}
          className={inputClass}
        />
      </Field>

      <Field
        label="Playbook monthly budget (USD)"
        hint={`A hard ceiling on what the article engine may spend this month. Each article costs a few cents. Spent so far this month: $${spentUsd.toFixed(2)}. When it reaches the budget, no more articles are written until next month.`}
      >
        <input
          type="number"
          min={0}
          max={500}
          step={0.5}
          value={values.monthlyBudgetUsd}
          onChange={(e) => setValues({ ...values, monthlyBudgetUsd: Number(e.target.value) })}
          className={inputClass}
        />
      </Field>

      <h2 className="pt-4 font-display text-lg font-bold tracking-tight">Instant website review</h2>

      <Field label="Instant review on" hint="Off means visitors are told a person will reply instead. The REVIEW_ENABLED=false setting in Vercel overrides this and always wins.">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={values.reviewEnabled}
            onChange={(e) => setValues({ ...values, reviewEnabled: e.target.checked })}
            className="h-5 w-5 accent-purple"
          />
          Produce reviews automatically
        </label>
      </Field>

      <Field label="Reviews per day, whole site" hint="Once this many are produced in a day, everyone else is asked to come back tomorrow. Each review costs well under a cent.">
        <input
          type="number"
          min={0}
          max={500}
          value={values.reviewDailyCap}
          onChange={(e) => setValues({ ...values, reviewDailyCap: Number(e.target.value) })}
          className={inputClass}
        />
      </Field>

      <Field
        label="Review monthly budget (USD)"
        hint={`A hard ceiling on review spend this month. Spent so far: $${reviewSpentUsd.toFixed(2)}. At the ceiling, visitors get a personal reply instead of an instant review.`}
      >
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={values.reviewMonthlyBudgetUsd}
          onChange={(e) => setValues({ ...values, reviewMonthlyBudgetUsd: Number(e.target.value) })}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-colors hover:bg-purple disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {message && (
          <span className={`text-sm ${message.ok ? "text-muted-foreground" : "font-medium text-destructive"}`}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
};

export default SettingsForm;
