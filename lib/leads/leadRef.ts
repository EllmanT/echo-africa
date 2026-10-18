import { createHmac } from "node:crypto";
import { ObjectId } from "mongodb";

import { safeEqual } from "@/lib/security/safeEqual";

function key(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured");
  return createHmac("sha256", s).update("eka:leadref:v1").digest("hex");
}

function mac(id: string): string {
  return createHmac("sha256", key()).update(id).digest("hex").slice(0, 24);
}

/** The id handed to the browser: "<objectId>.<mac>". Knowing a bare lead id (they appear in email links) is not enough to edit that lead. */
export function signLeadRef(id: string): string {
  return `${id}.${mac(id)}`;
}

/** Returns the real lead id when the reference is genuine, otherwise undefined (caller then creates a fresh lead). */
export function parseLeadRef(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  const [id, sig] = ref.split(".");
  if (!id || !sig || !ObjectId.isValid(id)) return undefined;
  try {
    return safeEqual(mac(id), sig) ? id : undefined;
  } catch {
    return undefined;
  }
}
