import { getDb } from "@/lib/db/mongodb";
import { workFaqs, contactFaqs, projectFaqs, type Faq } from "@/data/faqs";

export type FaqPage = "work" | "contact" | "project" | "home";

const FALLBACK: Record<FaqPage, Faq[]> = {
  work: workFaqs,
  contact: contactFaqs,
  project: projectFaqs,
  home: [],
};

/** Same DB-authoritative-once-seeded rule as projects and posts, scoped per page. */
export async function getFaqsForPage(page: FaqPage): Promise<Faq[]> {
  try {
    const db = await getDb();
    if (!db) return FALLBACK[page];
    const any = await db.collection("faqs").countDocuments({ page });
    if (any === 0) return FALLBACK[page];
    const docs = await db
      .collection("faqs")
      .find({ page, published: { $ne: false } })
      .sort({ order: 1 })
      .toArray();
    return docs.map((d) => ({ question: d.question as string, answer: d.answer as string }));
  } catch {
    return FALLBACK[page];
  }
}
