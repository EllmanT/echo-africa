"use client";

import RevealCards, { type RevealCard } from "@/components/RevealCards";

const CARDS: RevealCard[] = [
  {
    label: "Build first",
    title: "We build it first",
    des: "You see the finished work before you pay. Love it, pay. Do not, walk away.",
    bg: "bg-emerald-100",
    speed: 5.1,
  },
  {
    label: "Plain words",
    title: "Plain words",
    des: "No jargon and no fog. You always know what we are doing and why.",
    bg: "bg-pink-100",
    colors: [
      [255, 166, 158],
      [221, 255, 247],
    ],
    dotSize: 2,
  },
  {
    label: "Phone first",
    title: "Made for phones",
    des: "Most of your customers are on a phone with limited data. We build for that first.",
    bg: "bg-sky-100",
    colors: [[125, 211, 252]],
  },
];

const HowWeWork = () => <RevealCards cards={CARDS} interval={5000} />;

export default HowWeWork;
