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

/** Bold and coloured: the one emphasis style in client emails, used sparingly on the phrase that matters. */
export const hl = (text: string) => `<strong style="color:${PURPLE};font-weight:800;">${text}</strong>`;

/** One short idea per paragraph, centred by the layout. */
export const para = (html: string, bottom = 22) =>
  `<p style="margin:0 0 ${bottom}px;font-size:18px;line-height:1.55;">${html}</p>`;

/** A large opening line. */
export const headline = (html: string) =>
  `<h1 style="margin:0 0 24px;font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-0.01em;color:#111111;">${html}</h1>`;

export const link = (href: string, label: string) =>
  `<a href="${href}" style="color:${PURPLE};font-weight:700;">${label}</a>`;

export const signoff = () =>
  `<p style="margin:8px 0 0;font-size:16px;line-height:1.5;color:#111111;"><strong>Tapiwa</strong><br><span style="color:#7a7d8c;">Founder, Eka</span></p>`;

/** Company proof, centred under every client email: logo, name, place, how to reach us. */
function companyFooter(leadId?: string): string {
  const muted = "color:#7a7d8c;text-decoration:none;";
  const unsub = leadId
    ? `<br><a href="${unsubscribeUrl(leadId)}" style="color:#a0a3b1;text-decoration:underline;">Unsubscribe</a>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;border-top:1px solid #ececf1;">
<tr><td align="center" style="padding:28px 0 0;font-size:13px;line-height:1.7;color:#7a7d8c;text-align:center;">
<a href="${siteConfig.url}"><img src="${siteConfig.url}/eka-wordmark.png" alt="Eka" width="112" style="display:block;margin:0 auto 14px;border:0;height:auto;"></a>
<strong style="color:#111111;">Eka</strong> &middot; Websites, AI and software for African businesses<br>
Harare, Zimbabwe<br>
<a href="${siteConfig.url}" style="${muted}">eka.dev</a> &middot; <a href="https://wa.me/${siteConfig.whatsappNumber}" style="${muted}">WhatsApp ${siteConfig.whatsappDisplay}</a> &middot; <a href="mailto:${siteConfig.email}" style="${muted}">${siteConfig.email}</a>${unsub}
</td></tr></table>`;
}

/** Client email shell: white, centred, minimal. Body copy goes in as short blocks. */
export function layout(inner: string, leadId?: string): string {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
<tr><td align="center" style="text-align:center;">${inner}</td></tr>
<tr><td>${companyFooter(leadId)}</td></tr>
</table>
</td></tr></table></body></html>`;
}

/** Plain data layout, for the owner's own lead notification. */
function plainLayout(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f6f9;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14151f;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px 28px;">
<tr><td style="font-size:16px;line-height:1.6;">${inner}</td></tr>
</table>
</td></tr></table></body></html>`;
}

/** The one big call to action. Wrapped in its own paragraph so it centres and spaces like the copy. */
export const button = (href: string, label: string) =>
  `<p style="margin:0 0 30px;"><a href="${href}" style="display:inline-block;background:${PURPLE};color:#ffffff;text-decoration:none;font-weight:800;font-size:18px;padding:17px 34px;border-radius:10px;">${label}</a></p>`;

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

    const html = layout(
      headline(`Got it, ${first}.`) +
        para(`Thanks for telling me about ${hl(business)}. I read every request myself.`) +
        para(`You asked about ${escapeHtml(needs)}. The range that feels right is ${hl(escapeHtml(plan))}.`) +
        (booking
          ? para(`${hl("Next step:")} pick a time that suits you.`, 26) + button(siteConfig.calUrl, "Book your call")
          : para(`${hl("Next step:")} I'll message you on WhatsApp or email to talk through your ${escapeHtml(needs)}.`)) +
        para(
          `Prefer WhatsApp? ${link(whatsappLink(`Hi Tapiwa, it's ${lead.name} from ${lead.businessName}.`), `Message me on ${siteConfig.whatsappDisplay}`)}`
        ) +
        para(`While you wait, read the ${link(checklistUrl(), "Website Launch Checklist")}. It takes 5 minutes.`) +
        para(`We build it first. ${hl("You pay only when you love it.")}`) +
        signoff(),
      leadId
    );

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

  const html = layout(
    headline(`Thanks, ${first}.`) +
      para(`I read what you told me about ${hl(business)}.`) +
      para(`I'll be straight with you: a custom build is ${hl("probably not the right fit")} at this budget yet. I'd rather say that than waste your time.`) +
      para(`Here is what I can do for you right now, free:`) +
      para(link(checklistUrl(), "The Website Launch Checklist"), 8) +
      para(`${link(playbookUrl(), "The Playbook")}, with new tips on websites and AI`) +
      para(`When your budget grows, come back. We build it first, and ${hl("you pay only when you love it.")}`) +
      signoff(),
    leadId
  );

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

  const html = plainLayout(`
<p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:.04em;color:${tier === "nurture" ? "#7a7d8c" : PURPLE};">${tag} LEAD</p>
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;">${escapeHtml(lead.businessName)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;">${tableRows}</table>
<p style="margin:22px 0 0;"><a href="${waLink}" style="display:inline-block;background:${PURPLE};color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;border-radius:999px;">Reply on WhatsApp</a></p>`);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nWhatsApp: ${waLink}`;

  return { to, subject, html, text, replyTo: lead.email };
}
