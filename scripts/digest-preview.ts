// Sends the daily email for recent articles to ONE address, so you can see exactly what subscribers get.
// It never touches the subscriber list and does not record a delivery.
//
// Run with: npm run digest:preview -- you@example.com [days]
//   days: how many days back to include, counting today (default 2)

import fs from "node:fs";
import path from "node:path";

// Load .env.local by hand: this script runs outside Next's own env loading.
if (!process.env.MONGODB_URI) {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  }
}

import { getDb } from "../lib/db/mongodb";
import { ensureDigest, readSeconds } from "../lib/digest/generate";
import { harareDateString } from "../lib/digest/time";
import { digestEmail } from "../lib/email/digest-template";
import { sendMail } from "../lib/email/send";

async function main() {
  const to = process.argv[2];
  const days = Math.max(1, Number(process.argv[3] ?? 2));
  if (!to || !to.includes("@")) {
    console.error("Usage: npm run digest:preview -- you@example.com [days]");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) throw new Error("MONGODB_URI is not set");

  const since = harareDateString(new Date(Date.now() - (days - 1) * 86_400_000));
  const posts = await db.collection("posts").find({ published: { $ne: false }, date: { $gte: since } }).sort({ date: 1, createdAt: 1 }).toArray();
  if (posts.length === 0) {
    console.log(`No published articles since ${since}.`);
    process.exit(0);
  }

  // The unsubscribe link needs a real lead id. Use the one for this address if there is one.
  const lead = await db.collection("leads").findOne({ email: to.toLowerCase() });
  if (!lead) console.warn("No lead has this address, so the unsubscribe link in the preview will not work.");
  const leadId = lead ? String(lead._id) : "000000000000000000000000";

  for (const post of posts) {
    const digest = await ensureDigest({ slug: String(post.slug), title: String(post.title), description: String(post.description ?? ""), content: String(post.content ?? "") });
    const ok = await sendMail(digestEmail({ to, leadId, digest, slug: String(post.slug) }));
    console.log(`${ok ? "Sent" : "FAILED"}  ${post.date}  ~${readSeconds(digest)}s read  "${digest.subject}"  (${post.slug})`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
