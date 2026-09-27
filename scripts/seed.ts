// One-time (idempotent) seed: copies the static data/*.ts content into MongoDB
// so the admin has something to edit from day one. Safe to re-run: it never
// overwrites a collection that already has documents in it.
//
// Run with: npm run seed

import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

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

import { caseStudies } from "../data/case-studies";
import { workFaqs, contactFaqs, projectFaqs } from "../data/faqs";
import { getAllPosts } from "../lib/playbook";
import { DEFAULT_PILLARS, DEFAULT_REGION_WEIGHTS } from "../lib/playbook/pillars";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "eka");
  const now = new Date();

  // Projects
  const projects = db.collection("projects");
  const projectCount = await projects.countDocuments({});
  if (projectCount === 0) {
    await projects.insertMany(
      caseStudies.map((s, i) => ({ ...s, order: i + 1, published: true, source: "seed", createdAt: now, updatedAt: now }))
    );
    console.log(`Seeded ${caseStudies.length} projects.`);
  } else {
    console.log(`Skipped projects: ${projectCount} already in the database.`);
  }

  // FAQs, per page
  const faqs = db.collection("faqs");
  const faqGroups: Array<{ page: string; items: typeof workFaqs }> = [
    { page: "work", items: workFaqs },
    { page: "contact", items: contactFaqs },
    { page: "project", items: projectFaqs },
  ];
  for (const group of faqGroups) {
    const existing = await faqs.countDocuments({ page: group.page });
    if (existing > 0) {
      console.log(`Skipped "${group.page}" FAQs: ${existing} already in the database.`);
      continue;
    }
    if (!group.items.length) continue;
    await faqs.insertMany(
      group.items.map((f, i) => ({ page: group.page, question: f.question, answer: f.answer, order: i + 1, published: true, createdAt: now }))
    );
    console.log(`Seeded ${group.items.length} FAQs for "${group.page}".`);
  }

  // Playbook posts
  const posts = db.collection("posts");
  const postCount = await posts.countDocuments({});
  if (postCount === 0) {
    const filePosts = getAllPosts();
    if (filePosts.length) {
      await posts.insertMany(filePosts.map((p) => ({ ...p, published: true, source: "seed", createdAt: now, updatedAt: now })));
    }
    console.log(`Seeded ${filePosts.length} posts.`);
  } else {
    console.log(`Skipped posts: ${postCount} already in the database.`);
  }

  // Content calendar (pillars + regional mix for the automated Playbook engine)
  const calendar = db.collection("contentCalendar");
  const calendarExists = await calendar.countDocuments({ _id: "content-calendar" as never });
  if (calendarExists === 0) {
    await calendar.insertOne({
      _id: "content-calendar" as never,
      pillars: DEFAULT_PILLARS,
      regionWeights: DEFAULT_REGION_WEIGHTS,
      updatedAt: now,
    });
    console.log("Seeded the content calendar (pillars and regional mix).");
  } else {
    console.log("Skipped content calendar: already in the database.");
  }

  await client.close();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
