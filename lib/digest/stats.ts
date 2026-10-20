import { getDb } from "@/lib/db/mongodb";
import { harareDateString } from "./time";

export type DigestStats = {
  subscribers: number;
  unsubscribed: number;
  sentToday: number;
  lastSubject: string | null;
  lastSlug: string | null;
};

/** What the daily email has done, for the admin dashboard. Subscribers are counted once per address. */
export async function digestStats(now = new Date()): Promise<DigestStats> {
  const db = await getDb();
  if (!db) return { subscribers: 0, unsubscribed: 0, sentToday: 0, lastSubject: null, lastSlug: null };
  const today = harareDateString(now);
  const [subscriberEmails, unsubscribedEmails, post] = await Promise.all([
    db.collection("leads").distinct("email", { digestSubscribedAt: { $exists: true }, unsubscribed: { $ne: true }, email: { $exists: true, $ne: "" } }),
    db.collection("leads").distinct("email", { unsubscribed: true }),
    db.collection("posts").find({ published: { $ne: false }, date: today }).sort({ createdAt: -1 }).limit(1).next(),
  ]);
  const opted = new Set(unsubscribedEmails.map((e) => String(e).toLowerCase()));
  const sentToday = post ? await db.collection("digestDeliveries").countDocuments({ slug: post.slug, ok: true }) : 0;
  const digest = post ? await db.collection("digests").findOne({ _id: post.slug as never }) : null;
  return {
    subscribers: new Set(subscriberEmails.map((e) => String(e).toLowerCase()).filter((e) => !opted.has(e))).size,
    unsubscribed: opted.size,
    sentToday,
    lastSubject: (digest?.digest as { subject?: string } | undefined)?.subject ?? null,
    lastSlug: post ? String(post.slug) : null,
  };
}
