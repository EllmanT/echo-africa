import {
  FaArrowsDownToLine,
  FaCircleInfo,
  FaLocationArrow,
  FaQuestion,
  FaWaveSquare,
} from "react-icons/fa6";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";

const Hero = () => {
  return (
    <div className="pb-10 pt-32">
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

      <div className="flex justify-center relative my-12 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <p className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-80 font-mono flex items-baseline justify-center space-x-2">
            <span>Eka</span>
            <span className="relative flex flex-row space-x-1">
              <span
                className="animate-pulse inline-block text-blue-300 rotate-[-10deg]"
                style={{
                  animationDelay: "0s",
                  position: "relative",
                  top: "-0.5rem",
                  fontSize: "0.6rem",
                }}
              >
                )
              </span>
              <span
                className="animate-pulse inline-block text-blue-300 text-sm rotate-[-10deg]"
                style={{
                  animationDelay: "0.2s",
                  position: "relative",
                  top: "-0.8rem",
                }}
              >
                )
              </span>
              <span
                className="animate-pulse inline-block text-blue-300 text-xl rotate-[-10deg]"
                style={{
                  animationDelay: "0.4s",
                  position: "relative",
                  top: "-1.3rem",
                }}
              >
                )
              </span>
            </span>
          </p>

          {/**
           *  Link: https://ui.aceternity.com/components/text-generate-effect
           *
           *  change md:text-6xl, add more responsive code
           */}
          <TextGenerateEffect
            words="AI for African Businesses"
            className="text-center text-[40px] md:text-5xl lg:text-6xl"
          />

          <p className="text-center md:tracking-wider mb-2 text-sm md:text-lg lg:text-2xl">
            AI-powered tools to streamline business operations and solve real
            challenges across Africa.
          </p>
          <div className="flex gap-2">
            <a href="#about">
              <MagicButton
                title="Who are we"
                icon={<FaCircleInfo />}
                position="right"
              />
            </a>
            <a href="#projects">
              <MagicButton
                title="Case Studes"
                icon={<FaLocationArrow />}
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
