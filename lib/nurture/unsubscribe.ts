import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured");
  return s;
}

function sign(leadId: string): string {
  return createHmac("sha256", secret()).update(leadId).digest("hex").slice(0, 32);
}

export function unsubscribeToken(leadId: string): string {
  return sign(leadId);
}

export function verifyUnsubscribeToken(leadId: string, token: string): boolean {
  try {
    const expected = Buffer.from(sign(leadId));
    const given = Buffer.from(token);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}
