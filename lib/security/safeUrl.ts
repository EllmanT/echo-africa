/**
 * SSRF guard for server-side fetches of URLs we did not write (for example sources cited by the article
 * researcher). A page that redirects to http://169.254.169.254/ or http://localhost:... must not be fetched.
 * Note: this checks the URL text; it does not resolve DNS, so it is a strong first line, not a full sandbox.
 */

const PRIVATE_V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^192\.0\.0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^198\.1[89]\./, /^2(2[4-9]|[3-5]\d)\./,
];

export function isPublicHttpUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan")) return false;
  if (host.includes(":")) return false; // IPv6 literals (loopback, link-local, ULA...) are never a research source.
  if (/^\d+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) return false; // Integer / hex IPv4 tricks.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return !PRIVATE_V4.some((re) => re.test(host));
  return host.includes(".");
}

/** Fetches text from a public URL, following at most `maxRedirects` redirects and re-checking every hop. Returns null when blocked or failed. */
export async function fetchPublicText(
  url: string,
  { timeoutMs = 6000, maxRedirects = 3, maxBytes = 1_500_000, headers = {} as Record<string, string> } = {}
): Promise<{ ok: boolean; text: string } | null> {
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!isPublicHttpUrl(current)) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(current, { signal: controller.signal, redirect: "manual", headers });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) return null;
        current = new URL(loc, current).toString();
        continue;
      }
      const text = (await res.text()).slice(0, maxBytes);
      return { ok: res.ok, text };
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}
