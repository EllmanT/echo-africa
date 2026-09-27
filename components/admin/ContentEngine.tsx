"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CalendarConfig } from "@/lib/playbook/calendar";
import type { Region } from "@/lib/playbook/pillars";
import type { JobRun } from "@/lib/admin/jobRuns";
import { cn } from "@/lib/utils";

const inputClass = "h-10 w-full rounded-lg border border-black/[0.12] bg-white px-3 text-sm";

const STATUS_STYLES: Record<string, string> = {
  running: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  "needs-review": "bg-orange-100 text-orange-800",
  failed: "bg-red-100 text-red-800",
};

const formatTime = (d?: Date | string) =>
  d ? new Date(d).toLocaleString("en-ZW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const ContentEngine = ({ initialConfig, initialJobRuns }: { initialConfig: CalendarConfig; initialJobRuns: JobRun[] }) => {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [jobRuns, setJobRuns] = useState(initialJobRuns);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);

  const updatePillar = (key: string, field: "weight" | "guidance", value: string | number) => {
    setConfig((c) => ({
      ...c,
      pillars: c.pillars.map((p) => (p.key === key ? { ...p, [field]: value } : p)),
    }));
  };

  const updateRegion = (region: Region, value: number) => {
    setConfig((c) => ({ ...c, regionWeights: { ...c.regionWeights, [region]: value } }));
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/calendar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(res.ok);
  };

  const generateNow = async () => {
    setGenerating(true);
    setGenerateResult(null);
    const res = await fetch("/api/admin/playbook/generate", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setGenerating(false);

    if (json.status === "published") setGenerateResult(`Published: "${json.slug}"`);
    else if (json.status === "draft") setGenerateResult(`Saved as a draft, needs review: ${(json.reasons ?? []).join("; ")}`);
    else setGenerateResult(`Failed: ${json.error ?? "Unknown error"}`);

    const runsRes = await fetch("/api/admin/jobruns");
    if (runsRes.ok) setJobRuns((await runsRes.json()).jobRuns ?? []);
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-dashed border-black/[0.15] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Generate an article right now</p>
            <p className="text-sm text-muted-foreground">Picks a pillar, researches it live, writes it, and either publishes or saves it for review.</p>
          </div>
          <button
            type="button"
            onClick={generateNow}
            disabled={generating}
            className="h-11 shrink-0 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-purple disabled:opacity-60"
          >
            {generating ? "Generating... (can take a minute)" : "Generate now"}
          </button>
        </div>
        {generateResult && <p className="mt-3 text-sm">{generateResult}</p>}
      </div>

      <section>
        <h2 className="font-display text-lg font-bold tracking-tight">Pillars</h2>
        <p className="mt-1 text-sm text-muted-foreground">What the automated pipeline is allowed to write about, and how often.</p>
        <div className="mt-4 space-y-3">
          {config.pillars.map((pillar) => (
            <div key={pillar.key} className="rounded-2xl border border-black/[0.08] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">{pillar.label}</p>
                <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  Weight
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pillar.weight}
                    onChange={(e) => updatePillar(pillar.key, "weight", Number(e.target.value))}
                    className="h-9 w-20 rounded-lg border border-black/[0.12] bg-white px-2 text-sm"
                  />
                </label>
              </div>
              <textarea
                value={pillar.guidance}
                onChange={(e) => updatePillar(pillar.key, "guidance", e.target.value)}
                rows={2}
                className={cn(inputClass, "mt-3 h-auto py-2 leading-relaxed")}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold tracking-tight">Regional mix</h2>
        <p className="mt-1 text-sm text-muted-foreground">Roughly what share of articles lean Zimbabwe, wider Africa, or global.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {(Object.keys(config.regionWeights) as Region[]).map((region) => (
            <label key={region} className="rounded-2xl border border-black/[0.08] bg-white p-4 text-center">
              <span className="block text-sm capitalize text-muted-foreground">{region}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={config.regionWeights[region]}
                onChange={(e) => updateRegion(region, Number(e.target.value))}
                className="mt-2 h-10 w-full rounded-lg border border-black/[0.12] bg-white text-center text-lg font-semibold"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-colors hover:bg-purple disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save calendar"}
        </button>
        {saved && <span className="text-sm text-muted-foreground">Saved</span>}
      </div>

      <section>
        <h2 className="font-display text-lg font-bold tracking-tight">Recent runs</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.08] bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.08] text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Slot</th>
                <th className="px-5 py-3 font-medium">Pillar</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {jobRuns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No runs yet.
                  </td>
                </tr>
              )}
              {jobRuns.map((run) => (
                <tr key={run._id}>
                  <td className="px-5 py-3 text-muted-foreground">{formatTime(run.startedAt)}</td>
                  <td className="px-5 py-3 capitalize">{run.slot}</td>
                  <td className="px-5 py-3 text-muted-foreground">{run.pillar ?? "-"}</td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_STYLES[run.status])}>
                      {run.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-3 text-xs text-muted-foreground">
                    {run.error ?? [...(run.reasons ?? []), ...(run.flags ?? [])].join("; ") ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ContentEngine;
