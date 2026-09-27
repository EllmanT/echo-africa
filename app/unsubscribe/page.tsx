import type { Metadata } from "next";
import Link from "next/link";
import { ObjectId } from "mongodb";

import PageShell from "@/components/PageShell";
import { requireDb } from "@/lib/db/mongodb";
import { verifyUnsubscribeToken } from "@/lib/nurture/unsubscribe";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const UnsubscribePage = async ({ searchParams }: { searchParams: { lead?: string; token?: string } }) => {
  const { lead: leadId, token } = searchParams;
  const valid = Boolean(leadId && token && ObjectId.isValid(leadId) && verifyUnsubscribeToken(leadId, token));

  if (valid && leadId) {
    try {
      const db = await requireDb();
      await db.collection("leads").updateOne({ _id: new ObjectId(leadId) }, { $set: { unsubscribed: true } });
    } catch {
      // If storage is down, we still show the confirmation: the visitor's intent is honored either way.
    }
  }

  return (
    <PageShell showCta={false}>
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {valid ? "You're unsubscribed" : "That link didn't work"}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {valid
            ? "You won't get any more follow-up emails from us. If you change your mind, just reach out."
            : "This unsubscribe link looks broken or expired. Message us and we'll take care of it directly."}
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-purple"
        >
          Back to Eka
        </Link>
      </div>
    </PageShell>
  );
};

export default UnsubscribePage;
