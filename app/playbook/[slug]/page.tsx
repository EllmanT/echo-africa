import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FaArrowLeft } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema } from "@/lib/seo/structured-data";
import { getAllPublishedPosts, getPublishedPostBySlug } from "@/lib/content/posts";

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
    image: post.coverImage,
    type: "article",
  });
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-display mb-4 mt-12 text-2xl font-bold tracking-tight md:text-3xl" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-display mb-3 mt-8 text-xl font-bold tracking-tight" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 text-lg leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-5 flex flex-col gap-2 pl-6 text-lg leading-relaxed text-muted-foreground marker:text-purple" {...props} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li className="list-disc pl-1" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-purple underline decoration-purple/30 underline-offset-4 hover:decoration-purple" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-foreground" {...props} />,
};

const PlaybookPostPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <PageShell>
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
          image: post.coverImage,
        })}
      />

      <article className="mx-auto max-w-2xl py-14 md:py-20">
        <div className="animate-rise">
          <p className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-ZW", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{post.description}</p>
        </div>

        {post.coverImage && (
          <div className="animate-rise relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem] border border-black/[0.06] bg-muted" style={{ animationDelay: "100ms" }}>
            <Image src={post.coverImage} alt={post.title} fill priority sizes="(min-width: 768px) 700px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="mt-12">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        <div className="mt-14 border-t border-black/[0.08] pt-8">
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
