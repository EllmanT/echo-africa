import { getDb } from "@/lib/db/mongodb";

export type JobRun = {
  _id: string;
  slot: string;
  status: "running" | "published" | "needs-review" | "failed" | "ok";
  pillar?: string;
  region?: string;
  postSlug?: string;
  reasons?: string[];
  flags?: string[];
  error?: string;
  /** Real cost of this run in USD, from the API usage numbers. */
  costUsd?: number;
  searches?: number;
  startedAt: Date;
  finishedAt?: Date;
};

export async function listJobRuns(limit = 30): Promise<JobRun[]> {
  const db = await getDb();
  if (!db) return [];
  const docs = await db.collection("jobRuns").find({}).sort({ startedAt: -1 }).limit(limit).toArray();
  return docs.map((d) => ({ ...(d as unknown as JobRun), _id: d._id.toString() }));
}

/** The job-run slot used by the hourly nurture sweep. It shares the jobRuns collection but is not an article. */
export const NURTURE_SLOT = "nurture";

/** Start of "today" in Africa/Harare (fixed UTC+2, no DST), as a UTC instant. */
export function startOfHarareDayUtc(now = new Date()): Date {
  const harareNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const startOfDayHarare = Date.UTC(harareNow.getUTCFullYear(), harareNow.getUTCMonth(), harareNow.getUTCDate());
  return new Date(startOfDayHarare - 2 * 60 * 60 * 1000);
}

/**
 * Mongo filter for "an article was published since `since`". It excludes nurture runs: those used to be logged
 * as "published" too, so counting them made the daily cap look reached all day and silently blocked every article.
 */
export function publishedArticleFilter(since: Date) {
  return { status: "published", slot: { $ne: NURTURE_SLOT }, startedAt: { $gte: since } };
}

/** How many articles were actually published today (Africa/Harare). */
export async function countPublishedToday(now = new Date()): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  return db.collection("jobRuns").countDocuments(publishedArticleFilter(startOfHarareDayUtc(now)));
}

/** The most recent article run (any outcome), for the admin dashboard. */
export async function lastArticleRun(): Promise<JobRun | null> {
  const db = await getDb();
  if (!db) return null;
  const doc = await db.collection("jobRuns").find({ slot: { $ne: NURTURE_SLOT } }).sort({ startedAt: -1 }).limit(1).next();
  return doc ? { ...(doc as unknown as JobRun), _id: doc._id.toString() } : null;
}
