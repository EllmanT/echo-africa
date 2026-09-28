"use client";

import { useEffect, useRef, useState } from "react";

/** Frames a drawn scene and starts its motion only while it is on screen. */
const IllustrationFrame = ({ children, caption }: { children: React.ReactNode; caption?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setPlay(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="my-10">
      <div
        ref={ref}
        data-play={play}
        role="img"
        aria-label={caption || "Illustration"}
        className="ill relative aspect-[2/1] overflow-hidden rounded-[1.75rem] border border-purple/15 bg-gradient-to-b from-purple/[0.07] to-purple/[0.03] p-3 md:p-5"
      >
        {children}
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
};

export default IllustrationFrame;
