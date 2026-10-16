"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import Reveal from "@/components/Reveal";

type Photo = { src: string; alt: string };

/** Three portrait photos that drift a few pixels against each other as the page scrolls. */
const PhotoTrio = ({ photos }: { photos: Photo[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const outer = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [28, -28]);
  const inner = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-14, 14]);
  const ys = [outer, inner, outer];

  return (
    <div ref={ref} className="mx-auto grid max-w-4xl grid-cols-3 gap-3 pb-16 md:gap-6 md:pb-24">
      {photos.map((p, i) => (
        <Reveal key={p.src} delay={i * 0.1}>
          <motion.div style={{ y: ys[i] }} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted md:rounded-[2rem]">
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width: 896px) 270px, 33vw"
              className="object-cover transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]"
            />
          </motion.div>
        </Reveal>
      ))}
    </div>
  );
};

export default PhotoTrio;
