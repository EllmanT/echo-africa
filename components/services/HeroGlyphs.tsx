"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Six bare, flat, multicolour glyphs behind the Services heading. Five of them wear the same
// hue as the service they stand for (blue web, purple AI, green integration, amber software,
// coral logos), so the hero previews the colour system. Decorative only.
// One glyph at a time steps forward (about 15% larger); hovering one does the same.

const BLUE = "#2563EB";
const PURPLE = "#7C3AED";
const GREEN = "#16A34A";
const AMBER = "#F59E0B";
const CORAL = "#E5533D";
const TEAL = "#0E9AA7";

const Browser = () => (
  <>
    <rect x="3" y="7" width="42" height="34" rx="7" fill={BLUE} />
    <rect x="7" y="17" width="34" height="20" rx="3.5" fill="#fff" />
    <circle cx="10" cy="12" r="1.9" fill="#fff" />
    <circle cx="16" cy="12" r="1.9" fill="#fff" opacity="0.7" />
    <circle cx="22" cy="12" r="1.9" fill="#fff" opacity="0.45" />
    <rect x="11" y="21" width="14" height="3.5" rx="1.75" fill={BLUE} />
    <rect x="11" y="27.5" width="22" height="3" rx="1.5" fill="#BFD2FA" />
    <circle cx="35" cy="25" r="3" fill="#FBBC05" />
  </>
);

const Spark = () => (
  <>
    <path d="M21 5 C23 16 28 21 40 24 C28 27 23 32 21 43 C19 32 14 27 2 24 C14 21 19 16 21 5 Z" fill={PURPLE} />
    <path d="M38 3 C38.8 7 40.5 8.7 45 9.5 C40.5 10.3 38.8 12 38 16 C37.2 12 35.5 10.3 31 9.5 C35.5 8.7 37.2 7 38 3 Z" fill="#B79CF5" />
  </>
);

const Plug = () => (
  <>
    <rect x="14" y="3" width="6" height="14" rx="3" fill="#15803D" />
    <rect x="28" y="3" width="6" height="14" rx="3" fill="#15803D" />
    <rect x="9" y="14" width="30" height="18" rx="9" fill={GREEN} />
    <path d="M24 32 V37 a6 6 0 0 0 6 6 H41" fill="none" stroke="#4ADE80" strokeWidth="5" strokeLinecap="round" />
  </>
);

const Chart = () => (
  <>
    <rect x="5" y="27" width="10" height="16" rx="3" fill="#FCD34D" />
    <rect x="19" y="16" width="10" height="27" rx="3" fill={AMBER} />
    <rect x="33" y="5" width="10" height="38" rx="3" fill="#D97706" />
  </>
);

const Pen = () => (
  <g transform="rotate(40 24 24)">
    <rect x="18" y="3" width="12" height="9" rx="3" fill="#B3261E" />
    <rect x="18" y="11" width="12" height="24" fill={CORAL} />
    <path d="M18 35 H30 L24 46 Z" fill="#F6B5AC" />
    <path d="M22 42 H26 L24 46 Z" fill="#191C21" />
  </g>
);

const Chat = () => (
  <>
    <path d="M11 6 H37 a8 8 0 0 1 8 8 V28 a8 8 0 0 1 -8 8 H23 L12 44 V36 H11 a8 8 0 0 1 -8 -8 V14 a8 8 0 0 1 8 -8 Z" fill={TEAL} />
    <circle cx="15" cy="21" r="2.6" fill="#fff" />
    <circle cx="24" cy="21" r="2.6" fill="#fff" />
    <circle cx="33" cy="21" r="2.6" fill="#fff" />
  </>
);

const GLYPHS: { Art: () => React.JSX.Element; spot: string; delay: number }[] = [
  { Art: Browser, spot: "left-[7%] top-[10%]", delay: 0 },
  { Art: Spark, spot: "right-[9%] top-[8%]", delay: 1.2 },
  { Art: Plug, spot: "left-[1%] top-[52%]", delay: 0.6 },
  { Art: Chart, spot: "right-[2%] top-[50%]", delay: 1.8 },
  { Art: Pen, spot: "left-[15%] bottom-[6%]", delay: 2.4 },
  { Art: Chat, spot: "right-[16%] bottom-[8%]", delay: 3 },
];

// The spotlight hops around the hero instead of walking down one side.
const ORDER = [1, 4, 0, 3, 5, 2];
const HOLD_MS = 1800;

const Glyph = ({ Art, active, delay, size }: { Art: () => React.JSX.Element; active: boolean; delay: number; size: number }) => (
  <span className="glyph-hit glyph-float block" style={{ ["--d" as string]: `${delay}s` } as CSSProperties}>
    <span className="glyph-scale block" data-active={active}>
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
        <Art />
      </svg>
    </span>
  </span>
);

const HeroGlyphs = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let step = 0;
    let timer: number | undefined;
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      if (timer !== undefined || document.hidden) return;
      setActive(ORDER[step % ORDER.length]);
      timer = window.setInterval(() => {
        step += 1;
        setActive(ORDER[step % ORDER.length]);
      }, HOLD_MS);
    };

    let inView = false;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(root.parentElement ?? root); // the wrapper itself has no height on desktop
    const onVisibility = () => (document.hidden ? stop() : inView && start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true">
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {GLYPHS.map((g, i) => (
          <span key={i} className={`absolute ${g.spot} [@media(hover:hover)_and_(pointer:fine)]:pointer-events-auto`}>
            <Glyph Art={g.Art} active={active === i} delay={g.delay} size={54} />
          </span>
        ))}
      </div>
      <div className="mb-8 flex justify-center gap-5 md:hidden">
        {GLYPHS.slice(0, 5).map((g, i) => (
          <Glyph key={i} Art={g.Art} active={active === i} delay={g.delay} size={40} />
        ))}
      </div>
    </div>
  );
};

export default HeroGlyphs;
