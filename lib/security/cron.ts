import { safeEqual } from "./safeEqual";

/** Constant-time check of "Authorization: Bearer <CRON_SECRET>". Fails closed when the secret is missing or weak. */
export function isAuthorizedCron(authHeader: string | null, secret = process.env.CRON_SECRET): boolean {
  if (!secret || secret.length < 16 || !authHeader) return false;
  return safeEqual(authHeader, `Bearer ${secret}`);
}
