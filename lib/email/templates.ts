import { siteConfig } from "@/lib/seo/site";
import {
  GOAL_LABELS,
  ROLE_LABELS,
  SERVICE_LABELS,
  TIMING_LABELS,
  type LeadTier,
} from "@/lib/leads/types";
import type { LeadInput } from "@/lib/leads/schema";
import { unsubscribeToken } from "@/lib/nurture/unsubscribe";
import type { Mail } from "./send";

const PURPLE = "#7C3AED";

export function unsubscribeUrl(leadId: string): string {
  return `${siteConfig.url}/unsubscribe?lead=${leadId}&token=${unsubscribeToken(leadId)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export function layout(inner: string, leadId?: string): string {
  const unsubLine = leadId
    ? ` &middot; <a href="${unsubscribeUrl(leadId)}" style="color:#7a7d8c;">Unsubscribe</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f6f6f9;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14151f;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px 28px;">
<tr><td style="font-size:16px;line-height:1.6;">${inner}</td></tr>
</table>
<p style="font-size:12px;color:#7a7d8c;margin:16px 0 0;">Eka, Harare, Zimbabwe &middot; <a href="${siteConfig.url}" style="color:#7a7d8c;">eka.dev</a>${unsubLine}</p>
</td></tr></table></body></html>`;
}

export const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${PURPLE};color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;border-radius:999px;">${label}</a>`;

export const whatsappLink = (text: string) =>
  `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const checklistUrl = () => `${siteConfig.url}/resources/launch-checklist`;
export const playbookUrl = () => `${siteConfig.url}/playbook`;

/** The instant "we got you" email sent to the lead. */
export type ConfirmationOptions = {
  leadId?: string;
  /** Whether to offer the Cal.com call. False for small logo jobs, which are handled on WhatsApp and email. */
  booking: boolean;
  budgetLabel: string;
  tierName: string;
};

export function leadConfirmationEmail(lead: LeadInput, tier: LeadTier, opts: ConfirmationOptions): Mail {
  const { leadId, booking } = opts;
  const first = escapeHtml(firstName(lead.name));
  const business = escapeHtml(lead.businessName);
  const qualified = tier !== "nurture";
  const needs = lead.services.map((s) => SERVICE_LABELS[s].toLowerCase()).join(" and ");
  const plan = `${opts.tierName} (${opts.budgetLabel})`;

  if (qualified) {
    const subject = booking
      ? `Got it, ${firstName(lead.name)}. Let's book your call`
      : `Got it, ${firstName(lead.name)}. I'll message you soon`;
    const nextStep = booking
      ? `Next step: pick a time that suits you and we'll talk it through.`
      : `Next step: I'll message you on WhatsApp or email to talk through your ${needs}.`;
    const text = [
      `Hi ${firstName(lead.name)},`,
      ``,
      `Thanks for telling me about ${lead.businessName}. I read every request myself.`,
      `You asked about ${needs}, and the range that feels right is ${plan}.`,
      ``,
      nextStep,
      ...(booking ? [`Book a call: ${siteConfig.calUrl}`] : []),
      ``,
      `Prefer WhatsApp? Message me on ${siteConfig.whatsappDisplay}.`,
      ``,
      `While you wait, this is worth 5 minutes: the Website Launch Checklist for Zimbabwean businesses.`,
      checklistUrl(),
      ``,
      `Remember how we work: we build it first, and you pay only when you love it.`,
      ``,
      `Tapiwa`,
      `Founder, Eka`,
    ].join("\n");

    const html = layout(`
<p style="margin:0 0 14px;">Hi ${first},</p>
<p style="margin:0 0 14px;">Thanks for telling me about <strong>${business}</strong>. I read every request myself.</p>
<p style="margin:0 0 14px;">You asked about ${escapeHtml(needs)}, and the range that feels right is <strong>${escapeHtml(plan)}</strong>.</p>
${
  booking
    ? `<p style="margin:0 0 20px;"><strong>Next step:</strong> pick a time that suits you and we'll talk it through.</p>
<p style="margin:0 0 20px;">${button(siteConfig.calUrl, "Book your call")}</p>`
    : `<p style="margin:0 0 20px;"><strong>Next step:</strong> I'll message you on WhatsApp or email to talk through your ${escapeHtml(needs)}.</p>`
}
<p style="margin:0 0 14px;">Prefer WhatsApp? Message me on <a href="${whatsappLink(`Hi Tapiwa, it's ${lead.name} from ${lead.businessName}.`)}" style="color:${PURPLE};">${siteConfig.whatsappDisplay}</a>.</p>
<p style="margin:0 0 14px;">While you wait, this is worth 5 minutes: the <a href="${checklistUrl()}" style="color:${PURPLE};">Website Launch Checklist</a> for Zimbabwean businesses.</p>
<p style="margin:0 0 20px;">Remember how we work: we build it first, and you pay only when you love it.</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`, leadId);

    return { to: lead.email, subject, html, text };
  }

  const subject = `Thanks ${firstName(lead.name)}, a free checklist for ${lead.businessName}`;
  const text = [
    `Hi ${firstName(lead.name)},`,
    ``,
    `Thanks for telling me about ${lead.businessName}.`,
    ``,
    `I'll be straight with you: a custom build is probably not the right fit at this budget yet. I'd rather tell you that than waste your time.`,
    ``,
    `Here is what I can do for you right now, for free:`,
    `1. The Website Launch Checklist: ${checklistUrl()}`,
    `2. The Playbook, with new tips on websites and AI every day: ${playbookUrl()}`,
    ``,
    `When your budget grows, come back. The offer stays the same: we build it first, and you pay only when you love it.`,
    ``,
    `Tapiwa`,
    `Founder, Eka`,
  ].join("\n");

  const html = layout(`
<p style="margin:0 0 14px;">Hi ${first},</p>
<p style="margin:0 0 14px;">Thanks for telling me about <strong>${business}</strong>.</p>
<p style="margin:0 0 14px;">I'll be straight with you: a custom build is probably not the right fit at this budget yet. I'd rather tell you that than waste your time.</p>
<p style="margin:0 0 8px;">Here is what I can do for you right now, for free:</p>
<p style="margin:0 0 6px;">1. <a href="${checklistUrl()}" style="color:${PURPLE};">The Website Launch Checklist</a></p>
<p style="margin:0 0 18px;">2. <a href="${playbookUrl()}" style="color:${PURPLE};">The Playbook</a>, with new tips on websites and AI every day</p>
<p style="margin:0 0 20px;">When your budget grows, come back. The offer stays the same: we build it first, and you pay only when you love it.</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`, leadId);

  return { to: lead.email, subject, html, text };
}

/** Notification to the owner with everything the lead told us. */
export function ownerNotificationEmail(
  lead: LeadInput,
  tier: LeadTier,
  score: number,
  budget: string,
  notifyEmail?: string
): Mail {
  const to = notifyEmail || process.env.LEAD_NOTIFY_EMAIL || siteConfig.email;
  const tag = tier === "priority" ? "PRIORITY" : tier === "qualified" ? "QUALIFIED" : "NURTURE";
  const subject = `[${tag}] ${lead.businessName}, ${budget}`;

  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["WhatsApp", lead.whatsapp],
    ["Business", lead.businessName],
    ["What they do", lead.businessDescription || "Not given"],
    ["Website", lead.website || "None"],
    ["Role", ROLE_LABELS[lead.role]],
    ["Needs", lead.services.map((s) => SERVICE_LABELS[s]).join(", ")],
    ["Main goal", GOAL_LABELS[lead.goal]],
    ["Timing", TIMING_LABELS[lead.timing]],
    ["Budget", budget],
    ["Notes", lead.notes || "None"],
    ["Score", `${score} / 100`],
  ];

  const waNumber = lead.whatsapp.replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${firstName(lead.name)}, it's Tapiwa from Eka. Thanks for your request about ${lead.businessName}.`)}`;

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#7a7d8c;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  const html = layout(`
<p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:.04em;color:${tier === "nurture" ? "#7a7d8c" : PURPLE};">${tag} LEAD</p>
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;">${escapeHtml(lead.businessName)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;">${tableRows}</table>
<p style="margin:22px 0 0;">${button(waLink, "Reply on WhatsApp")}</p>`);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nWhatsApp: ${waLink}`;

  return { to, subject, html, text, replyTo: lead.email };
}
