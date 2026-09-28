import type { CSSProperties } from "react";
import { FaCode, FaGear, FaHammer, FaPenNib, FaWandMagicSparkles, FaWrench } from "react-icons/fa6";

// Small tools that quietly get on with their jobs behind the Services heading.
// Pure CSS motion (no JavaScript), decorative, and off for reduced-motion visitors.

const TOOLS: { Icon: typeof FaHammer; motion: string; spot: string; delay: number }[] = [
  { Icon: FaHammer, motion: "tool-hammer", spot: "left-[7%] top-[10%]", delay: 0 },
  { Icon: FaCode, motion: "tool-drift", spot: "right-[9%] top-[8%]", delay: 1.2 },
  { Icon: FaWrench, motion: "tool-sway", spot: "left-[1%] top-[52%]", delay: 0.6 },
  { Icon: FaWandMagicSparkles, motion: "tool-blink", spot: "right-[2%] top-[50%]", delay: 0.3 },
  { Icon: FaGear, motion: "tool-spin", spot: "left-[15%] bottom-[6%]", delay: 0 },
  { Icon: FaPenNib, motion: "tool-drift", spot: "right-[16%] bottom-[8%]", delay: 2.4 },
];

const Chip = ({ Icon, motion, delay }: { Icon: typeof FaHammer; motion: string; delay: number }) => (
  <span
    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/[0.06] bg-white text-purple shadow-[0_6px_16px_-8px_rgba(25,28,33,0.25)]"
    style={{ ["--d" as string]: `${delay}s` } as CSSProperties}
  >
    <Icon size={18} className={motion} style={{ ["--d" as string]: `${delay}s` } as CSSProperties} />
  </span>
);

const ToolDrift = () => (
  <>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      {TOOLS.map((t, i) => (
        <span key={i} className={`absolute ${t.spot}`}>
          <Chip {...t} />
        </span>
      ))}
    </div>
    <div aria-hidden="true" className="mb-8 flex justify-center gap-3 md:hidden">
      {TOOLS.slice(0, 5).map((t, i) => (
        <Chip key={i} {...t} />
      ))}
    </div>
  </>
);

export default ToolDrift;
