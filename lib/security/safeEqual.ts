import { timingSafeEqual } from "node:crypto";

/** Constant-time string comparison. Length mismatch returns false without comparing bytes. */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
