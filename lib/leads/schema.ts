import { z } from "zod";
import { isPlausibleWhatsapp, normalizeWhatsapp, WHATSAPP_ERROR } from "./phone";
import { GOALS, ROLES, SERVICES, TIMINGS } from "./types";

/** Stored as one international number (077 123 4567 becomes +263771234567), so a WhatsApp link always works. */
export const phone = z
  .string()
  .trim()
  .transform(normalizeWhatsapp)
  .refine(isPlausibleWhatsapp, WHATSAPP_ERROR);

export const needsSchema = z.object({
  services: z.array(z.enum(SERVICES)).min(1, "Pick at least one"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(120),
  whatsapp: phone,
});

export const businessSchema = z.object({
  businessName: z.string().trim().min(2, "Tell us your business name").max(120),
  businessDescription: z.string().trim().max(600).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Pick one" }) }),
});

export const goalSchema = z.object({
  goal: z.enum(GOALS, { errorMap: () => ({ message: "Pick one" }) }),
  timing: z.enum(TIMINGS, { errorMap: () => ({ message: "Pick one" }) }),
});

/** `budget` is the key of a pricing tier. The server checks it against the live tiers for these services. */
export const budgetSchema = z.object({
  budget: z.string({ required_error: "Pick a range" }).trim().min(1, "Pick a range").max(60),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const fullLeadSchema = needsSchema
  .merge(contactSchema)
  .merge(businessSchema)
  .merge(goalSchema)
  .merge(budgetSchema);

export type LeadInput = z.infer<typeof fullLeadSchema>;

/** Request body for POST /api/leads. */
export const leadRequestSchema = z.discriminatedUnion("stage", [
  z.object({
    stage: z.literal("partial"),
    leadId: z.string().optional(),
    data: needsSchema.merge(contactSchema),
    source: z.string().max(200).optional(),
  }),
  z.object({
    stage: z.literal("complete"),
    leadId: z.string().optional(),
    data: fullLeadSchema,
    source: z.string().max(200).optional(),
    /** Milliseconds between opening the form and submitting; used against bots. */
    elapsedMs: z.number().int().nonnegative(),
    /** Honeypot: real people never fill this in. */
    company: z.string().max(200).optional(),
    /** Cloudflare Turnstile token from the final step. Checked server-side when Turnstile is configured. */
    turnstileToken: z.string().max(2048).optional(),
  }),
]);

export type LeadRequest = z.infer<typeof leadRequestSchema>;
