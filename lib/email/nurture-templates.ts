import { siteConfig } from "@/lib/seo/site";
import type { LeadDoc } from "@/lib/leads/repository";
import { button, firstName, layout } from "./templates";
import type { Mail } from "./send";

const caseStudyForServices = (services?: string[]): { slug: string; client: string } => {
  if (services?.includes("ai-automation")) return { slug: "faramatsi-toyota", client: "Faramatsi Toyota" };
  if (services?.includes("logo")) return { slug: "kolkart-mining", client: "Kolkart Mining" };
  return { slug: "faramatsi-motors", client: "Faramatsi Motors" };
};

function greet(lead: LeadDoc): string {
  return firstName(lead.name ?? "there");
}

export function partialReminder1hEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `${name}, you're one step from a reply`;
  const html = layout(
    `<p style="margin:0 0 14px;">Hi ${name},</p>
<p style="margin:0 0 14px;">Looks like you started telling me about your project but didn't finish. No pressure, it just means I haven't got your details yet.</p>
<p style="margin:0 0 20px;">${button(`${siteConfig.url}/contact`, "Finish in under a minute")}</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`,
    leadId
  );
  const text = `Hi ${name},\n\nLooks like you started telling me about your project but didn't finish.\n\nFinish here: ${siteConfig.url}/contact\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function partialReminder24hEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `Last reminder, ${name}`;
  const html = layout(
    `<p style="margin:0 0 14px;">Hi ${name},</p>
<p style="margin:0 0 14px;">Quick last nudge. If you still want a website, a logo, or an AI system built for you, it takes under a minute to tell me what you need.</p>
<p style="margin:0 0 20px;">${button(`${siteConfig.url}/contact`, "Tell me about your project")}</p>
<p style="margin:0;">If the timing isn't right, no problem at all. Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`,
    leadId
  );
  const text = `Hi ${name},\n\nLast nudge. If you still want a website, logo, or AI system built, it takes under a minute: ${siteConfig.url}/contact\n\nIf the timing isn't right, no problem.\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day1TipEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `A 5 minute fix most websites are missing`;
  const html = layout(
    `<p style="margin:0 0 14px;">Hi ${name},</p>
<p style="margin:0 0 14px;">One quick, free thing you can check today: open your website on your phone using mobile data, not wifi. Time how long it takes to load. If it's over 3 seconds, you are losing customers before they even see what you sell.</p>
<p style="margin:0 0 14px;">Two free tools that show you exactly what's slow: Google PageSpeed Insights and GTmetrix. Paste your address in, and they'll tell you what to fix.</p>
<p style="margin:0 0 20px;">${button(`${siteConfig.url}/playbook`, "More free tips like this")}</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`,
    leadId
  );
  const text = `Hi ${name},\n\nOpen your website on your phone using mobile data. If it takes over 3 seconds to load, you are losing customers.\n\nCheck it for free with Google PageSpeed Insights or GTmetrix.\n\nMore tips: ${siteConfig.url}/playbook\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day3CaseStudyEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const study = caseStudyForServices(lead.services);
  const subject = `What we did for ${study.client}`;
  const html = layout(
    `<p style="margin:0 0 14px;">Hi ${name},</p>
<p style="margin:0 0 14px;">Since you told me about ${lead.businessName ?? "your business"}, I thought this would be useful: a real project we did for ${study.client}, including what changed and the actual numbers.</p>
<p style="margin:0 0 20px;">${button(`${siteConfig.url}/work/${study.slug}`, "See the results")}</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`,
    leadId
  );
  const text = `Hi ${name},\n\nA real project we did for ${study.client}: ${siteConfig.url}/work/${study.slug}\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day6GuaranteeEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `What if you don't like it?`;
  const html = layout(
    `<p style="margin:0 0 14px;">Hi ${name},</p>
<p style="margin:0 0 14px;">A question I get a lot: "What if I don't like what you build?"</p>
<p style="margin:0 0 14px;">Simple answer: you don't pay. We build your website, logo, or AI system first, with no deposit. You look at it, test it, ask for changes. If you love it, you pay. If you don't, you walk away and owe us nothing.</p>
<p style="margin:0 0 20px;">${button(`${siteConfig.url}/contact`, "Start with zero risk")}</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`,
    leadId
  );
  const text = `Hi ${name},\n\n"What if I don't like it?" You don't pay. We build first, no deposit. You only pay if you love it.\n\nStart: ${siteConfig.url}/contact\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day10CheckInEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `Still thinking it over, ${name}?`;
  const html = layout(
    `<p style="margin:0 0 14px;">Hi ${name},</p>
<p style="margin:0 0 14px;">Just checking in. No pressure at all, I know timing matters. If you still want to talk about ${lead.businessName ?? "your project"}, I'm here.</p>
<p style="margin:0 0 20px;">${button(siteConfig.calUrl, "Book a quick call")}</p>
<p style="margin:0;">Tapiwa<br><span style="color:#7a7d8c;">Founder, Eka</span></p>`,
    leadId
  );
  const text = `Hi ${name},\n\nJust checking in, no pressure. If you still want to talk, book a time: ${siteConfig.calUrl}\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export const NURTURE_STEPS = [
  { type: "day1-tip", afterHours: 24, build: day1TipEmail },
  { type: "day3-case-study", afterHours: 72, build: day3CaseStudyEmail },
  { type: "day6-guarantee", afterHours: 144, build: day6GuaranteeEmail },
  { type: "day10-checkin", afterHours: 240, build: day10CheckInEmail },
] as const;

export const PARTIAL_STEPS = [
  { type: "partial-1h", afterHours: 1, build: partialReminder1hEmail },
  { type: "partial-24h", afterHours: 24, build: partialReminder24hEmail },
] as const;
