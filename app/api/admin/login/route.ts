import { NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_COOKIE, SESSION_SECONDS, checkAdminPassword, createSessionToken } from "@/lib/admin/auth";
import { allowRequest, clientIp, readJsonLimited } from "@/lib/rateLimit";
import { getDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ password: z.string().min(1).max(200) });

/** Best-effort login trail for the admin to review in Mongo (adminAudit). Never blocks or leaks into the response. */
async function audit(ip: string, ok: boolean) {
  try {
    const db = await getDb();
    await db?.collection("adminAudit").insertOne({ event: "login", ok, ip, at: new Date() });
  } catch {
    // Auditing must not break login.
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  // Per-IP and a global ceiling (an attacker rotating IPs still cannot brute-force); both deny when the counter is unreachable.
  const allowed =
    (await allowRequest(`admin-login:${ip}`, 8, 900, { failClosed: true })) &&
    (await allowRequest("admin-login:all", 40, 900, { failClosed: true }));
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Wait a few minutes." }, { status: 429 });
  }

  const parsed = schema.safeParse(await readJsonLimited(request, 1024));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter your password" }, { status: 400 });
  }

  const passwordOk = await checkAdminPassword(parsed.data.password);
  await audit(ip, passwordOk);
  if (!passwordOk) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return res;
}
