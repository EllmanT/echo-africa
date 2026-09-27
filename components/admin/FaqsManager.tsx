"use client";

import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa6";

import type { AdminFaq } from "@/lib/admin/faqs";
import type { FaqPage } from "@/lib/content/faqs";
import { cn } from "@/lib/utils";

const TABS: { page: FaqPage; label: string }[] = [
  { page: "work", label: "Work page" },
  { page: "project", label: "Project pages" },
  { page: "contact", label: "Contact page" },
  { page: "home", label: "Homepage" },
];

const inputClass = "h-10 w-full rounded-lg border border-black/[0.12] bg-white px-3 text-sm";

const FaqRow = ({ faq, onChange, onDelete, onMove, isFirst, isLast }: {
  faq: AdminFaq;
  onChange: (patch: Partial<AdminFaq>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col gap-1 pt-1.5">
          <button type="button" disabled={isFirst} onClick={() => onMove(-1)} className="text-neutral-400 disabled:opacity-30 hover:text-purple">
            <FaArrowUp size={12} />
          </button>
          <button type="button" disabled={isLast} onClick={() => onMove(1)} className="text-neutral-400 disabled:opacity-30 hover:text-purple">
            <FaArrowDown size={12} />
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onBlur={() => question !== faq.question && onChange({ question })}
            className={cn(inputClass, "font-semibold")}
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onBlur={() => answer !== faq.answer && onChange({ answer })}
            rows={2}
            className={cn(inputClass, "h-auto py-2 leading-relaxed")}
          />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={faq.published}
              onChange={(e) => onChange({ published: e.target.checked })}
              className="h-3.5 w-3.5 accent-purple"
            />
            Published
          </label>
          <button type="button" onClick={onDelete} className="text-neutral-400 hover:text-destructive">
            <FaTrash size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FaqsManager = () => {
  const [tab, setTab] = useState<FaqPage>("work");
  const [faqs, setFaqs] = useState<AdminFaq[] | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  useEffect(() => {
    setFaqs(null);
    fetch(`/api/admin/faqs?page=${tab}`)
      .then((r) => r.json())
      .then((j) => setFaqs(j.faqs ?? []));
  }, [tab]);

  const patch = async (id: string, body: Partial<AdminFaq>) => {
    setFaqs((prev) => prev?.map((f) => (f._id === id ? { ...f, ...body } : f)) ?? prev);
    await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this question?")) return;
    setFaqs((prev) => prev?.filter((f) => f._id !== id) ?? prev);
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
  };

  const move = (index: number, dir: -1 | 1) => {
    if (!faqs) return;
    const next = [...faqs];
    const target = index + dir;
    [next[index], next[target]] = [next[target], next[index]];
    setFaqs(next);
    fetch("/api/admin/faqs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((f) => f._id) }),
    });
  };

  const add = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: tab, question: newQuestion, answer: newAnswer }),
    });
    const json = await res.json();
    if (json.ok) {
      setFaqs((prev) => [
        ...(prev ?? []),
        { _id: json.id, page: tab, question: newQuestion, answer: newAnswer, order: (prev?.length ?? 0) + 1, published: true },
      ]);
      setNewQuestion("");
      setNewAnswer("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.page}
            type="button"
            onClick={() => setTab(t.page)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.page ? "bg-foreground text-background" : "bg-black/[0.05] text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {faqs === null && <p className="text-muted-foreground">Loading...</p>}
        {faqs?.length === 0 && <p className="text-muted-foreground">No questions for this page yet.</p>}
        {faqs?.map((faq, i) => (
          <FaqRow
            key={faq._id}
            faq={faq}
            onChange={(patchBody) => patch(faq._id, patchBody)}
            onDelete={() => remove(faq._id)}
            onMove={(dir) => move(i, dir)}
            isFirst={i === 0}
            isLast={i === (faqs?.length ?? 1) - 1}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-black/[0.15] p-4">
        <p className="text-sm font-semibold">Add a question</p>
        <div className="mt-3 space-y-2">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Question"
            className={inputClass}
          />
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Answer"
            rows={2}
            className={cn(inputClass, "h-auto py-2 leading-relaxed")}
          />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-purple"
          >
            <FaPlus size={11} /> Add question
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqsManager;
