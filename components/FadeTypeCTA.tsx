"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";

/**
 * Giant "Pay only when you love it." type that rises into view while its
 * lower edge dissolves into the page (mask fade), with the offer and a CTA
 * sitting on top. Sits directly above the footer.
 */
const FadeTypeCTA = ({
  heading = "Ready to get your business online, properly?",
  sub = "Start for free. Pay only when you love it. No upfront fee.",
  buttonLabel = "Start the conversation",
  href = "/contact",
  bigLines = ["Pay only", "when you love it."],
}: {
  heading?: string;
  sub?: string;
  buttonLabel?: string;
  href?: string;
  bigLines?: string[];
}) => {
  const reduce = useReducedMotion();

  return (
    <section aria-label="Start your project" className="relative w-full pt-24 text-center">
      <div className="mx-auto max-w-3xl px-2">
        <h2 className="heading">{heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">{sub}</p>
        <Link
          href={href}
          className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]"
        >
          {buttonLabel}
          <FaArrowRight
            size={14}
            className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none relative mt-14 select-none overflow-hidden md:mt-20"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 18%, rgba(0,0,0,0.55) 55%, transparent 96%)",
          maskImage: "linear-gradient(to bottom, #000 18%, rgba(0,0,0,0.55) 55%, transparent 96%)",
        }}
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 90 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: reduce ? 0.3 : 1.1, ease: [0.23, 1, 0.32, 1] }}
        >
          {bigLines.map((line) => (
            <p
              key={line}
              className="font-display text-[14vw] font-extrabold leading-[0.92] tracking-[-0.04em] text-purple/90 sm:text-[11vw] xl:text-[9rem]"
            >
              {line}
            </p>
          ))}
        </motion.div>
        <div className="h-10 md:h-14" />
      </div>
    </section>
  );
};

export default FadeTypeCTA;
