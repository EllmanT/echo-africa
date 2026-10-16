"use client";

import { FaComments, FaMobileScreenButton, FaShieldHalved } from "react-icons/fa6";

import AutoAccordion, { type AccordionItem } from "@/components/AutoAccordion";

const ITEMS: AccordionItem[] = [
  {
    tone: "ai",
    Icon: FaShieldHalved,
    title: "We build it first",
    body: "You see the finished work before you pay. Love it, pay. Do not, walk away.",
    points: ["No deposit and no invoice up front", "You approve the result, then we talk price"],
  },
  {
    tone: "int",
    Icon: FaComments,
    title: "Plain words",
    body: "No jargon and no fog. You always know what we are doing and why.",
    points: ["Quick answers on WhatsApp", "Every step explained in simple English"],
  },
  {
    tone: "soft",
    Icon: FaMobileScreenButton,
    title: "Made for phones",
    body: "Most of your customers are on a phone with limited data. We build for that first.",
    points: ["Pages that load fast on mobile data", "Tested on real phones, not just a desktop"],
  },
];

const HowWeWork = () => <AutoAccordion items={ITEMS} interval={5600} className="lg:h-[24rem]" />;

export default HowWeWork;
