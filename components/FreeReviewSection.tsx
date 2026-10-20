"use client";

import { FaCheck } from "react-icons/fa6";

import Reveal from "@/components/Reveal";
import FreeReview from "@/components/funnel/FreeReview";

const POINTS = ["Three specific fixes for your business, not generic tips", "Ready in about 20 seconds, and a copy lands in your inbox", "Yours to keep, whether or not we ever work together"];

/** The soft offer for visitors who are not ready for the full form. */
const FreeReviewSection = ({ from = "home" }: { from?: string }) => (
  <section id="free-review" aria-labelledby="free-review-heading" className="relative py-16 md:py-24">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
      <Reveal>
        <div>
          <h2 id="free-review-heading" className="heading !text-left">
            Find out what is costing you customers.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Send us your website, or a task your team does by hand. In about 20 seconds you get the three fixes most likely to bring in more customers or save you money.
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
