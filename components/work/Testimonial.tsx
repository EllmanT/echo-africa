"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const delay = (s: number): CSSProperties => ({ ["--d" as string]: `${s}s` });

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/**
 * A client quote with quiet, single-colour motion: the words arrive one by one, a large quote mark
 * settles in behind them, brackets draw at the sides and a few sparkles breathe. Motion starts when
 * the quote scrolls into view and is off for visitors who ask for reduced motion.
 */
const Testimonial = ({ quote, name, title }: { quote: string; name: string; title: string }) => {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setPlay(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = quote.split(/\s+/).filter(Boolean);
  const step = Math.min(0.045, 1.4 / Math.max(words.length, 1));

  return (
    <figure ref={ref} data-play={play} className="ill relative mx-auto mt-14 max-w-2xl px-4 py-12 md:px-10">
      <svg aria-hidden="true" viewBox="0 0 600 240" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <path className="a-draw" pathLength="1" style={delay(0.2)} d="M26 26 Q-2 120 26 214" fill="none" stroke="#7C3AED" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path className="a-draw" pathLength="1" style={delay(0.35)} d="M574 26 Q602 120 574 214" fill="none" stroke="#7C3AED" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3">
        <span className="fx a-pop block font-serif text-[9rem] leading-none text-purple/[0.13]" style={delay(0)}>
          &ldquo;
        </span>
      </span>

      {[
        "left-[3%] top-[26%]",
        "right-[4%] top-[14%]",
        "left-[9%] bottom-[16%]",
        "right-[8%] bottom-[28%]",
      ].map((pos, i) => (
        <svg
          key={pos}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`a-blink pointer-events-none absolute h-3.5 w-3.5 text-purple/45 ${pos}`}
          style={delay(i * 0.55)}
        >
          <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="currentColor" />
        </svg>
      ))}

      <blockquote aria-label={quote} className="relative text-center font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
        <span aria-hidden="true">&ldquo;</span>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true">
            <span className="fx a-pop inline-block" style={delay(0.25 + i * step)}>
              {w}
            </span>{" "}
          </span>
        ))}
        <span aria-hidden="true">&rdquo;</span>
      </blockquote>

      <figcaption className="relative mt-7 flex items-center justify-center gap-3 text-base text-muted-foreground">
        <span
          aria-hidden="true"
          className="fx a-pop flex h-10 w-10 items-center justify-center rounded-full bg-purple/10 font-display text-sm font-bold text-purple"
          style={delay(0.25 + words.length * step + 0.1)}
        >
          {initials(name)}
        </span>
        <span>
          {name}, {title}
        </span>
      </figcaption>
    </figure>
  );
};

export default Testimonial;
