import { siteConfig } from "@/lib/seo/site";
import type { Review } from "@/lib/review/generate";
import { button, escapeHtml, firstName, headline, hl, layout, para, signoff, whatsappLink } from "./templates";
import type { Mail } from "./send";

const DISCLOSURE =
  "This quick review was put together by the Eka team from what is public on your site. Reply to this email and I will follow up personally.";

/** The free review, sent to the visitor in the same centred, plain Hormozi style as the other client emails. */
export function reviewEmail(opts: { name: string; email: string; mode: "site" | "process"; subject?: string; review: Review; leadId?: string }): Mail {
  const { review, leadId } = opts;
  const first = firstName(opts.name);
  const cta = `${siteConfig.url}/contact?from=free-review-email#start`;
  const subject = opts.subject ?? `${first}, your free review is ready`;

  const wins = review.wins
    .map(
      (w, i) =>
        `<p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;font-weight:800;color:#7C3AED;">WIN ${i + 1}</p>` +
        `<h2 style="margin:0 0 8px;font-size:21px;line-height:1.25;font-weight:800;color:#111111;">${escapeHtml(w.title)}</h2>` +
        para(escapeHtml(w.body), 28)
    )
    .join("");

  const html = layout(
    headline(escapeHtml(review.headline)) +
      para(escapeHtml(review.opener), 30) +
      wins +
      para(hl(escapeHtml(review.nextStep)), 26) +
      button(cta, "Start my project") +
      para(`Prefer to talk? <a href="${whatsappLink("Hi Tapiwa, I got my free review and I have a question.")}" style="color:#7C3AED;font-weight:700;">Message me on WhatsApp</a>.`, 22) +
      signoff() +
      `<p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#a0a3b1;">${escapeHtml(DISCLOSURE)}</p>`,
    leadId
  );

  const text = [
    `Hi ${first},`,
    ``,
    review.headline,
    ``,
    review.opener,
    ``,
    ...review.wins.flatMap((w, i) => [`WIN ${i + 1}: ${w.title}`, w.body, ``]),
    review.nextStep,
    ``,
    `Start your project: ${cta}`,
    `Prefer WhatsApp? ${siteConfig.whatsappDisplay}`,
    ``,
    `Tapiwa`,
    `Founder, Eka`,
    ``,
    DISCLOSURE,
  ].join("\n");

  return { to: opts.email, subject, html, text, replyTo: siteConfig.email };
}

/** Heads-up to the owner: who asked, what they asked for, and what the review said (or that a human reply is needed). */
export function reviewOwnerEmail(opts: {
  to: string;
  name: string;
  email: string;
  mode: "site" | "process";
  subject: string;
  target: string;
  review?: Review;
  /** Why no review was produced, shown to the owner only. */
  failure?: string;
  leadId?: string;
}): Mail {
  const e = escapeHtml;
  const summary = opts.review
    ? `<p><strong>${e(opts.review.headline)}</strong></p><ol>${opts.review.wins.map((w) => `<li><strong>${e(w.title)}</strong>: ${e(w.body)}</li>`).join("")}</ol>`
    : `<p><strong>No AI review was sent.</strong> Please reply to this person yourself.${opts.failure ? `<br>Reason: ${e(opts.failure.slice(0, 300))}` : ""}</p>`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111;">
<h2 style="margin:0 0 12px;">${e(opts.subject)}</h2>
<p><strong>${e(opts.name)}</strong> &lt;${e(opts.email)}&gt;<br>${opts.mode === "site" ? "Website" : "Process"}: ${e(opts.target)}</p>
${summary}
${opts.leadId ? `<p><a href="${siteConfig.url}/admin/leads">Open in admin</a></p>` : ""}</div>`;
  const text = [
    opts.subject,
    `${opts.name} <${opts.email}>`,
    `${opts.mode === "site" ? "Website" : "Process"}: ${opts.target}`,
    opts.review ? `${opts.review.headline}\n${opts.review.wins.map((w) => `- ${w.title}: ${w.body}`).join("\n")}` : `No AI review was sent. Reply to this person yourself.${opts.failure ? ` Reason: ${opts.failure.slice(0, 300)}` : ""}`,
  ].join("\n\n");
  return { to: opts.to, subject: opts.subject, html, text, replyTo: opts.email };
}
