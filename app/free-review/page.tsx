import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import FreeReview from "@/components/funnel/FreeReview";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Free Website and Automation Review",
  description:
    "Send your website address or a task your team does by hand. Get 3 specific fixes written for your business in about a minute. Free, no call, no card.",
  path: "/free-review",
  keywords: ["free website review Zimbabwe", "website audit Harare", "business automation ideas"],
});

const FreeReviewPage = () => (
  <PageShell>
    <section className="mx-auto max-w-3xl pb-10 pt-14 text-center md:pt-20">
      <div className="animate-rise">
        <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
          Get a free <span className="text-purple">review.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Tell us your website, or a task you do by hand. You get 3 specific fixes in about a minute. Free, no call, no card.
        </p>
      </div>
    </section>
    <section className="mx-auto max-w-2xl pb-20 md:pb-28">
      <FreeReview from="review-page" />
    </section>
  </PageShell>
);

export default FreeReviewPage;
