import { siteConfig } from "@/lib/seo/site";
import type { LeadDoc } from "@/lib/leads/repository";
import { button, escapeHtml, firstName, headline, hl, layout, link, para, signoff } from "./templates";
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
    headline(`You're one step away, ${escapeHtml(name)}.`) +
      para(`You started telling me about your project but didn't finish. That's fine. It just means ${hl("I don't have your details yet.")}`, 28) +
      button(`${siteConfig.url}/contact`, "Finish in under a minute") +
      signoff(),
    leadId
  );
  const text = `Hi ${name},\n\nLooks like you started telling me about your project but didn't finish.\n\nFinish here: ${siteConfig.url}/contact\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function partialReminder24hEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `Last reminder, ${name}`;
  const html = layout(
    headline(`Last nudge, ${escapeHtml(name)}.`) +
      para(`Still want a website, a logo or an AI system built for you? It takes ${hl("under a minute")} to tell me what you need.`, 28) +
      button(`${siteConfig.url}/contact`, "Tell me about your project") +
      para(`If the timing isn't right, no problem at all.`) +
      signoff(),
    leadId
  );
  const text = `Hi ${name},\n\nLast nudge. If you still want a website, logo, or AI system built, it takes under a minute: ${siteConfig.url}/contact\n\nIf the timing isn't right, no problem.\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day1TipEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `A 5 minute fix most websites are missing`;
  const html = layout(
    headline(`Try this today, ${escapeHtml(name)}.`) +
      para(`Open your website on your phone using ${hl("mobile data, not wifi.")}`) +
      para(`Time how long it takes to load.`) +
      para(`Over 3 seconds? You are ${hl("losing customers")} before they see what you sell.`) +
      para(`Google PageSpeed Insights and GTmetrix are free. Paste your address in and they show you exactly what to fix.`, 28) +
      button(`${siteConfig.url}/playbook`, "More free tips like this") +
      signoff(),
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
    headline(`Here's what we did for ${escapeHtml(study.client)}.`) +
      para(`You told me about ${escapeHtml(lead.businessName ?? "your business")}, so I thought this would help.`) +
      para(`A real project. What changed. ${hl("The actual numbers.")}`, 28) +
      button(`${siteConfig.url}/work/${study.slug}`, "See the results") +
      signoff(),
    leadId
  );
  const text = `Hi ${name},\n\nA real project we did for ${study.client}: ${siteConfig.url}/work/${study.slug}\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day6GuaranteeEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `What if you don't like it?`;
  const html = layout(
    headline(`"What if I don't like it?"`) +
      para(`I get this a lot. The answer is simple: ${hl("you don't pay.")}`) +
      para(`We build your website, logo or AI system first. No deposit.`) +
      para(`You look at it. Test it. Ask for changes.`) +
      para(`Love it? You pay. Don't? ${hl("You walk away and owe us nothing.")}`, 28) +
      button(`${siteConfig.url}/contact`, "Start with zero risk") +
      signoff(),
    leadId
  );
  const text = `Hi ${name},\n\n"What if I don't like it?" You don't pay. We build first, no deposit. You only pay if you love it.\n\nStart: ${siteConfig.url}/contact\n\nTapiwa`;
  return { to: lead.email ?? "", subject, html, text };
}

export function day10CheckInEmail(lead: LeadDoc, leadId: string): Mail {
  const name = greet(lead);
  const subject = `Still thinking it over, ${name}?`;
  const html = layout(
    headline(`Still thinking it over, ${escapeHtml(name)}?`) +
      para(`No pressure. I know timing matters.`) +
      para(`If you still want to talk about ${hl(escapeHtml(lead.businessName ?? "your project"))}, I'm here.`, 28) +
      button(siteConfig.calUrl, "Book a quick call") +
      para(`Or just reply to this email, or ${link(`https://wa.me/${siteConfig.whatsappNumber}`, "message me on WhatsApp")}.`) +
      signoff(),
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
