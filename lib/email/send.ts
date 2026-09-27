import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);
}

function transport(): Transporter {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT ?? 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
  });
  return cached;
}

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/** Sends one email. Never throws: returns whether it was sent. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!emailConfigured()) {
    console.warn(`[email] SMTP not configured, skipped: "${mail.subject}"`);
    return false;
  }
  try {
    await transport().sendMail({
      from: `"Tapiwa from Eka" <${process.env.SMTP_EMAIL}>`,
      replyTo: mail.replyTo ?? process.env.SMTP_EMAIL,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    return true;
  } catch (error) {
    console.error("[email] send failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
