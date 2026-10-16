"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/** A photo that is unveiled from the top as it scrolls into view, settling from a slight zoom. Once only. */
const PhotoReveal = ({
  src,
  alt,
  className,
  sizes,
  delay = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  delay?: number;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0 round 2rem)" }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0 round 2rem)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.9, delay, ease: [0.77, 0, 0.175, 1] }}
      className={cn("relative overflow-hidden rounded-[2rem] bg-muted", className)}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduce ? 1 : 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: reduce ? 0 : 1.3, delay, ease: [0.23, 1, 0.32, 1] }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </motion.div>
  );
};

export default PhotoReveal;
