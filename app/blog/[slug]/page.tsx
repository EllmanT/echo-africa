import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema } from "@/lib/seo/structured-data";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    image: post.coverImage,
    type: "article",
  });
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mt-10 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold mt-8 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-muted-foreground leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 text-muted-foreground mb-4 flex flex-col gap-1" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-purple hover:underline underline-offset-4" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
};

const BlogPostPage = ({ params }: { params: { slug: string } }) => {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <JsonLd
        data={buildArticleSchema({
          title: post.title,
          description: post.description,
          path: `/blog/${post.slug}`,
          datePublished: post.date,
          dateModified: post.updated,
          image: post.coverImage,
        })}
      />

      <article className="py-14 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-ZW", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="heading text-left mt-2">{post.title}</h1>
        <p className="text-muted-foreground mt-4 text-lg">{post.description}</p>

        <div className="mt-10">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        <div className="mt-14 pt-8 border-t border-black/[0.06]">
          <Link href="/blog" className="text-sm text-purple hover:underline underline-offset-4">
            &larr; Back to all posts
          </Link>
        </div>
      </article>
    </PageShell>
  );
};

export default BlogPostPage;
