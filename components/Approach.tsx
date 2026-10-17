"use client";

import RevealCards, { type RevealCard } from "./RevealCards";

const PHASES: RevealCard[] = [
  {
    label: "Phase 1",
    title: "Discovery & Strategy",
    des: "We learn your business, your goals, and your customers. No assumptions.",
    bg: "bg-emerald-100",
    speed: 5.1,
  },
  {
    label: "Phase 2",
    title: "Build & Review",
    des: "We build your solution and check in with you throughout. You see progress before it's finished.",
    bg: "bg-pink-100",
    colors: [
      [255, 166, 158],
      [221, 255, 247],
    ],
    dotSize: 2,
  },
  {
    label: "Phase 3",
    title: "Launch & Sign-Off",
    des: "We launch only when you're happy. Payment happens here, not before.",
    bg: "bg-sky-100",
    colors: [[125, 211, 252]],
  },
  {
    label: "Phase 4",
    title: "Support & Improvement",
    des: "We don't disappear after launch. We stay available, fix issues, and keep improving your site.",
    bg: "bg-violet-100",
    colors: [[125, 211, 252]],
  },
];

const Approach = () => (
  <section className="w-full py-20">
    <h2 className="heading">
      The <span className="text-purple">Approach</span>
    </h2>
    <div className="my-20 w-full">
      <RevealCards cards={PHASES} />
    </div>
  </section>
);

export default Approach;
