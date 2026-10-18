/**
 * Cloudflare Turnstile server-side check. A token proves a real browser passed the challenge for a given
 * action on one of our hostnames. Tokens are single use and expire after about five minutes.
 *
 * Env:
 *   TURNSTILE_SECRET_KEY   secret key (also accepted as TURNSTILE_SECRET). Unset = checks are skipped (dev, previews).
 *   TURNSTILE_HOSTNAMES    comma list of hostnames a token may come from. Default: www.eka.dev,eka.dev
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY   public key used by the widget in the browser.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
/** Cloudflare's documented always-pass / always-fail test secrets start with 1x / 2x / 3x followed by zeros. */
const TEST_SECRET = /^[123]x0{10,}/;

export type TurnstileResult = { ok: boolean; reason?: string };

export function turnstileSecret(): string {
  return process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET || "";
}

export function turnstileEnabled(): boolean {
  return Boolean(turnstileSecret());
}

type VerifyOptions = {
  /** The widget's data-action for this surface, for example "lead" or "review". */
  action: string;
  ip?: string;
  /** If Cloudflare itself cannot be reached, let the request through (use for lead capture, never for paid AI). */
  failOpen?: boolean;
  fetchImpl?: typeof fetch;
};

export async function verifyTurnstile(token: string | undefined, opts: VerifyOptions): Promise<TurnstileResult> {
  const secret = turnstileSecret();
  if (!secret) return { ok: true, reason: "disabled" };
  if (!token || token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: "missing-token" };

  const unreachable: TurnstileResult = opts.failOpen ? { ok: true, reason: "unreachable" } : { ok: false, reason: "unreachable" };
  const body = new URLSearchParams({ secret, response: token });
  if (opts.ip && opts.ip !== "unknown") body.set("remoteip", opts.ip);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await (opts.fetchImpl ?? fetch)(VERIFY_URL, { method: "POST", body, signal: controller.signal });
    if (!res.ok) return unreachable;
    const data = (await res.json()) as { success?: boolean; action?: string; hostname?: string; "error-codes"?: string[] };
    if (!data.success) return { ok: false, reason: (data["error-codes"] ?? []).join(",") || "rejected" };
    if (data.action && data.action !== opts.action) return { ok: false, reason: "wrong-action" };
    if (!TEST_SECRET.test(secret)) {
      const allowed = (process.env.TURNSTILE_HOSTNAMES ?? "www.eka.dev,eka.dev").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
      if (!data.hostname || !allowed.includes(data.hostname.toLowerCase())) return { ok: false, reason: "wrong-hostname" };
    }
    return { ok: true };
  } catch {
    return unreachable;
  } finally {
    clearTimeout(timer);
  }
}
