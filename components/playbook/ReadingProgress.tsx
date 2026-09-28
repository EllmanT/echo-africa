"use client";

import { useEffect, useRef } from "react";

/** A thin bar under the site header that fills as the visitor reads down the article. */
const ReadingProgress = ({ targetId }: { targetId: string }) => {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
      if (bar.current) bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-16 z-[4999] h-[3px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-purple" />
    </div>
  );
};

export default ReadingProgress;
