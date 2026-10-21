import type { Digest } from "@/lib/digest/generate";
import { siteConfig } from "@/lib/seo/site";
import { unsubscribeToken } from "@/lib/nurture/unsubscribe";
import { escapeHtml, headline, hl, para, signoff, unsubscribeUrl } from "./templates";
import type { Mail } from "./send";

const PURPLE = "#7C3AED";

export type DigestMailInput = {
  to: string;
  leadId: string;
  digest: Digest;
  slug: string;
};

/** The article link, tagged so the admin can see which visits came from the email. */
export const articleUrl = (slug: string) => `${siteConfig.url}/playbook/${slug}?utm_source=digest&utm_medium=email`;

/**
 * The daily email. Same plain, centred, one-idea-per-line style as the other client emails, but built to be read in
 * 20 to 30 seconds: a hook, three short points, one takeaway, a small link to the full article, and a quiet unsubscribe.
 */
export function digestEmail({ to, leadId, digest, slug }: DigestMailInput): Mail {
  const url = articleUrl(slug);
  const unsub = unsubscribeUrl(leadId);
  const oneClick = `${siteConfig.url}/api/unsubscribe?lead=${leadId}&token=${unsubscribeToken(leadId)}`;

  const points = digest.points
    .map(
      (p, i) =>
        `<p style="margin:0 0 18px;font-size:18px;line-height:1.5;"><span style="color:${PURPLE};font-weight:800;">${i + 1}.</span> ${escapeHtml(p)}</p>`
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#ffffff;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111111;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(digest.hook)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
<tr><td align="center" style="text-align:center;">
${headline(escapeHtml(digest.hook))}
${points}
${para(hl(escapeHtml(digest.takeaway)), 26)}
<p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#6b6e7c;">The full article is here if you want more: <a href="${url}" style="color:${PURPLE};font-weight:600;text-decoration:underline;">read it here &rarr;</a><br>Or just reply to this email, I read every one.</p>
${signoff()}
</td></tr>
<tr><td align="center" style="padding:36px 0 0;font-size:12px;line-height:1.7;color:#a0a3b1;text-align:center;">
Eka &middot; ${siteConfig.city}, ${siteConfig.country}<br>
You get this because you shared your details with us. <a href="${unsub}" style="color:#a0a3b1;text-decoration:underline;">Unsubscribe</a>
</td></tr>
</table>
</td></tr></table></body></html>`;

  const text = [
    digest.hook,
    ``,
    ...digest.points.map((p, i) => `${i + 1}. ${p}`),
    ``,
    digest.takeaway,
    ``,
    `The full article is here if you want more: ${url}`,
    `Or just reply to this email, I read every one.`,
    ``,
    `Tapiwa`,
    `Founder, Eka`,
    ``,
    `---`,
    `You get this because you shared your details with Eka. Unsubscribe: ${unsub}`,
  ].join("\n");

  return {
    to,
    subject: digest.subject,
    html,
    text,
    replyTo: siteConfig.email,
    headers: {
      "List-Unsubscribe": `<${oneClick}>, <mailto:${siteConfig.email}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
