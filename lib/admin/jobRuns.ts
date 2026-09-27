import { getDb } from "@/lib/db/mongodb";

export type JobRun = {
  _id: string;
  slot: string;
  status: "running" | "published" | "needs-review" | "failed";
  pillar?: string;
  region?: string;
  postSlug?: string;
  reasons?: string[];
  flags?: string[];
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
};

export async function listJobRuns(limit = 30): Promise<JobRun[]> {
  const db = await getDb();
  if (!db) return [];
  const docs = await db.collection("jobRuns").find({}).sort({ startedAt: -1 }).limit(limit).toArray();
  return docs.map((d) => ({ ...(d as unknown as JobRun), _id: d._id.toString() }));
}

/** How many articles were actually published today (Africa/Harare has no DST, fixed UTC+2). */
export async function countPublishedToday(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const harareNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const startOfDayHarare = new Date(Date.UTC(harareNow.getUTCFullYear(), harareNow.getUTCMonth(), harareNow.getUTCDate()));
  const startUtc = new Date(startOfDayHarare.getTime() - 2 * 60 * 60 * 1000);
  return db.collection("jobRuns").countDocuments({ status: "published", startedAt: { $gte: startUtc } });
}
