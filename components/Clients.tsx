"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { companies } from "@/data";

const socialProofImages = [
  "/social-proof/sproof-1.png",
  "/social-proof/sproof-2.png",
  "/social-proof/sproof-3.png",
  "/social-proof/sproof-4.png",
  "/social-proof/sproof-5.png",
  "/social-proof/sproof-6.png",
  "/social-proof/sprrof-7.png",
  "/social-proof/sprrof-8.png",
  "/social-proof/sprrof-9.png",
  "/social-proof/sproof-10.png",
  "/social-proof/sproof-11.png",
  "/social-proof/sproof-12.png",
  "/social-proof/sproof-13.png",
  "/social-proof/sproof-14.png",
  "/social-proof/sproof-15.png",
  "/social-proof/sproof-16.png",
  "/social-proof/sproof-17.png",
];

// Duplicate once so the seamless loop is handled in JSX — no cloneNode needed,
// which prevents React reconciliation from silently removing the clones.
const doubledImages = [...socialProofImages, ...socialProofImages];

function getImageStyle(index: number): { heightClass: string; marginTop: number } {
  const heights = ["h-[28rem]", "h-[24rem]", "h-[30rem]", "h-[26rem]", "h-[28rem]", "h-[30rem]", "h-[24rem]"];
  const margins = [0, 20, 0, 20, 0, 20, 0];
  return {
    heightClass: heights[index % heights.length],
    marginTop: margins[index % margins.length],
  };
}

const Clients = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  const proofContainerRef = useRef<HTMLDivElement>(null);
  const proofScrollerRef = useRef<HTMLUListElement>(null);
  const [proofStart, setProofStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      Array.from(scrollerRef.current.children).forEach((item) => {
        scrollerRef.current?.appendChild(item.cloneNode(true));
      });
      containerRef.current.style.setProperty("--animation-direction", "forwards");
      containerRef.current.style.setProperty("--animation-duration", "50s");
      setStart(true);
    }

    if (proofContainerRef.current) {
      proofContainerRef.current.style.setProperty("--animation-direction", "forwards");
      proofContainerRef.current.style.setProperty("--animation-duration", "110s");
      setProofStart(true);
    }
  }, []);

  return (
    <section id="testimonials" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <h1 className="heading">
          Don&apos;t take
          <span className="text-purple"> our word for it.</span>
        </h1>
        <p className="text-white-200 mt-4 max-w-lg mx-auto text-base">
          Real WhatsApp conversations. Real clients. Real results.
        </p>
      </motion.div>

      {/* Social proof sliding strip */}
      <div
        ref={proofContainerRef}
        className="scroller relative z-20 w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, white 4%, white 96%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, white 4%, white 96%, transparent)",
          maxHeight: "580px",
        }}
        onMouseEnter={() => {
          if (proofScrollerRef.current) proofScrollerRef.current.style.animationPlayState = "paused";
        }}
        onMouseLeave={() => {
          if (proofScrollerRef.current) proofScrollerRef.current.style.animationPlayState = "running";
        }}
      >
        <ul
          ref={proofScrollerRef}
          className={cn(
            "flex shrink-0 gap-3 py-3 w-max flex-nowrap items-start",
            proofStart && "animate-scroll"
          )}
          style={proofStart ? { animationDirection: "reverse" } : undefined}
        >
          {doubledImages.map((src, index) => {
            const { heightClass, marginTop } = getImageStyle(index % socialProofImages.length);
            return (
              <li
                key={index}
                className="flex-shrink-0"
                style={{ marginTop }}
                aria-hidden={index >= socialProofImages.length}
              >
                <img
                  src={src}
                  alt={index < socialProofImages.length ? `Client message ${index + 1}` : ""}
                  className={cn(
                    heightClass,
                    "w-auto rounded-xl border border-white/10 shadow-md object-contain"
                  )}
                  draggable={false}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Trusted By heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20 w-full text-center"
      >
        <h2 className="heading">
          Trusted By Businesses
          <span className="text-purple"> Across Zimbabwe</span>
        </h2>
        <p className="text-white-200 mt-4 mb-10">
          From car dealerships and mines to creatives and service businesses.
        </p>
      </motion.div>

      {/* Logos carousel */}
      <div className="w-full bg-gray-100 rounded-2xl py-2">
        <div
          ref={containerRef}
          className="scroller relative z-20 w-full overflow-hidden"
        >
          <ul
            ref={scrollerRef}
            className={cn(
              "flex min-w-full shrink-0 gap-16 py-8 w-max flex-nowrap items-center",
              start && "animate-scroll"
            )}
          >
            {companies.map((company) => (
              <li
                key={company.id}
                className="flex-shrink-0 flex items-center justify-center"
              >
                <img
                  src={company.nameImg}
                  alt={company.name}
                  className={cn(
                    "object-contain transition-opacity duration-300 opacity-90 hover:opacity-100",
                    company.name === "Kolkart Mining"
                      ? "h-48 w-auto"
                      : "h-24 w-auto"
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Clients;
