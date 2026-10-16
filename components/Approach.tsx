"use client";

import { FaCompassDrafting, FaHandshakeAngle, FaMagnifyingGlass, FaRocket } from "react-icons/fa6";

import AutoAccordion, { type AccordionItem } from "./AutoAccordion";

const PHASES: AccordionItem[] = [
  {
    tone: "web",
    Icon: FaMagnifyingGlass,
    title: "Discovery & Strategy",
    body: "We learn your business, your goals, and your customers. No assumptions.",
    points: ["A short call about what you actually need", "A clear plan and a price you agree to up front"],
  },
  {
    tone: "ai",
    Icon: FaCompassDrafting,
    title: "Build & Review",
    body: "We build your solution and check in with you throughout. You see progress before it's finished.",
    points: ["Working previews you can open on your phone", "Your feedback shapes every round"],
  },
  {
    tone: "int",
    Icon: FaRocket,
    title: "Launch & Sign-Off",
    body: "We launch only when you're happy. Payment happens here, not before.",
    points: ["You approve the finished work", "Pay only once you love it"],
  },
  {
    tone: "soft",
    Icon: FaHandshakeAngle,
    title: "Support & Improvement",
    body: "We don't disappear after launch. We stay available, fix issues, and keep improving your site.",
    points: ["Fixes and changes when you need them", "Ideas to keep growing after day one"],
  },
];

const Approach = () => {
  return (
    <section className="w-full py-20">
      <h2 className="heading">
        The <span className="text-purple">Approach</span>
      </h2>
      <div className="mt-14 w-full md:mt-20">
        <AutoAccordion items={PHASES} />
      </div>
    </section>
  );
};

export default Approach;
