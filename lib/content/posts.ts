import { getDb } from "@/lib/db/mongodb";
import { getAllPosts as getFilePosts, getPostBySlug as getFilePostBySlug, type BlogPost } from "@/lib/playbook";

function toPost(doc: Record<string, unknown>): BlogPost {
  return {
    slug: doc.slug as string,
    title: doc.title as string,
    description: doc.description as string,
    date: doc.date as string,
    updated: doc.updated as string | undefined,
    tags: (doc.tags as string[] | undefined) ?? [],
    coverImage: doc.coverImage as string | undefined,
    content: doc.content as string,
  };
}

/** Same DB-authoritative-once-seeded rule as projects and faqs. */
export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  try {
    const db = await getDb();
    if (!db) return getFilePosts();
    const any = await db.collection("posts").countDocuments({});
    if (any === 0) return getFilePosts();
    const docs = await db
      .collection("posts")
      .find({ published: { $ne: false } })
      .sort({ date: -1 })
      .toArray();
    return docs.map(toPost);
  } catch {
    return getFilePosts();
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const db = await getDb();
    if (db) {
      const any = await db.collection("posts").countDocuments({});
      if (any > 0) {
        const doc = await db.collection("posts").findOne({ slug, published: { $ne: false } });
        return doc ? toPost(doc) : null;
      }
    }
  } catch {
    // Fall through to the file-based post below.
  }
  return getFilePostBySlug(slug) ?? null;
}
