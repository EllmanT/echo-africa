import { getDb } from "@/lib/db/mongodb";
import { isCloudflareIp } from "@/lib/security/cloudflare";

let indexReady = false;

type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();
const MEMORY_MAX_KEYS = 5000;

/** Per-instance counter. Costs no database operation, so a flood is cut off before it reaches Atlas. */
function memoryAllow(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  if (memory.size > MEMORY_MAX_KEYS) {
    memory.forEach((b, k) => {
      if (b.resetAt <= now) memory.delete(k);
    });
    // Still full of live keys (an attack with many sources): drop the oldest half rather than grow without bound.
    if (memory.size > MEMORY_MAX_KEYS) {
      Array.from(memory.keys())
        .slice(0, MEMORY_MAX_KEYS / 2)
        .forEach((k) => memory.delete(k));
    }
  }
  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export type RateLimitOptions = {
  /** Also count in Mongo so the limit holds across serverless instances. Off for cheap, low-risk routes. Default true. */
  shared?: boolean;
  /** When the shared counter cannot be reached, deny instead of allow. Use for login and other sensitive routes. */
  failClosed?: boolean;
};

/** Gives one slot back, for a request that failed before any real work was done (for example a mistyped website address). */
export async function releaseRequest(key: string, windowSeconds: number): Promise<void> {
  const bucket = memory.get(key);
  if (bucket && bucket.count > 0) bucket.count -= 1;
  try {
    const db = await getDb();
    const windowStart = Math.floor(Date.now() / (windowSeconds * 1000));
    await db?.collection("rateLimits").updateOne({ _id: `${key}:${windowStart}` as unknown as never, count: { $gt: 0 } }, { $inc: { count: -1 } });
  } catch {
    // Giving a slot back is a courtesy: if it fails, the visitor simply keeps the strict limit.
  }
}

/**
 * Two layers: an in-memory counter first (free), then a fixed-window counter in Mongo (TTL index cleans old windows).
 * Returns true when the request is allowed. If the database is unavailable, the in-memory limit still applies;
 * `failClosed` routes are denied outright.
 */
export async function allowRequest(
  key: string,
  limit: number,
  windowSeconds: number,
  { shared = true, failClosed = false }: RateLimitOptions = {}
): Promise<boolean> {
  // Instances see only part of the traffic, so the local gate is looser than the shared limit but still bounded.
  if (!memoryAllow(key, shared ? limit * 3 : limit, windowSeconds)) return false;
  if (!shared) return true;

  try {
    const db = await getDb();
    if (!db) return true;
    const col = db.collection("rateLimits");

    if (!indexReady) {
      await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      indexReady = true;
    }

    const windowStart = Math.floor(Date.now() / (windowSeconds * 1000));
    const res = await col.findOneAndUpdate(
      { _id: `${key}:${windowStart}` as unknown as never },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date((windowStart + 1) * windowSeconds * 1000 + 60_000) },
      },
      { upsert: true, returnDocument: "after" }
    );
    return (res?.count ?? 1) <= limit;
  } catch {
    return !failClosed;
  }
}

/**
 * Best guess at the real client IP. On Vercel the platform sets x-vercel-forwarded-for / overwrites
 * x-forwarded-for, so those are trusted first. A caller-supplied x-forwarded-for chain is only a last resort.
 * Behind Cloudflare, Vercel sees Cloudflare's address as the peer; the visitor is then in cf-connecting-ip,
 * which is believed ONLY when the peer really is a Cloudflare address (otherwise anyone could forge it).
 */
export function clientIp(headers: Headers): string {
  const peer = (
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown"
  ).trim();
  const viaCloudflare = headers.get("cf-connecting-ip")?.trim();
  const ip = viaCloudflare && isCloudflareIp(peer) ? viaCloudflare : peer;
  return ip.slice(0, 64) || "unknown";
}

/** Reads a JSON body but refuses anything larger than maxBytes (default 16 KB). Returns null on bad or oversized input. */
export async function readJsonLimited(request: Request, maxBytes = 16_384): Promise<unknown | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
