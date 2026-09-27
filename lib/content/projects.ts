import { getDb } from "@/lib/db/mongodb";
import { caseStudies as staticCaseStudies, type CaseStudy } from "@/data/case-studies";

function stripMongoFields(doc: Record<string, unknown>): CaseStudy {
  const { _id, createdAt, updatedAt, published, source, ...rest } = doc;
  void _id;
  void createdAt;
  void updatedAt;
  void published;
  void source;
  return rest as CaseStudy;
}

/**
 * The `projects` collection is authoritative once it has ANY documents (seeded
 * by scripts/seed.ts, or created in the admin). Until then, the static array
 * in data/case-studies.ts is the source, so the site never ships empty.
 */
export async function getPublishedProjects(): Promise<CaseStudy[]> {
  try {
    const db = await getDb();
    if (!db) return staticCaseStudies;
    const any = await db.collection("projects").countDocuments({});
    if (any === 0) return staticCaseStudies;
    const docs = await db
      .collection("projects")
      .find({ published: { $ne: false } })
      .sort({ order: 1 })
      .toArray();
    return docs.map(stripMongoFields);
  } catch {
    return staticCaseStudies;
  }
}

export async function getProjectBySlug(slug: string): Promise<CaseStudy | undefined> {
  const all = await getPublishedProjects();
  return all.find((p) => p.slug === slug);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const all = await getPublishedProjects();
  return all.map((p) => p.slug);
}

export function getNextProject(all: CaseStudy[], slug: string): CaseStudy {
  const index = all.findIndex((p) => p.slug === slug);
  return all[(index + 1) % all.length];
}

export function projectCategoryCounts(all: CaseStudy[]) {
  return {
    websites: all.filter((s) => s.category === "Website").length,
    brands: all.filter((s) => s.category === "Logo & Brand Identity").length,
  };
}
