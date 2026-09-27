import { ObjectId } from "mongodb";

import { requireDb } from "@/lib/db/mongodb";
import { pickSlotContext } from "./calendar";
import { runResearch } from "./research";
import { writeArticle } from "./write";
import { runGuardrails } from "./guardrails";
import { pickCoverImage } from "./images";

export type GenerateResult = {
  status: "published" | "draft" | "failed";
  slug?: string;
  reasons?: string[];
  flags?: string[];
  error?: string;
  jobRunId: string;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string, db: Awaited<ReturnType<typeof requireDb>>): Promise<string> {
  let slug = base || `post-${Date.now()}`;
  let suffix = 2;
  const posts = db.collection("posts");
  while (await posts.countDocuments({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

/**
 * Runs one full pipeline pass: pick a topic, research it with live web
 * search, write it, run guardrails, pick a cover image, and save the result.
 * A guardrail failure never throws: it saves the post unpublished with the
 * reasons attached, so nothing bad-but-generated is silently lost, and
 * nothing bad silently goes live either.
 */
export async function generateArticle(slot: string): Promise<GenerateResult> {
  const db = await requireDb();
  const jobRuns = db.collection("jobRuns");
  const startedAt = new Date();
  const jobRunId = (await jobRuns.insertOne({ slot, status: "running", startedAt })).insertedId.toString();

  const fail = async (error: string): Promise<GenerateResult> => {
    await jobRuns.updateOne(
      { _id: new ObjectId(jobRunId) },
      { $set: { status: "failed", error, finishedAt: new Date() } }
    );
    return { status: "failed", error, jobRunId };
  };

  try {
    const recentPosts = await db
      .collection("posts")
      .find({}, { projection: { title: 1, pillar: 1, coverImage: 1 } })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray();
    const recentTitles = recentPosts.map((p) => p.title as string).filter(Boolean);
    const lastPillarKey = recentPosts[0]?.pillar as string | undefined;
    const recentImages = recentPosts
      .slice(0, 4)
      .map((p) => p.coverImage as string)
      .filter(Boolean);

    const { pillar, region } = await pickSlotContext(lastPillarKey);
    await jobRuns.updateOne({ _id: new ObjectId(jobRunId) }, { $set: { pillar: pillar.key, region } });

    let researchResult;
    try {
      researchResult = await runResearch(pillar, region, recentTitles);
    } catch (error) {
      return fail(`Research step failed: ${error instanceof Error ? error.message : error}`);
    }

    let draft;
    try {
      draft = await writeArticle(pillar, region, researchResult);
    } catch (error) {
      return fail(`Writing step failed: ${error instanceof Error ? error.message : error}`);
    }

    const guardrailResult = await runGuardrails(draft, researchResult.sourceUrls, recentTitles);
    const published = guardrailResult.reasons.length === 0;

    const slug = await uniqueSlug(slugify(draft.title), db);
    const coverImage = pickCoverImage(pillar.key, recentImages);
    const now = new Date();

    await db.collection("posts").updateOne(
      { slug },
      {
        $set: {
          slug,
          title: draft.title,
          description: draft.description,
          date: now.toISOString().slice(0, 10),
          tags: draft.tags,
          coverImage,
          content: draft.content,
          published,
          source: "generated",
          pillar: pillar.key,
          region,
          claims: draft.claims,
          draftReason: published ? undefined : guardrailResult.reasons,
          flags: guardrailResult.flags,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    await jobRuns.updateOne(
      { _id: new ObjectId(jobRunId) },
      {
        $set: {
          status: published ? "published" : "needs-review",
          postSlug: slug,
          reasons: guardrailResult.reasons,
          flags: guardrailResult.flags,
          finishedAt: new Date(),
        },
      }
    );

    return { status: published ? "published" : "draft", slug, reasons: guardrailResult.reasons, flags: guardrailResult.flags, jobRunId };
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}
