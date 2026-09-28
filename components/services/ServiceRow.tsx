import Link from "next/link";
import { FaArrowRight, FaCheck } from "react-icons/fa6";

import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";
import VisualFrame from "./VisualFrame";

/** Each service owns one accent hue. The matching .svc-* class in globals.css sets --accent. */
export type ServiceTone = "web" | "ai" | "int" | "soft" | "logo";

export type ServiceRowProps = {
  id: string;
  tone: ServiceTone;
  title: React.ReactNode;
  subheading: string;
  points: string[];
  quoteHref: string;
  learnHref: string;
  visualLabel: string;
  visual: React.ReactNode;
  /** Put the picture on the left and the words on the right. */
  flip?: boolean;
  /** The first row above the fold uses CSS-only entrance so it never waits for JavaScript. */
  first?: boolean;
};

const ServiceRow = ({ id, tone, title, subheading, points, quoteHref, learnHref, visualLabel, visual, flip, first }: ServiceRowProps) => {
  const text = (
    <div>
      <h2 id={`${id}-title`} className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-6xl">{title}</h2>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">{subheading}</p>
      <ul className="mt-7 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-base md:text-lg">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,white)] text-[color:var(--accent-ink)]">
              <FaCheck size={10} aria-hidden="true" />
            </span>
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={quoteHref}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-[color:var(--accent-ink)] active:scale-[0.97]"
        >
          Get a quote
          <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
        </Link>
        <Link
          href={learnHref}
          className="text-base font-medium text-foreground underline decoration-black/25 underline-offset-4 transition-colors hover:text-[color:var(--accent-ink)] hover:decoration-[color:var(--accent)]"
        >
          Learn more
        </Link>
      </div>
    </div>
  );

  const picture = <VisualFrame label={visualLabel}>{visual}</VisualFrame>;

  const wrap = (node: React.ReactNode, delay = 0) =>
    first ? (
      <div className="animate-rise" style={{ animationDelay: `${delay * 1000}ms` }}>
        {node}
      </div>
    ) : (
      <Reveal delay={delay}>{node}</Reveal>
    );

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-32 py-16 md:py-28", `svc-${tone}`)}
    >
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className={cn(flip && "md:order-2")}>
          {wrap(text)}
        </div>
        <div className={cn(flip && "md:order-1")}>{wrap(picture, 0.1)}</div>
      </div>
    </section>
  );
};

export default ServiceRow;
