import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const ADMIN_COOKIE = "eka_admin";
const ALG = "HS256";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

/** Signs a 30 day admin session token. Edge-safe (jose only). */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

/** Verifies a session token. Never throws. Edge-safe. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

/**
 * Compares a plaintext password against ADMIN_PASSWORD_HASH_B64. Node runtime
 * only (bcrypt). The hash is stored base64-encoded because a plain
 * "$2a$10$..." value gets corrupted by Next's env loader, which treats bare
 * `$` sequences in .env.local as variable expansions.
 */
export async function checkAdminPassword(password: string): Promise<boolean> {
  const encoded = process.env.ADMIN_PASSWORD_HASH_B64;
  if (!encoded) return false;
  const hash = Buffer.from(encoded, "base64").toString("utf8");
  return bcrypt.compare(password, hash);
}
