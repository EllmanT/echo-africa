import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FaArrowLeft, FaArrowRight, FaRegClock } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/Reveal";
import ReadingProgress from "@/components/playbook/ReadingProgress";
import { playbookMdxComponents } from "@/components/playbook/mdx";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema } from "@/lib/seo/structured-data";
import { getAllPublishedPosts, getPublishedPostBySlug } from "@/lib/content/posts";
import { fallbackCover } from "@/lib/playbook/images";
import { readingMinutes } from "@/lib/playbook/readingTime";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/playbook/${post.slug}`,
    keywords: post.tags,
    image: post.coverImage ?? fallbackCover(post.slug, post.tags),
    type: "article",
  });
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-ZW", { year: "numeric", month: "long", day: "numeric" });

const PlaybookPostPage = async ({ params }: { params: { slug: string } }) => {
  const [post, all] = await Promise.all([getPublishedPostBySlug(params.slug), getAllPublishedPosts()]);
  if (!post) notFound();

  const minutes = readingMinutes(post.content);
  const cover = post.coverImage ?? fallbackCover(post.slug, post.tags);
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <PageShell>
      <ReadingProgress targetId="article-body" />
      <Breadcrumbs
        items={[
          { name: "Playbook", path: "/playbook" },
          { name: post.title, path: `/playbook/${post.slug}` },
        ]}
      />
      <JsonLd
        data={buildArticleSchema({
          title: post.title,
          description: post.description,
          path: `/playbook/${post.slug}`,
          datePublished: post.date,
          dateModified: post.updated,
          image: cover,
        })}
      />

      <article className="mx-auto max-w-2xl py-14 md:py-20">
        <header className="animate-rise">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-black/25" />
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
              <FaRegClock size={12} aria-hidden="true" />
              {minutes} min read
            </span>
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{post.description}</p>
        </header>

        <div
          className="animate-rise relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem] border border-black/[0.06] bg-muted"
          style={{ animationDelay: "100ms" }}
        >
          <Image src={cover} alt="" fill priority sizes="(min-width: 768px) 700px, 100vw" className="object-cover" />
        </div>

        <div id="article-body" className="mt-12">
          <MDXRemote source={post.content} components={playbookMdxComponents} />
        </div>

        <Reveal className="mt-16">
          <div className="rounded-[2rem] bg-purple/[0.07] p-7 text-center md:p-10">
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">Want this done for you?</h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              We build it first. You look at it, and you pay only when you love it.
            </p>
            <Link
              href="/contact"
              className="group mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]"
            >
              Start your project
              <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {related.length > 0 && (
          <section aria-labelledby="more-heading" className="mt-16 border-t border-black/[0.08] pt-10">
            <h2 id="more-heading" className="font-display text-xl font-bold tracking-tight">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((p) => (
                <Link key={p.slug} href={`/playbook/${p.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/[0.06] bg-muted">
                    <Image
                      src={p.coverImage ?? fallbackCover(p.slug, p.tags)}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 320px, 100vw"
                      className="object-cover transition-transform duration-500 ease-out-strong group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{readingMinutes(p.content)} min read</p>
                  <p className="mt-1 font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-purple">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <Link
            href="/playbook"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-purple"
          >
            <FaArrowLeft size={12} className="transition-transform duration-200 ease-out-strong group-hover:-translate-x-1" />
            Back to the Playbook
          </Link>
        </div>
      </article>
    </PageShell>
  );
};

export default PlaybookPostPage;
