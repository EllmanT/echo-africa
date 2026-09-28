"use client";

import { useEffect, useRef, useState } from "react";

/** The quiet panel behind a service drawing, washed with a hint of that service's accent (--accent-soft,
 *  set by the .svc-* class on the section). Starts the motion only while it is on screen. */
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
      className="ill relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-black/[0.07] bg-white bg-[radial-gradient(120%_90%_at_100%_0%,var(--accent-soft),transparent_60%)] p-4 md:p-6"
    >
      {children}
    </div>
  );
};

export default VisualFrame;
