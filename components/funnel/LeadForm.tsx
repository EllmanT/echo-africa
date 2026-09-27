"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaArrowLeft, FaArrowRight, FaWhatsapp } from "react-icons/fa6";

import ChoiceTile from "./ChoiceTile";
import LeadResult from "./LeadResult";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { fullLeadSchema } from "@/lib/leads/schema";
import {
  BUDGETS,
  BUDGET_LABELS,
  GOALS,
  GOAL_LABELS,
  ROLES,
  ROLE_LABELS,
  SERVICES,
  SERVICE_LABELS,
  TIMINGS,
  TIMING_LABELS,
  type LeadTier,
  type Service,
} from "@/lib/leads/types";
import { siteConfig } from "@/lib/seo/site";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

type FormValues = z.input<typeof fullLeadSchema>;

const SERVICE_HINTS: Record<Service, string> = {
  website: "A fast site that brings in customers",
  logo: "A mark you are proud to put on everything",
  "ai-automation": "Hand repeat work over to AI",
  "custom-software": "Systems built around how you work",
  "not-sure": "Not sure yet. Help me decide",
};

const STEPS = [
  {
    title: "What do you need?",
    hint: "Pick everything that applies.",
    fields: ["services"] as const,
  },
  {
    title: "Where can we reach you?",
    hint: "We reply on WhatsApp and by email.",
    fields: ["name", "email", "whatsapp"] as const,
  },
  {
    title: "Tell us about your business.",
    hint: "A few words is enough.",
    fields: ["businessName", "role"] as const,
  },
  {
    title: "What matters most to you?",
    hint: "So we can aim at the right result.",
    fields: ["goal", "timing"] as const,
  },
  {
    title: "What investment feels right?",
    hint: "Simple business websites start at $500. Bigger projects cost more. This helps us suggest the right plan.",
    fields: ["budget"] as const,
  },
];

const EASE = [0.23, 1, 0.32, 1] as const;

type Result = { tier: LeadTier; name: string; email: string; businessName: string };

const LeadForm = () => {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [leadId, setLeadId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const startedAt = useRef<number | null>(null);
  const tracked = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullLeadSchema),
    mode: "onTouched",
    defaultValues: {
      services: [],
      name: "",
      email: "",
      whatsapp: "",
      businessName: "",
      businessDescription: "",
      website: "",
      notes: "",
    },
  });

  const begin = useCallback(() => {
    if (startedAt.current === null) startedAt.current = Date.now();
    if (!tracked.current) {
      tracked.current = true;
      track("form_start");
    }
  }, []);

  // Move focus to the new question so keyboard and screen reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, [step, result]);

  const post = async (payload: unknown) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Something went wrong");
    return json as { leadId: string | null; tier?: LeadTier };
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setError(null);
  };

  const onContinue = async () => {
    setError(null);
    const current = STEPS[step];
    const valid = await form.trigger([...current.fields], { shouldFocus: true });
    if (!valid) return;

    // Contact details are in: save the lead now so an abandoned form is still a lead.
    if (step === 1) {
      const v = form.getValues();
      try {
        const saved = await post({
          stage: "partial",
          leadId,
          source: window.location.pathname,
          data: { services: v.services, name: v.name, email: v.email, whatsapp: v.whatsapp },
        });
        if (saved.leadId) setLeadId(saved.leadId);
      } catch {
        // A failed partial save must never stop the visitor.
      }
    }

    track("form_step", { step: step + 1 });

    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }

    // Final step: send everything.
    const honeypot = (document.getElementById("company") as HTMLInputElement | null)?.value;
    const values = form.getValues();
    setBusy(true);
    try {
      const done = await post({
        stage: "complete",
        leadId,
        source: window.location.pathname,
        data: values,
        elapsedMs: startedAt.current ? Date.now() - startedAt.current : 0,
        company: honeypot,
      });
      const tier = done.tier ?? "nurture";
      track("form_complete");
      track(tier === "nurture" ? "lead_nurture" : "lead_qualified");
      setDirection(1);
      setResult({ tier, name: values.name, email: values.email, businessName: values.businessName });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const slide = {
    initial: { opacity: 0, x: reduce ? 0 : direction * 18 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : direction * -12 },
    transition: { duration: 0.22, ease: EASE },
  };

  const progress = ((result ? STEPS.length : step) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <div onFocusCapture={begin} onClickCapture={begin}>
      {!result && (
        <div className="mb-8">
          <div className="flex items-baseline justify-between text-sm text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>About 2 minutes</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            aria-label="Form progress"
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.07]"
          >
            <div
              className="h-full origin-left rounded-full bg-purple transition-[width] duration-300 ease-out-strong"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div key="result" {...slide}>
            <h1 ref={headingRef} tabIndex={-1} className="sr-only">
              Your request was sent
            </h1>
            <LeadResult {...result} />
          </motion.div>
        ) : (
          <motion.div key={step} {...slide}>
            <Form {...form}>
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  void onContinue();
                }}
              >
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] outline-none md:text-4xl"
                >
                  {STEPS[step].title}
                </h2>
                <p className="mt-2 max-w-md text-base text-muted-foreground">{STEPS[step].hint}</p>

                <div className="mt-7 space-y-3">
                  {step === 0 && (
                    <FormField
                      control={form.control}
                      name="services"
                      render={({ field }) => (
                        <FormItem>
                          <div role="group" aria-label="Services you need" className="space-y-3">
                            {SERVICES.map((s) => {
                              const selected = (field.value ?? []).includes(s);
                              return (
                                <ChoiceTile
                                  key={s}
                                  multi
                                  label={SERVICE_LABELS[s]}
                                  description={SERVICE_HINTS[s]}
                                  selected={selected}
                                  onSelect={() => {
                                    const current = field.value ?? [];
                                    // "Not sure" is exclusive: it cancels the others and vice versa.
                                    const next =
                                      s === "not-sure"
                                        ? selected
                                          ? []
                                          : ["not-sure" as Service]
                                        : selected
                                          ? current.filter((x) => x !== s)
                                          : [...current.filter((x) => x !== "not-sure"), s];
                                    field.onChange(next);
                                  }}
                                />
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {step === 1 && (
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your name</FormLabel>
                            <FormControl>
                              <Input autoComplete="name" placeholder="Tendai Moyo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" autoComplete="email" inputMode="email" placeholder="you@company.co.zw" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp number</FormLabel>
                            <FormControl>
                              <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="+263 77 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business name</FormLabel>
                            <FormControl>
                              <Input autoComplete="organization" placeholder="Moyo Motors" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="businessDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              What does your business do? <span className="font-normal text-muted-foreground">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea rows={3} placeholder="We sell and service used cars in Harare." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Current website <span className="font-normal text-muted-foreground">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input inputMode="url" autoComplete="url" placeholder="yourbusiness.co.zw" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel id="role-label">Your role</FormLabel>
                            <div role="radiogroup" aria-labelledby="role-label" className="space-y-2">
                              {ROLES.map((r) => (
                                <ChoiceTile key={r} label={ROLE_LABELS[r]} selected={field.value === r} onSelect={() => field.onChange(r)} />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel id="goal-label">Main goal</FormLabel>
                            <div role="radiogroup" aria-labelledby="goal-label" className="space-y-2">
                              {GOALS.map((g) => (
                                <ChoiceTile key={g} label={GOAL_LABELS[g]} selected={field.value === g} onSelect={() => field.onChange(g)} />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel id="timing-label">When do you want to start?</FormLabel>
                            <div role="radiogroup" aria-labelledby="timing-label" className="space-y-2">
                              {TIMINGS.map((t) => (
                                <ChoiceTile key={t} label={TIMING_LABELS[t]} selected={field.value === t} onSelect={() => field.onChange(t)} />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <div role="radiogroup" aria-label="Investment range" className="space-y-2">
                              {BUDGETS.map((b) => (
                                <ChoiceTile key={b} label={BUDGET_LABELS[b]} selected={field.value === b} onSelect={() => field.onChange(b)} />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Anything else we should know? <span className="font-normal text-muted-foreground">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea rows={3} placeholder="Deadlines, examples you like, problems you want solved." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Honeypot: hidden from people, tempting to bots. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {error && (
                  <div role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/[0.05] p-4 text-sm">
                    <p className="font-medium text-destructive">{error}</p>
                    <a
                      href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi Tapiwa, my form did not send. I need help with a project.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-semibold text-foreground underline underline-offset-4"
                    >
                      <FaWhatsapp /> Message me on WhatsApp instead
                    </a>
                  </div>
                )}

                <div className="mt-9 flex items-center gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => goTo(step - 1)}
                      className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-base font-medium text-muted-foreground transition-[color,transform] duration-150 hover:text-foreground active:scale-[0.97]"
                    >
                      <FaArrowLeft size={13} /> Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className={cn(
                      "group inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background sm:flex-none",
                      "transition-[background-color,transform,opacity] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97] disabled:opacity-60"
                    )}
                  >
                    {busy ? "Sending..." : isLast ? "Send my request" : "Continue"}
                    {!busy && (
                      <FaArrowRight
                        size={13}
                        className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </div>

                {isLast && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    By sending, you agree that we can contact you about this project. No spam, and no upfront fee.
                  </p>
                )}
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadForm;
