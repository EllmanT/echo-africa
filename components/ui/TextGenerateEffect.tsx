"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  as: Tag = "div",
  spectrumTail = 0,
  innerClassName = "leading-snug tracking-wide",
}: {
  words: string;
  className?: string;
  as?: "div" | "h1" | "h2";
  /** How many of the last words wear the slow multi-colour gradient (the Services palette). */
  spectrumTail?: number;
  innerClassName?: string;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.2),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              // change here if idx is greater than 3, change the text color to #CBACF9
              className={` ${
                idx >= wordsArray.length - spectrumTail
                  ? "text-spectrum"
                  : idx > 3
                    ? "text-purple"
                    : "dark:text-white text-black"
              } opacity-0`}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <Tag className={cn("font-bold", className)}>
      {/* mt-4 to my-4 */}
      <div className="my-4">
        {/* remove  text-2xl from the original */}
        <div className={cn("dark:text-white text-black", innerClassName)}>
          {renderWords()}
        </div>
      </div>
    </Tag>
  );
};
