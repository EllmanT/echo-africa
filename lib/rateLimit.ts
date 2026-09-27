import { getDb } from "@/lib/db/mongodb";

let indexReady = false;

/**
 * Fixed-window counter in Mongo (TTL index cleans old windows).
 * Returns true when the request is allowed. If the database is unavailable
 * we allow the request: better one extra submission than a lost lead.
 */
export async function allowRequest(key: string, limit: number, windowSeconds: number): Promise<boolean> {
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
    return true;
  }
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? headers.get("x-real-ip") ?? "unknown").trim();
}
