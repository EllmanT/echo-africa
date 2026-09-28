import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAllPublishedPosts } from "@/lib/content/posts";
import { fallbackCover } from "@/lib/playbook/images";
import { readingMinutes } from "@/lib/playbook/readingTime";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "The Playbook: Free Web, AI and Business Tips",
  description:
    "Practical guides on web development, AI automation, and software for businesses in Zimbabwe and across Africa, from the team at Eka.",
  path: "/playbook",
  keywords: ["web development blog Zimbabwe", "AI automation guide Zimbabwe"],
});

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-ZW", { year: "numeric", month: "long", day: "numeric" });

const PlaybookIndexPage = async () => {
  const posts = await getAllPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Playbook", path: "/playbook" }]} />

      <section className="mx-auto max-w-3xl pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div className="animate-rise">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple">Free, every day</p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            The <span className="text-purple">Playbook.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Practical, plain-English tips on websites, AI automation and getting found online, for business owners
            across Zimbabwe and Africa. No pitch, just what actually works.
          </p>
        </div>
      </section>

      {posts.length === 0 && (
        <p className="pb-24 text-center text-muted-foreground">No posts published yet. Check back soon.</p>
      )}

      {featured && (
        <div className="animate-rise" style={{ animationDelay: "100ms" }}>
          <Link href={`/playbook/${featured.slug}`} className="group grid gap-6 pb-16 md:grid-cols-2 md:items-center md:gap-12 md:pb-24">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-black/[0.06] bg-muted">
              <Image
                src={featured.coverImage ?? fallbackCover(featured.slug, featured.tags)}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out-strong group-hover:scale-[1.03]"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {formatDate(featured.date)} <span aria-hidden="true">&middot;</span> {readingMinutes(featured.content)} min read
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] transition-colors group-hover:text-purple md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{featured.description}</p>
            </div>
          </Link>
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid gap-8 border-t border-black/[0.08] pb-24 pt-16 md:grid-cols-3">
          {rest.map((post) => (
            <Reveal key={post.slug}>
              <Link href={`/playbook/${post.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.06] bg-muted">
                  <Image
                    src={post.coverImage ?? fallbackCover(post.slug, post.tags)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out-strong group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {formatDate(post.date)} <span aria-hidden="true">&middot;</span> {readingMinutes(post.content)} min read
                </p>
                <h3 className="mt-1.5 font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-purple">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default PlaybookIndexPage;
