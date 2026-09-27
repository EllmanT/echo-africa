import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import type { CaseStudy } from "@/data/case-studies";

const LogoTile = ({ study }: { study: CaseStudy }) => (
  <Link href={`/work/${study.slug}`} className="group block">
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/[0.06] bg-muted">
      <Image
        src={study.image}
        alt={`${study.client} logo`}
        fill
        sizes="(min-width: 768px) 45vw, 100vw"
        className="object-contain p-10 transition-transform duration-500 ease-out-strong group-hover:scale-[1.04] md:p-14"
      />
    </div>
    <div className="mt-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{study.client}</h3>
        <p className="mt-1 max-w-sm text-muted-foreground">{study.resultLine}</p>
      </div>
      <FaArrowRight
        size={18}
        aria-hidden="true"
        className="mt-2 shrink-0 text-neutral-400 transition-[transform,color] duration-200 ease-out-strong group-hover:translate-x-1 group-hover:text-purple"
      />
    </div>
  </Link>
);

export default LogoTile;
