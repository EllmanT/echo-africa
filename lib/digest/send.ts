import { getAdminSettings } from "@/lib/admin/settings";
import { getDb } from "@/lib/db/mongodb";
import { digestEmail } from "@/lib/email/digest-template";
import { sendMail } from "@/lib/email/send";
import { allowRequest } from "@/lib/rateLimit";
import { harareDateString, inSendWindow } from "./time";
import { ensureDigest, type DigestSource } from "./generate";

/** Most emails one run sends. The job runs hourly, so a bigger list simply takes a few runs, inside Gmail's limits. */
export const PER_RUN_LIMIT = 60;
const CONCURRENCY = 3;
const LEASE_MS = 10 * 60 * 1000;
/** A bad address is tried twice at most, then left alone. */
const MAX_ATTEMPTS = 2;

export type DigestRunResult = {
  status: "sent" | "nothing-to-send" | "skipped" | "failed";
  reason?: string;
  slug?: string;
  subject?: string;
  sent: number;
  failed: number;
  remaining: number;
  subscribers: number;
  costUsd?: number;
};

export type Subscriber = { leadId: string; email: string };

/** One recipient per email address (a person may have filled in two forms), keeping the oldest record. Pure, so it is tested. */
export function uniqueByEmail(rows: { _id: { toString(): string }; email?: string }[]): Subscriber[] {
  const seen = new Set<string>();
  const out: Subscriber[] = [];
  for (const row of rows) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push({ leadId: row._id.toString(), email });
  }
  return out;
}

/** The subscribers still owed this article: everyone subscribed, not unsubscribed, not already delivered or given up on. */
export async function pendingSubscribers(slug: string): Promise<{ pending: Subscriber[]; total: number }> {
  const db = await getDb();
  if (!db) return { pending: [], total: 0 };
  const leads = await db
    .collection("leads")
    .find({ digestSubscribedAt: { $exists: true }, unsubscribed: { $ne: true }, email: { $exists: true, $ne: "" } })
    .sort({ createdAt: 1 })
    .project({ email: 1 })
    .toArray();
  // An address that opted out on any record is out everywhere.
  const optedOut = new Set(
    (await db.collection("leads").find({ unsubscribed: true }).project({ email: 1 }).toArray()).map((l) => String(l.email ?? "").toLowerCase())
  );
  const everyone = uniqueByEmail(leads as unknown as Parameters<typeof uniqueByEmail>[0]).filter((s) => !optedOut.has(s.email));
  const done = await db
    .collection("digestDeliveries")
    .find({ slug, $or: [{ ok: true }, { attempts: { $gte: MAX_ATTEMPTS } }] })
    .project({ email: 1 })
    .toArray();
  const delivered = new Set(done.map((d) => String(d.email)));
  return { pending: everyone.filter((s) => !delivered.has(s.email)), total: everyone.length };
}

/** The newest published article from today (Harare), or null. */
export async function todaysArticle(now: Date): Promise<DigestSource | null> {
  const db = await getDb();
  if (!db) return null;
  const doc = await db.collection("posts").find({ published: { $ne: false }, date: harareDateString(now) }).sort({ createdAt: -1 }).limit(1).next();
  if (!doc) return null;
  return { slug: String(doc.slug), title: String(doc.title), description: String(doc.description ?? ""), content: String(doc.content ?? "") };
}

/** Sends one subscriber their email. The delivery is claimed first, so overlapping runs can never double-send. */
async function deliver(src: DigestSource, digest: Awaited<ReturnType<typeof ensureDigest>>, sub: Subscriber): Promise<boolean | null> {
  const db = await getDb();
  const col = db?.collection("digestDeliveries");
  if (!col) return null;
  const _id = `${src.slug}:${sub.email}`;
  try {
    // Matches only a fresh record, or a failed one that is retryable and not being sent right now (a ten minute lease
    // covers the send itself). Anything else collides on _id and is skipped, so overlapping runs cannot double-send.
    const now = new Date();
    await col.updateOne(
      { _id: _id as never, ok: { $ne: true }, attempts: { $lt: MAX_ATTEMPTS }, $or: [{ lockUntil: { $exists: false } }, { lockUntil: { $lt: now } }] },
      {
        $inc: { attempts: 1 },
        $set: { lockUntil: new Date(now.getTime() + LEASE_MS) },
        $setOnInsert: { slug: src.slug, email: sub.email, leadId: sub.leadId, createdAt: now },
      },
      { upsert: true }
    );
  } catch {
    return null; // Already delivered, given up on, or being sent by another run.
  }
  const ok = await sendMail(digestEmail({ to: sub.email, leadId: sub.leadId, digest, slug: src.slug }));
  await col.updateOne({ _id: _id as never }, { $set: { ok, at: new Date(), lockUntil: new Date(0) } });
  return ok;
}

/**
 * One pass of the daily email. Safe to call as often as the schedule likes: it waits for the configured hour and for
 * today's article, writes the short version once, then sends to whoever has not had it yet, a batch at a time.
 */
export async function runDigest(now = new Date()): Promise<DigestRunResult> {
  const empty = { sent: 0, failed: 0, remaining: 0, subscribers: 0 };
  const settings = await getAdminSettings();
  if (!settings.digestEnabled) return { status: "skipped", reason: "The daily email is switched off", ...empty };
  if (!inSendWindow(now, settings.digestHour)) return { status: "skipped", reason: `Outside the send window (from ${settings.digestHour}:00 to 20:00 Harare)`, ...empty };

  const article = await todaysArticle(now);
  if (!article) return { status: "skipped", reason: "No article published today yet", ...empty };

  const { pending, total } = await pendingSubscribers(article.slug);
  if (pending.length === 0) return { status: "nothing-to-send", slug: article.slug, ...empty, subscribers: total };

  let digest;
  try {
    digest = await ensureDigest(article);
  } catch (error) {
    return { status: "failed", reason: `Could not write the email: ${error instanceof Error ? error.message : error}`, slug: article.slug, ...empty, remaining: pending.length, subscribers: total };
  }

  let sent = 0;
  let failed = 0;
  const batch = pending.slice(0, PER_RUN_LIMIT);
  let next = 0;
  let capHit = false;
  const worker = async () => {
    while (next < batch.length && !capHit) {
      const sub = batch[next++];
      // Gmail's own daily limit would also stop the lead alerts, so the digest has its own ceiling.
      if (!(await allowRequest("mail:digest", settings.digestDailyCap, 86400))) {
        capHit = true;
        return;
      }
      const ok = await deliver(article, digest, sub);
      if (ok === true) sent++;
      else if (ok === false) failed++;
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  return {
    status: "sent",
    reason: capHit ? "Daily sending ceiling reached, the rest goes tomorrow's quota" : undefined,
    slug: article.slug,
    subject: digest.subject,
    sent,
    failed,
    remaining: Math.max(0, pending.length - sent - failed),
    subscribers: total,
  };
}
