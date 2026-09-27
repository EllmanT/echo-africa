import { ObjectId } from "mongodb";

import { requireDb } from "@/lib/db/mongodb";
import { workFaqs, contactFaqs, projectFaqs, type Faq } from "@/data/faqs";
import type { FaqPage } from "@/lib/content/faqs";

export type AdminFaq = {
  _id: string;
  page: FaqPage;
  question: string;
  answer: string;
  order: number;
  published: boolean;
};

const STATIC_BY_PAGE: Record<FaqPage, Faq[]> = {
  work: workFaqs,
  contact: contactFaqs,
  project: projectFaqs,
  home: [],
};

/** Same footgun as projects: seed the page's full static set before any single write, so one add doesn't hide the rest. */
async function ensureSeeded(db: Awaited<ReturnType<typeof requireDb>>, page: FaqPage) {
  const any = await db.collection("faqs").countDocuments({ page });
  if (any > 0) return;
  const items = STATIC_BY_PAGE[page];
  if (!items.length) return;
  const now = new Date();
  await db
    .collection("faqs")
    .insertMany(items.map((f, i) => ({ page, question: f.question, answer: f.answer, order: i + 1, published: true, createdAt: now })));
}

export async function listAdminFaqs(page: FaqPage): Promise<AdminFaq[]> {
  const db = await requireDb();
  await ensureSeeded(db, page);
  const docs = await db.collection("faqs").find({ page }).sort({ order: 1 }).toArray();
  return docs.map((d) => ({
    _id: d._id.toString(),
    page: d.page,
    question: d.question,
    answer: d.answer,
    order: d.order ?? 0,
    published: d.published ?? true,
  }));
}

export async function createFaq(page: FaqPage, question: string, answer: string): Promise<string> {
  const db = await requireDb();
  await ensureSeeded(db, page);
  const count = await db.collection("faqs").countDocuments({ page });
  const res = await db
    .collection("faqs")
    .insertOne({ page, question, answer, order: count + 1, published: true, createdAt: new Date() });
  return res.insertedId.toString();
}

export async function updateFaq(
  id: string,
  patch: Partial<Pick<AdminFaq, "question" | "answer" | "published" | "order">>
): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("Invalid id");
  const db = await requireDb();
  await db.collection("faqs").updateOne({ _id: new ObjectId(id) }, { $set: { ...patch, updatedAt: new Date() } });
}

export async function deleteFaq(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("Invalid id");
  const db = await requireDb();
  await db.collection("faqs").deleteOne({ _id: new ObjectId(id) });
}

export async function reorderFaqs(ids: string[]): Promise<void> {
  const db = await requireDb();
  const col = db.collection("faqs");
  await Promise.all(
    ids.map((id, i) => (ObjectId.isValid(id) ? col.updateOne({ _id: new ObjectId(id) }, { $set: { order: i + 1 } }) : null))
  );
}
