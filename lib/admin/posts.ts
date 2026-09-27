import { requireDb } from "@/lib/db/mongodb";
import { getAllPosts as getFilePosts } from "@/lib/playbook";

export type AdminPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  coverImage?: string;
  content: string;
  published: boolean;
  source: "seed" | "manual" | "generated";
};

/** Same seed-before-write guard as projects and faqs. */
async function ensureSeeded(db: Awaited<ReturnType<typeof requireDb>>) {
  const any = await db.collection("posts").countDocuments({});
  if (any > 0) return;
  const filePosts = getFilePosts();
  if (!filePosts.length) return;
  const now = new Date();
  await db
    .collection("posts")
    .insertMany(filePosts.map((p) => ({ ...p, published: true, source: "seed", createdAt: now, updatedAt: now })));
}

export async function listAdminPosts(): Promise<AdminPost[]> {
  const db = await requireDb();
  await ensureSeeded(db);
  const docs = await db.collection("posts").find({}).sort({ date: -1 }).toArray();
  return docs.map((d) => {
    const { _id, createdAt, updatedAt, ...rest } = d;
    void _id;
    void createdAt;
    void updatedAt;
    return { published: true, source: "manual", ...(rest as Omit<AdminPost, "published" | "source">) } as AdminPost;
  });
}

export async function getAdminPost(slug: string): Promise<AdminPost | null> {
  const all = await listAdminPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function upsertAdminPost(slug: string, doc: Partial<AdminPost>): Promise<void> {
  const db = await requireDb();
  await ensureSeeded(db);
  await db
    .collection("posts")
    .updateOne({ slug }, { $set: { ...doc, slug, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
}

export async function deleteAdminPost(slug: string): Promise<void> {
  const db = await requireDb();
  await ensureSeeded(db);
  await db.collection("posts").deleteOne({ slug });
}
