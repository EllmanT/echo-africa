import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** True when the browser says the request came from another site. Requests with no Origin (curl, same-origin GET) pass. */
export function isCrossSite(origin: string | null, host: string | null): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

/**
 * Per-route admin check. Middleware also guards /api/admin, but middleware alone is a single point of
 * failure (see CVE-2025-29927), so every handler re-verifies the session and rejects cross-site writes.
 * Returns a response to send back, or null when the caller may proceed.
 */
export async function requireAdmin(method = "GET"): Promise<NextResponse | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!SAFE_METHODS.has(method)) {
    const h = await headers();
    if (isCrossSite(h.get("origin"), h.get("host"))) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  }
  return null;
}
