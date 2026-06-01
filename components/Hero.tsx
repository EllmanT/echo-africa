import Image from "next/image";
import { FaCircleInfo, FaLocationArrow } from "react-icons/fa6";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";

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
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      {/**
       *  UI: grid
       *  change bg color to bg-black-100 and reduce grid color from
       *  0.2 to 0.03
       */}
      <div
        className="h-screen w-full dark:bg-gray-800 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2]
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
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <Image
            src="/eka-logo.png"
            alt="Eka logo"
            width={360}
            height={360}
            className="-mb-2"
          />

          {/* <p className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-sm font-mono">
            Websites &middot; Logos &middot; AI Automation &mdash; African Businesses
          </p> */}

          <TextGenerateEffect
            words="Your Website Built in Days. You Pay Only If You Love It."
            className="text-center text-[32px] md:text-4xl lg:text-5xl"
          />

          <p className="text-center md:tracking-wider mb-4 text-sm md:text-base lg:text-lg max-w-xl">
            No upfront fee. We design and deliver your complete
            website, logo, or AI system- <b className="text-purple"n>before you pay a
            single dollar.</b> Love it, pay. Don&apos;t, walk away. Zero risk.
          </p>
          <div className="flex gap-2">
            <a href="#contact">
              <MagicButton
                title="Start for Free"
                icon={<FaLocationArrow />}
                position="right"
              />
            </a>
            <a href="#projects">
              <MagicButton
                title="See Our Work"
                icon={<FaCircleInfo />}
                position="right"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
