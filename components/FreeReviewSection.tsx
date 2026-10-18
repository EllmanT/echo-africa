"use client";

import { FaCheck } from "react-icons/fa6";

import Reveal from "@/components/Reveal";
import FreeReview from "@/components/funnel/FreeReview";

const POINTS = ["3 specific fixes, not generic tips", "Written for your business in about a minute", "Yours to keep, even if we never work together"];

/** The soft offer for visitors who are not ready for the full form. */
const FreeReviewSection = ({ from = "home" }: { from?: string }) => (
  <section id="free-review" aria-labelledby="free-review-heading" className="relative py-16 md:py-24">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
      <Reveal>
        <div>
          <p className="text-sm font-extrabold tracking-[0.14em] text-purple">FREE, NO CALL</p>
          <h2 id="free-review-heading" className="heading mt-3 text-left">
            Not ready for the form? Get a free review.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Give us your website, or a task your team does by hand. We tell you exactly what to fix first.
          </p>
          <ul className="mt-7 grid gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-base font-semibold leading-snug">
                <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple text-white">
                  <FaCheck size={11} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <FreeReview from={from} className="relative" />
      </Reveal>
    </div>
  </section>
);

export default FreeReviewSection;
