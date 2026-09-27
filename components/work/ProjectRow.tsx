import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import type { CaseStudy } from "@/data/case-studies";

const ProjectRow = ({ study, priority = false }: { study: CaseStudy; priority?: boolean }) => {
  const lead = study.heroStats[0];

  return (
    <Link
      href={`/work/${study.slug}`}
      className="group grid items-center gap-8 border-t border-black/[0.08] py-10 md:grid-cols-[1.2fr_1fr] md:gap-16 md:py-14"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-black/[0.06] bg-muted">
        <Image
          src={study.image}
          alt={`${study.client} website preview`}
          fill
          priority={priority}
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover object-top transition-transform duration-500 ease-out-strong group-hover:scale-[1.03]"
        />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{study.location}</p>
        <h3 className="mt-2 font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
          {study.client}
        </h3>
        {lead && (
          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-5xl font-extrabold tracking-[-0.04em] text-purple md:text-6xl">
              {lead.value}
            </span>
            <span className="max-w-[12rem] text-sm leading-snug text-muted-foreground">{lead.label}</span>
          </p>
        )}
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{study.resultLine}</p>
        <span className="mt-7 inline-flex items-center gap-2 text-base font-semibold text-foreground transition-colors duration-200 group-hover:text-purple">
          See how we did it
          <FaArrowRight
            size={14}
            className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
};

export default ProjectRow;
