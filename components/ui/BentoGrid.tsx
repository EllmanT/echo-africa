
// Also install this npm i --save-dev @types/react-lottie
// import Lottie from "react-lottie";

import { cn } from "@/lib/utils";

import { BackgroundGradientAnimation } from "./GradientBg";
import GridGlobe from "./GridGlobe";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        // change gap-4 to gap-8, change grid-cols-3 to grid-cols-5, remove md:auto-rows-[18rem], add responsive code
        "grid grid-cols-1 md:grid-cols-6 lg:grid-cols-5 md:grid-row-7 gap-4 lg:gap-8 mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  id,
  title,
  description,
  //   remove unecessary things here
  img,
  imgClassName,
  titleClassName,
  spareImg,
}: {
  className?: string;
  id: number;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  img?: string;
  imgClassName?: string;
  titleClassName?: string;
  spareImg?: string;
}) => {
  const leftLists = ["Automation", "Websites", "Apps"];
  const rightLists = ["A I", "Logos", ""];

  return (
    <div
      className={cn(
        // remove p-4 rounded-3xl dark:bg-black dark:border-white/[0.2] bg-white  border border-transparent, add border border-white/[0.1] overflow-hidden relative
        "row-span-1 relative overflow-hidden rounded-3xl border border-black/[0.06] group/bento hover:shadow-xl transition duration-200 shadow-input justify-between flex flex-col space-y-4",
        className,
      )}
      style={{
        background: "#FFFFFF",
      }}
    >
      {/* add img divs */}
      <div className={`${id === 6 && "flex justify-center"} h-full`}>
        <div className="w-full h-full absolute">
          {img && (
            <img
              src={img}
              alt=""
              className={cn(imgClassName, "object-cover object-center ")}
            />
          )}
        </div>
        <div
          className={`absolute right-0 -bottom-5 ${
            id === 5 && "w-full opacity-40"
          } `}
        >
          {spareImg && (
            <img
              src={spareImg}
              alt=""
              //   width={220}
              className="object-cover object-center w-full h-full"
            />
          )}
        </div>
        {id === 6 && (
          // add background animation , remove the p tag
          <BackgroundGradientAnimation>
            <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl"></div>
          </BackgroundGradientAnimation>
        )}

        <div
          className={cn(
            titleClassName,
            "group-hover/bento:translate-x-2 transition duration-200 relative md:h-full min-h-40 flex flex-col px-5 p-5 lg:p-10",
          )}
        >
          {/* change the order of the title and des, font-extralight, remove text-xs text-neutral-600 dark:text-neutral-300 , change the text-color */}
          <div
            className={cn(
              "font-sans font-extralight md:max-w-32 md:text-xs lg:text-base text-sm z-10",
              id === 3 ? "text-black/80" : "text-muted-foreground",
            )}
          >
            {description}
          </div>
          {/* add text-3xl max-w-96 , remove text-neutral-600 dark:text-neutral-300*/}
          {/* remove mb-2 mt-2 */}
          <div
            className={cn(
              "font-sans text-lg lg:text-3xl max-w-96 font-bold z-10",
              id === 5 || id === 6 || id === 4 ? "text-black" : "text-white",
            )}
          >
            {title}
          </div>

          {/* for the github 3d globe */}
          {id === 2 && <GridGlobe />}

          {/* Tech stack list div */}
          {id === 3 && (
            <div className="flex gap-1 lg:gap-5 w-fit absolute -right-3 lg:-right-2">
              {/* tech stack lists */}
              <div className="flex flex-col gap-3 md:gap-3 lg:gap-8">
                {leftLists.map((item, i) => (
                  <span
                    key={i}
                    className="lg:py-4 lg:px-3 py-2 px-3 text-xs lg:text-base opacity-50 
                    lg:opacity-100 rounded-lg text-center bg-muted"
                  >
                    {item}
                  </span>
                ))}
                <span className="lg:py-4 lg:px-3 py-4 px-3  rounded-lg text-center bg-muted"></span>
              </div>
              <div className="flex flex-col gap-3 md:gap-3 lg:gap-8 ">
                <span className="lg:py-4 lg:px-3 py-4 px-3  rounded-lg text-center bg-muted"></span>
                {rightLists.map((item, i) => (
                  <span
                    key={i}
                    className="lg:py-4 lg:px-3 py-2 px-3 text-xs lg:text-white opacity-50 
                    lg:opacity-100 rounded-lg text-center bg-blue-900"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* The two story cards answer a question a visitor may be asking, then point at the work below. */}
          {id === 6 && (
            <div className="mt-3 relative z-10">
              <p className="max-w-sm text-base leading-snug text-black/70">
                Most owners start with one problem: too few enquiries, too much typing, or a site that looks tired. Tell us the problem and we point you to the fix.
              </p>
              <a
                href="#projects"
                className="group/link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-purple focus-visible:outline-none focus-visible:underline"
              >
                See what we have built
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-200 ease-out-strong group-hover/link:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3 V13 M3.5 8.5 L8 13 L12.5 8.5" />
                </svg>
              </a>
            </div>
          )}
          {id === 4 && (
            <p className="mt-3 max-w-sm text-base leading-snug text-black/70 z-10">
              Then you pay nothing. We build it first, you look it over, and you only pay when you are happy. No deposit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
