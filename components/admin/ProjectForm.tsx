"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa6";

import type { AdminProject } from "@/lib/admin/projects";

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15";
const textAreaClass = inputClass.replace("h-11", "min-h-[6rem] py-2.5 leading-relaxed");

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="text-sm font-semibold">{label}</label>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    <div className="mt-2">{children}</div>
  </div>
);

type Draft = Omit<AdminProject, "results"> & { resultsJson: string };

const toDraft = (p?: AdminProject | null): Draft => ({
  slug: p?.slug ?? "",
  order: p?.order ?? 0,
  published: p?.published ?? true,
  client: p?.client ?? "",
  category: p?.category ?? "Website",
  location: p?.location ?? "",
  tagline: p?.tagline ?? "",
  summary: p?.summary ?? "",
  resultLine: p?.resultLine ?? "",
  heroStats: p?.heroStats ?? [],
  problemHeadline: p?.problemHeadline ?? "",
  problem: p?.problem ?? "",
  solution: p?.solution ?? "",
  solutionPoints: p?.solutionPoints ?? [],
  outcomeHeadline: p?.outcomeHeadline ?? "",
  outcome: p?.outcome ?? "",
  image: p?.image ?? "",
  link: p?.link ?? "",
  tags: p?.tags ?? [],
  resultsJson: p?.results ? JSON.stringify(p.results, null, 2) : "",
});

const ProjectForm = ({ initial, isNew }: { initial: AdminProject | null; isNew: boolean }) => {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(toDraft(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let results: unknown;
    if (draft.resultsJson.trim()) {
      try {
        results = JSON.parse(draft.resultsJson);
      } catch {
        setSaving(false);
        setError("The results/charts JSON is not valid. Fix the syntax and try again.");
        return;
      }
    }

    const { resultsJson, ...rest } = draft;
    void resultsJson;
    const body = { ...rest, results };

    const res = await fetch(isNew ? "/api/admin/projects" : `/api/admin/projects/${initial!.slug}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok || !json.ok) {
      setError(json.error ?? "Could not save");
      return;
    }
    router.push("/admin/projects");
    router.refresh();
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6 pb-16">
      {isNew && (
        <Field label="URL slug" hint="Lowercase letters, numbers and dashes. This cannot be changed later.">
          <input
            required
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            className={inputClass}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client name">
          <input required value={draft.client} onChange={(e) => set("client", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Category">
          <select
            value={draft.category}
            onChange={(e) => set("category", e.target.value as Draft["category"])}
            className={inputClass}
          >
            <option value="Website">Website</option>
            <option value="Logo & Brand Identity">Logo &amp; Brand Identity</option>
          </select>
        </Field>
      </div>

      <Field label="Location">
        <input required value={draft.location} onChange={(e) => set("location", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Tagline" hint="The big headline on the case study page.">
        <input required value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Summary" hint="One or two sentences, used on cards and in search results.">
        <textarea required value={draft.summary} onChange={(e) => set("summary", e.target.value)} className={textAreaClass} />
      </Field>

      <Field label="Result line" hint="One line shown on the Work list.">
        <input required value={draft.resultLine} onChange={(e) => set("resultLine", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Hero stats" hint="Big numbers at the top of the case study. Leave empty for none.">
        <div className="space-y-2">
          {draft.heroStats.map((stat, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="7x"
                value={stat.value}
                onChange={(e) => {
                  const next = [...draft.heroStats];
                  next[i] = { ...next[i], value: e.target.value };
                  set("heroStats", next);
                }}
                className={`${inputClass} w-24`}
              />
              <input
                placeholder="more Google views"
                value={stat.label}
                onChange={(e) => {
                  const next = [...draft.heroStats];
                  next[i] = { ...next[i], label: e.target.value };
                  set("heroStats", next);
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => set("heroStats", draft.heroStats.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg px-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove stat"
              >
                <FaTrash size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("heroStats", [...draft.heroStats, { value: "", label: "" }])}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple"
          >
            <FaPlus size={11} /> Add stat
          </button>
        </div>
      </Field>

      <Field label="Problem headline">
        <input
          required
          value={draft.problemHeadline}
          onChange={(e) => set("problemHeadline", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Problem">
        <textarea required value={draft.problem} onChange={(e) => set("problem", e.target.value)} className={textAreaClass} />
      </Field>

      <Field label="Solution">
        <textarea required value={draft.solution} onChange={(e) => set("solution", e.target.value)} className={textAreaClass} />
      </Field>
      <Field label="What we did (bullet points)">
        <div className="space-y-2">
          {draft.solutionPoints.map((point, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={point}
                onChange={(e) => {
                  const next = [...draft.solutionPoints];
                  next[i] = e.target.value;
                  set("solutionPoints", next);
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => set("solutionPoints", draft.solutionPoints.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg px-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove point"
              >
                <FaTrash size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("solutionPoints", [...draft.solutionPoints, ""])}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple"
          >
            <FaPlus size={11} /> Add point
          </button>
        </div>
      </Field>

      <Field label="Outcome headline">
        <input
          required
          value={draft.outcomeHeadline}
          onChange={(e) => set("outcomeHeadline", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Outcome">
        <textarea required value={draft.outcome} onChange={(e) => set("outcome", e.target.value)} className={textAreaClass} />
      </Field>

      <Field
        label="Results and charts (advanced)"
        hint="Raw JSON for the results.charts array. Leave empty for no charts. Only Faramatsi Motors and Toyota use this today."
      >
        <textarea
          value={draft.resultsJson}
          onChange={(e) => set("resultsJson", e.target.value)}
          spellCheck={false}
          className={`${textAreaClass} min-h-[10rem] font-mono text-xs`}
        />
      </Field>

      <Field label="Image path" hint="A path under /public, like /website-images/example.png">
        <input required value={draft.image} onChange={(e) => set("image", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Live site link" hint="Optional">
        <input value={draft.link ?? ""} onChange={(e) => set("link", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Tags" hint="Comma separated">
        <input
          value={draft.tags.join(", ")}
          onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-purple" />
        Published (visible on the live site)
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/[0.06] p-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-black/[0.08] pt-6">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-colors hover:bg-purple disabled:opacity-60"
        >
          {saving ? "Saving..." : isNew ? "Create project" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
