import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createFaq, listAdminFaqs } from "@/lib/admin/faqs";
import type { FaqPage } from "@/lib/content/faqs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGES: FaqPage[] = ["work", "contact", "project", "home"];
const REVALIDATE: Record<FaqPage, string> = { work: "/work", contact: "/contact", project: "/work/[slug]", home: "/" };

const createSchema = z.object({
  page: z.enum(["work", "contact", "project", "home"]),
  question: z.string().min(3).max(200),
  answer: z.string().min(3).max(2000),
});

export async function GET(request: Request) {
  const page = new URL(request.url).searchParams.get("page") as FaqPage | null;
  if (!page || !PAGES.includes(page)) {
    return NextResponse.json({ ok: false, error: "Unknown page" }, { status: 400 });
  }
  const faqs = await listAdminFaqs(page);
  return NextResponse.json({ ok: true, faqs });
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Fill in both fields" }, { status: 400 });
  const id = await createFaq(parsed.data.page, parsed.data.question, parsed.data.answer);
  revalidatePath(REVALIDATE[parsed.data.page], parsed.data.page === "project" ? "page" : undefined);
  return NextResponse.json({ ok: true, id });
}
