"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaArrowRight, FaWhatsapp } from "react-icons/fa6";

import { EchoBar, EchoDots } from "@/components/funnel/EchoProgress";
import TurnstileWidget, { TURNSTILE_SITE_KEY } from "@/components/security/TurnstileWidget";
import { Input, Textarea } from "@/components/ui/input";
import { track } from "@/lib/analytics/track";
import { siteConfig } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

type Mode = "site" | "process";
type Win = { title: string; body: string };
type Review = { headline: string; opener: string; wins: Win[]; nextStep: string };
type Phase = "form" | "working" | "done" | "queued";
type Fields = Partial<Record<"name" | "email" | "url" | "process", string>>;

const EASE = [0.23, 1, 0.32, 1] as const;

type Stage = "start" | "open" | "read" | "think" | "write" | "done";

/** What the server is really doing, in the visitor's words. */
const STAGE_LABEL: Record<Mode, Record<Stage, string>> = {
  site: {
    start: "Getting started",
    open: "Opening your website",
    read: "Reading your pages",
    think: "Finding what is costing you customers",
    write: "Writing up your three fixes",
    done: "Done",
  },
  process: {
    start: "Getting started",
    open: "Reading what you wrote",
    read: "Reading what you wrote",
    think: "Finding what can run without you",
    write: "Writing up your three fixes",
    done: "Done",
  },
};

/** The bar jumps to the floor when the server reports a stage, then creeps toward the cap while that stage runs. */
const FLOOR: Record<Stage, number> = { start: 0.06, open: 0.16, read: 0.32, think: 0.45, write: 0.92, done: 1 };
const CAP: Record<Stage, number> = { start: 0.14, open: 0.3, read: 0.44, think: 0.9, write: 0.97, done: 1 };

/** Reads a streamed reply, calling `onEvent` once per line. */
async function readEvents(res: Response, onEvent: (e: Record<string, unknown>) => void) {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response");
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (line) onEvent(JSON.parse(line));
    }
  }
}

const label = "mb-1.5 block text-sm font-semibold";
const field = "w-full";

/** Free 60-second review: a visitor not ready for the full form still becomes a lead and gets real value first. */
const FreeReview = ({ from = "home", className }: { from?: string; className?: string }) => {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("site");
  const [phase, setPhase] = useState<Phase>("form");
  const [stage, setStage] = useState<Stage>("start");
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Fields>({});
  const [review, setReview] = useState<Review | null>(null);
  const [emailed, setEmailed] = useState(false);
  const [humanToken, setHumanToken] = useState<string | null>(null);
  const [humanReset, setHumanReset] = useState(0);
  const startedAt = useRef<number | null>(null);
  const startedTracked = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sentService = useRef<string>("website");

  // Between server updates the bar creeps forward so it never looks stuck, but it never passes the stage's cap.
  useEffect(() => {
    if (phase !== "working") return;
    const id = window.setInterval(() => setProgress((p) => (p < CAP[stage] ? p + (CAP[stage] - p) * 0.07 : p)), 250);
    return () => window.clearInterval(id);
  }, [phase, stage]);

  const goStage = (next: Stage) => {
    setStage(next);
    setProgress((p) => Math.max(p, FLOOR[next]));
  };

  // The honeypot timer starts when the form appears, not on first focus: autofill and paste can finish a form before any focus event.
  useEffect(() => {
    if (phase === "form") startedAt.current = Date.now();
  }, [phase]);

  useEffect(() => {
    if (phase === "done" || phase === "queued") headingRef.current?.focus();
  }, [phase]);

  const begin = () => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      track("review_start");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const data = new FormData(e.currentTarget);
    const payload = {
      mode,
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      url: mode === "site" ? String(data.get("url") ?? "") : "",
      process: mode === "process" ? String(data.get("process") ?? "") : "",
      source: from,
      elapsedMs: startedAt.current ? Date.now() - startedAt.current : 0,
      company: String(data.get("hp_ref") ?? ""),
      turnstileToken: humanToken ?? undefined,
    };
    sentService.current = mode === "site" ? "website" : "ai-automation";
    setTarget(mode === "site" ? payload.url.replace(/^https?:\/\//i, "").replace(/\/.*$/, "") : "");
    setStage("start");
    setProgress(0.03);
    setPhase("working");
    try {
      const res = await fetch("/api/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const fail = (message: string, issues?: Record<string, string[]>) => {
        if (issues) setFieldErrors(Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v[0]])) as Fields);
        throw new Error(message);
      };
      if (!(res.headers.get("content-type") ?? "").includes("ndjson")) {
        // Validation, rate-limit and bot-check replies are plain JSON (or a queued notice for suspected bots).
        const json = await res.json().catch(() => null);
        if (json?.queued) {
          setPhase("queued");
          return;
        }
        fail(json?.error ?? "Something went wrong. Please try again.", json?.issues);
      }
      let finished = false;
      await readEvents(res, (e) => {
        if (e.t === "stage") goStage(e.stage as Stage);
        else if (e.t === "error") fail(String(e.error ?? "Something went wrong. Please try again."), e.issues as Record<string, string[]> | undefined);
        else if (e.t === "queued") {
          finished = true;
          track("review_done");
          setPhase("queued");
        } else if (e.t === "done") {
          finished = true;
          track("review_done");
          setEmailed(Boolean(e.emailed));
          setReview(e.review as Review);
          goStage("done");
          window.setTimeout(() => setPhase("done"), 450);
        }
      });
      if (!finished) throw new Error("The connection dropped. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setHumanReset((n) => n + 1); // Turnstile tokens are single use.
      setPhase("form");
    }
  };

  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -6 },
    transition: { duration: 0.22, ease: EASE },
  };

  const startHref = `/contact?service=${sentService.current}&from=free-review#start`;
  const needsToken = Boolean(TURNSTILE_SITE_KEY) && !humanToken;

  return (
    <div className={cn("rounded-[2rem] bg-purple/[0.05] p-6 md:p-9", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {phase === "form" && (
          <motion.form key="form" {...fade} onSubmit={onSubmit} onFocusCapture={begin} noValidate aria-busy="false">
            <div role="radiogroup" aria-label="What should we review?" className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5">
              {(
                [
                  ["site", "My website"],
                  ["process", "A task we do by hand"],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  onClick={() => setMode(value)}
                  className={cn(
                    "h-11 rounded-xl px-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 ease-out-strong active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/20",
                    mode === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {text}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label htmlFor="fr-name" className={label}>
                  Your name
                </label>
                <Input id="fr-name" name="name" autoComplete="name" required minLength={2} maxLength={80} className={field} aria-invalid={Boolean(fieldErrors.name)} />
                {fieldErrors.name && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="fr-email" className={label}>
                  Your email
                </label>
                <Input id="fr-email" name="email" type="email" autoComplete="email" required maxLength={120} className={field} aria-invalid={Boolean(fieldErrors.email)} />
                {fieldErrors.email && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>
              {mode === "site" ? (
                <div>
                  <label htmlFor="fr-url" className={label}>
                    Your website address
                  </label>
                  <Input id="fr-url" name="url" inputMode="url" autoCapitalize="none" autoCorrect="off" placeholder="yourbusiness.co.zw" required maxLength={200} className={field} aria-invalid={Boolean(fieldErrors.url)} />
                  {fieldErrors.url && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.url}</p>}
                </div>
              ) : (
                <div>
                  <label htmlFor="fr-process" className={label}>
                    What does your team do by hand?
                  </label>
                  <Textarea
                    id="fr-process"
                    name="process"
                    rows={4}
                    required
                    minLength={20}
                    maxLength={600}
                    placeholder="Example: We copy orders from WhatsApp into a spreadsheet, then type them again into our invoicing system."
                    className={field}
                    aria-invalid={Boolean(fieldErrors.process)}
                  />
                  {fieldErrors.process && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.process}</p>}
                </div>
              )}
            </div>

            {/* Honeypot: invisible to people, irresistible to form-filling bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="fr-hp-ref">Leave this field empty</label>
              <input id="fr-hp-ref" name="hp_ref" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
            </div>

            <TurnstileWidget action="review" onToken={setHumanToken} resetSignal={humanReset} />

            {error && (
              <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={needsToken}
              className={cn(
                "group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background",
                "transition-[background-color,transform,opacity] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97] disabled:opacity-60",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/30"
              )}
            >
              {mode === "site" ? "Review my website" : "Review my process"}
              <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-center text-sm text-muted-foreground">Takes about 20 seconds. No call, no card.</p>
          </motion.form>
        )}

        {phase === "working" && (
          <motion.div key="working" {...fade} aria-busy="true" role="status" aria-live="polite" className="flex min-h-[24rem] flex-col items-center justify-center text-center">
            <EchoDots />
            <div className="relative mt-6 h-8 w-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute inset-x-0 font-display text-xl font-bold tracking-tight"
                >
                  {STAGE_LABEL[mode][stage]}...
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex w-full justify-center">
              <EchoBar value={progress} label="Review progress" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {target ? `The Eka team is reviewing ${target}. ` : "The Eka team is reviewing what you wrote. "}Usually about 20 seconds.
            </p>
          </motion.div>
        )}

        {phase === "done" && review && (
          <motion.div key="done" {...fade}>
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] outline-none md:text-4xl">
              {review.headline}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{review.opener}</p>

            <ol className="mt-8 grid gap-4">
              {review.wins.map((w, i) => (
                <motion.li
                  key={w.title}
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: reduce ? 0 : 0.12 + i * 0.07, ease: EASE }}
                  className="rounded-2xl bg-white p-5 md:p-6"
                >
                  <p className="text-xs font-extrabold tracking-[0.12em] text-purple">WIN {i + 1}</p>
                  <p className="mt-1.5 font-display text-xl font-bold leading-snug tracking-tight">{w.title}</p>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{w.body}</p>
                </motion.li>
              ))}
            </ol>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: reduce ? 0 : 0.5, ease: EASE }}
            >
              <p className="mt-8 text-lg font-semibold leading-snug text-purple">{review.nextStep}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={startHref}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]"
                >
                  Start my project
                  <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
                </Link>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi Tapiwa, I just got my free review and I have a question.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold transition-colors hover:text-purple"
                >
                  <FaWhatsapp className="text-[#25D366]" size={18} /> Ask on WhatsApp
                </a>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                {emailed ? "A copy is on its way to your inbox. " : ""}
                Written by the Eka team from what is public on your site. Reply to the email and Tapiwa follows up personally.
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "queued" && (
          <motion.div key="queued" {...fade} className="py-6 text-center">
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] outline-none md:text-4xl">
              Got it. Your review is coming.
            </h3>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
              Our team is finishing it by hand this time and will email it to you within a day. No need to do anything.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={startHref}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]"
              >
                Start my project now
                <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FreeReview;
