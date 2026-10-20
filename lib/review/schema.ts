import { z } from "zod";

import { phone } from "@/lib/leads/schema";

/** What the visitor wants reviewed. Either a public website address, or a manual process they want automated. */
export const reviewRequestSchema = z
  .object({
    mode: z.enum(["site", "process"]),
    name: z.string().trim().min(2, "Tell us your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(120),
    /** Required: a phone number is the fastest way for us to follow up, and the review is worth a number. */
    whatsapp: phone,
    url: z.string().trim().max(200).optional().or(z.literal("")),
    process: z.string().trim().max(600).optional().or(z.literal("")),
    /** Text the browser read out of an uploaded PDF or Word file. The file itself never reaches the server. */
    documentText: z.string().max(8200).optional().or(z.literal("")),
    documentName: z.string().trim().max(120).optional().or(z.literal("")),
    source: z.string().max(60).optional(),
    /** Milliseconds between the form appearing and submit; used against bots. */
    elapsedMs: z.number().int().nonnegative(),
    /** Honeypot: real people never fill this in. */
    company: z.string().max(200).optional(),
    turnstileToken: z.string().max(2048).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "site" && !v.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Enter your website address" });
    if (v.mode === "process" && (v.process ?? "").length < 20 && (v.documentText ?? "").trim().length < 40) {
      ctx.addIssue({ code: "custom", path: ["process"], message: "Tell us a bit more (at least a sentence), or upload a file" });
    }
  });

export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

/**
 * The identity a mailbox limit is counted against: lower case, "+tag" removed, and for Gmail the dots removed,
 * so me+1@gmail.com, m.e@gmail.com and me@googlemail.com all count as one person.
 */
export function mailboxKey(email: string): string {
  const [rawLocal = "", rawDomain = ""] = email.trim().toLowerCase().split("@");
  let local = rawLocal.split("+")[0];
  let domain = rawDomain;
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
}

/** "zimmotors.co.zw", "www.x.com/a" or a full URL all become a full https URL. Returns null if it cannot be one. */
export function normalizeSiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    return u.toString();
  } catch {
    return null;
  }
}

/** A short label for the lead record: the site's hostname without "www.". */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Free review";
  }
}
