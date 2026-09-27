import { NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_COOKIE, checkAdminPassword, createSessionToken } from "@/lib/admin/auth";
import { allowRequest, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ password: z.string().min(1) });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  if (!(await allowRequest(`admin-login:${ip}`, 8, 900))) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Wait a few minutes." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter your password" }, { status: 400 });
  }

  if (!(await checkAdminPassword(parsed.data.password))) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
