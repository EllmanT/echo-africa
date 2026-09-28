"use client";

import { useEffect, useRef, useState } from "react";

/** The tinted panel behind a service drawing. Starts the motion only while it is on screen. */
const VisualFrame = ({ children, label }: { children: React.ReactNode; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setPlay(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-play={play}
      role="img"
      aria-label={label}
      className="ill relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-purple/15 bg-gradient-to-br from-purple/[0.09] via-purple/[0.04] to-white p-4 md:p-6"
    >
      {children}
    </div>
  );
};

export default VisualFrame;
