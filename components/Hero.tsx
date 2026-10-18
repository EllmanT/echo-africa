import Link from "next/link";
import { FaCircleInfo, FaLocationArrow } from "react-icons/fa6";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";

/** The five service hues from the Services page, used here as a small, quiet signature. */
const SERVICE_DOTS = [
  { label: "Websites", color: "#2563EB" },
  { label: "AI", color: "#7C3AED" },
  { label: "Integrations", color: "#16A34A" },
  { label: "Software", color: "#F59E0B" },
  { label: "Logos", color: "#E5533D" },
];

const Hero = () => {
  return (
    <div className="pb-5 pt-16">
      {/**
       *  UI: Spotlights
       *  Link: https://ui.aceternity.com/components/spotlight
       */}
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="#7C3AED"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="#86EFAC"
        />
        <Spotlight
          className="left-80 top-28 h-[80vh] w-[50vw]"
          fill="#245FEB"
        />
      </div>

      {/**
       *  UI: grid
       *  change bg color to bg-black-100 and reduce grid color from
       *  0.2 to 0.03
       */}
      <div
        className="h-screen w-full dark:bg-gray-800 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.03]
       absolute top-0 left-0 flex items-center justify-center"
      >
        {/* Radial gradient for the container to give a faded look */}
        <div
          // chnage the bg to bg-black-100, so it matches the bg color and will blend in
          className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>

      <div className="flex justify-center relative my-1 z-10">
        <div className="max-w-[89vw] md:max-w-3xl lg:max-w-[64vw] flex flex-col items-center justify-center">
          <div className="h-10 md:h-16" />

          {/* <p className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-sm font-mono">
            Websites &middot; Logos &middot; AI Automation &mdash; African Businesses
          </p> */}

          <ul
            aria-label="What we build: websites, AI, integrations, software and logos"
            className="animate-rise mt-2 flex items-center justify-center gap-2.5"
          >
            {SERVICE_DOTS.map(({ label, color }) => (
              <li key={label} title={label} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }}>
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ul>

          <TextGenerateEffect
            as="h1"
            spectrumTail={2}
            words="Your Website Built in Days. You Pay Only If You Love It."
            innerClassName="font-display font-extrabold leading-[1.04] tracking-[-0.035em]"
            className="text-center text-[2.5rem] md:text-[3.5rem] lg:text-[4rem]"
          />

          <p className="text-center md:tracking-wider mb-4 text-sm md:text-base lg:text-lg max-w-xl">
            No upfront fee. We design and deliver your complete website, logo,
            or AI system-{" "}
            <b className="text-purple">before you pay a single dollar.</b> Love
            it, pay. Don&apos;t, walk away. Zero{" "}
            <span className="relative inline-block">
              risk
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -inset-x-1.5 inset-y-0 h-full w-[calc(100%+0.75rem)] overflow-visible"
              >
                <path
                  className="strike-draw"
                  pathLength={1}
                  d="M0 84 C 28 74, 62 46, 100 16"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
            .
          </p>
          <div className="flex gap-2">
            <Link href="/contact?from=home-hero#start">
              <MagicButton
                title="Start for Free"
                icon={<FaLocationArrow />}
                position="right"
              />
            </Link>
            <Link href="/work">
              <MagicButton
                title="See Our Work"
                icon={<FaCircleInfo />}
                position="right"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
