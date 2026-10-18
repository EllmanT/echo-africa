import { createHmac } from "node:crypto";

import { safeEqual } from "@/lib/security/safeEqual";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured");
  return s;
}

/** Domain-separated key so the unsubscribe HMAC never shares a key with the admin session JWT. */
function sign(leadId: string, legacy = false): string {
  const key = legacy ? secret() : createHmac("sha256", secret()).update("eka:unsubscribe:v1").digest("hex");
  return createHmac("sha256", key).update(leadId).digest("hex").slice(0, 32);
}

export function unsubscribeToken(leadId: string): string {
  return sign(leadId);
}

export function verifyUnsubscribeToken(leadId: string, token: string): boolean {
  try {
    // Links emailed before the key was separated were signed with SESSION_SECRET directly; keep them working.
    return safeEqual(sign(leadId), token) || safeEqual(sign(leadId, true), token);
  } catch {
    return false;
  }
}
