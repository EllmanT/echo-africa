import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

const PUBLIC_ADMIN_ROUTES = new Set(["/admin/login", "/api/admin/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_ROUTES.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);
  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
