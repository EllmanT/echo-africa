import type { AnchorHTMLAttributes, HTMLAttributes, ImgHTMLAttributes } from "react";
import { FaLightbulb } from "react-icons/fa6";

import Reveal from "@/components/Reveal";
import Illustration from "./Illustration";

/** A boxed aside for the short version, a warning or a key idea. Used as <Callout title="...">. */
const Callout = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <Reveal className="my-9">
    <aside className="rounded-3xl bg-purple/[0.06] p-6 md:p-7">
      {title && (
        <p className="mb-3 flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-white">
            <FaLightbulb size={13} aria-hidden="true" />
          </span>
          {title}
        </p>
      )}
      <div className="[&>*:last-child]:mb-0 [&_li]:text-base [&_p]:text-base [&_p]:text-foreground/80">{children}</div>
    </aside>
  </Reveal>
);

/**
 * Everything an article can use. Writers (and the generator) may only use these tags:
 * plain Markdown, <Illustration name="..." caption="..." /> and <Callout title="...">.
 */
export const playbookMdxComponents = {
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-4 mt-14 scroll-mt-24 font-display text-2xl font-extrabold tracking-[-0.02em] md:text-3xl" {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-3 mt-8 font-display text-xl font-bold tracking-tight" {...props} />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 text-lg leading-[1.7] text-muted-foreground" {...props} />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="mb-6 flex flex-col gap-2.5 pl-6 text-lg leading-relaxed text-muted-foreground marker:text-purple [&>li]:list-disc [&>li]:pl-1"
      {...props}
    />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={[
        "mb-7 mt-6 flex list-none flex-col gap-4 p-0 text-lg leading-relaxed text-muted-foreground [counter-reset:step]",
        "[&>li]:relative [&>li]:min-h-8 [&>li]:pl-12 [&>li]:pt-0.5 [&>li]:[counter-increment:step]",
        "[&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-0 [&>li]:before:flex [&>li]:before:h-8 [&>li]:before:w-8",
        "[&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:rounded-full [&>li]:before:bg-purple",
        "[&>li]:before:font-display [&>li]:before:text-sm [&>li]:before:font-bold [&>li]:before:text-white",
        "[&>li]:before:content-[counter(step)]",
      ].join(" ")}
      {...props}
    />
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <Reveal className="my-10">
      <blockquote
        className="text-center font-display text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl [&>p]:mb-0 [&>p]:text-inherit [&>p]:leading-snug"
        {...props}
      />
    </Reveal>
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-purple underline decoration-purple/30 underline-offset-4 hover:decoration-purple" {...props} />
  ),
  strong: (props: HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-foreground" {...props} />,
  hr: () => <hr className="my-12 border-black/[0.08]" />,
  img: ({ alt, src, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} loading="lazy" className="my-9 w-full rounded-3xl border border-black/[0.06]" {...props} />
  ),
  Illustration,
  Callout,
};

export { ALLOWED_MDX_TAGS } from "./mdx-tags";
