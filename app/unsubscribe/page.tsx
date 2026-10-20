import type { Metadata } from "next";
import Link from "next/link";
import { ObjectId } from "mongodb";

import PageShell from "@/components/PageShell";
import { verifyUnsubscribeToken } from "@/lib/nurture/unsubscribe";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ lead?: string; token?: string; done?: string }> };

const UnsubscribePage = async ({ searchParams }: Props) => {
  const { lead: leadId, token, done } = await searchParams;
  const valid = Boolean(leadId && token && ObjectId.isValid(leadId) && verifyUnsubscribeToken(leadId, token));
  const state = done === "1" ? "done" : valid ? "confirm" : "invalid";

  const heading = { done: "You're unsubscribed", confirm: "Unsubscribe from our emails?", invalid: "That link didn't work" }[state];
  const body = {
    done: "You won't get any more emails from us, including the daily tips. If you change your mind, just reach out.",
    confirm: "Press the button and we'll stop the daily tips and follow-up emails straight away.",
    invalid: "This unsubscribe link looks broken or expired. Message us and we'll take care of it directly.",
  }[state];

  return (
    <PageShell showCta={false}>
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{heading}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
        {state === "confirm" && leadId && token && (
          <form method="post" action="/api/unsubscribe" className="mt-8">
            <input type="hidden" name="lead" value={leadId} />
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-purple"
            >
              Yes, unsubscribe me
            </button>
          </form>
        )}
        <Link
          href="/contact"
          className="mt-8 inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-foreground/70 transition-colors hover:text-purple"
        >
          Back to Eka
        </Link>
      </div>
    </PageShell>
  );
};

export default UnsubscribePage;
