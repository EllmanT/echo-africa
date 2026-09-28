"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

import { SCENE_NAMES } from "@/components/playbook/scenes";
import type { AdminPost } from "@/lib/admin/posts";

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15";

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="text-sm font-semibold">{label}</label>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    <div className="mt-2">{children}</div>
  </div>
);

const todayIso = () => new Date().toISOString().slice(0, 10);

const PostForm = ({ initial, isNew }: { initial: AdminPost | null; isNew: boolean }) => {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date?.slice(0, 10) ?? todayIso());
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      slug: isNew ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : undefined,
      title,
      description,
      date,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage || undefined,
      content,
      published,
    };

    const res = await fetch(isNew ? "/api/admin/posts" : `/api/admin/posts/${initial!.slug}`, {
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
    router.push("/admin/playbook");
    router.refresh();
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5 pb-16">
      {isNew ? (
        <Field label="URL slug" hint="Lowercase letters, numbers and dashes.">
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </Field>
      ) : (
        <a
          href={`/playbook/${initial!.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-purple hover:underline underline-offset-4"
        >
          View live <FaArrowUpRightFromSquare size={11} />
        </a>
      )}

      <Field label="Title">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Description" hint="Shown on the card and used for search results.">
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} h-auto py-2.5 leading-relaxed`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Tags" hint="Comma separated">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Cover image" hint="A path under /public, or a full https:// URL.">
        <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={inputClass} />
      </Field>

      <Field
        label="Content"
        hint={`Markdown. Headings, bold, links and lists all work. Add a drawing with <Illustration name="speed" caption="..." /> (names: ${SCENE_NAMES.join(", ")}) and a boxed summary with <Callout title="The short version"> ... </Callout>, leaving a blank line inside it. A line starting with > becomes a pull quote.`}
      >
        <textarea
          required
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          className={`${inputClass} h-auto min-h-[24rem] py-3 font-mono text-sm leading-relaxed`}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-purple" />
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
          {saving ? "Saving..." : isNew ? "Publish post" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
