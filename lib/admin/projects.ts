import { requireDb } from "@/lib/db/mongodb";
import { caseStudies as staticCaseStudies, type CaseStudy } from "@/data/case-studies";

export type AdminProject = CaseStudy & { published: boolean; order: number };

/**
 * The public site treats the `projects` collection as authoritative the
 * moment it has ANY document (see lib/content/projects.ts). That means a
 * single admin write into an empty collection would hide every other static
 * project instead of just adding one. Guard against that by seeding the full
 * static set first, exactly once, before any admin write touches the
 * collection.
 */
async function ensureSeeded(db: Awaited<ReturnType<typeof requireDb>>) {
  const any = await db.collection("projects").countDocuments({});
  if (any > 0) return;
  const now = new Date();
  const docs = staticCaseStudies.map((s, i) => ({
    ...s,
    order: i + 1,
    published: true,
    source: "seed",
    createdAt: now,
    updatedAt: now,
  }));
  if (docs.length) await db.collection("projects").insertMany(docs);
}

export async function listAdminProjects(): Promise<AdminProject[]> {
  const db = await requireDb();
  await ensureSeeded(db);
  const docs = await db.collection("projects").find({}).sort({ order: 1 }).toArray();
  return docs.map((d) => {
    const { _id, createdAt, updatedAt, source, ...rest } = d;
    void _id;
    void createdAt;
    void updatedAt;
    void source;
    return { published: true, order: 0, ...rest } as AdminProject;
  });
}

export async function getAdminProject(slug: string): Promise<AdminProject | null> {
  const all = await listAdminProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function upsertAdminProject(slug: string, doc: Partial<AdminProject>): Promise<void> {
  const db = await requireDb();
  await ensureSeeded(db);
  const col = db.collection("projects");

  // $set never includes `order` unless the caller explicitly set one, so an
  // edit to an existing project cannot accidentally reset its position.
  const { order: explicitOrder, ...fields } = doc;
  const setFields: Record<string, unknown> = { ...fields, slug, updatedAt: new Date() };
  const setOnInsert: Record<string, unknown> = { createdAt: new Date() };
  if (explicitOrder === undefined) {
    setOnInsert.order = (await col.countDocuments({})) + 1;
  } else {
    setFields.order = explicitOrder;
  }

  await col.updateOne({ slug }, { $set: setFields, $setOnInsert: setOnInsert }, { upsert: true });
}

export async function deleteAdminProject(slug: string): Promise<void> {
  const db = await requireDb();
  await ensureSeeded(db);
  await db.collection("projects").deleteOne({ slug });
}

export async function reorderAdminProjects(slugsInOrder: string[]): Promise<void> {
  const db = await requireDb();
  await ensureSeeded(db);
  const col = db.collection("projects");
  await Promise.all(slugsInOrder.map((slug, i) => col.updateOne({ slug }, { $set: { order: i + 1 } })));
}
