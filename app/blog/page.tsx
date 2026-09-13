import Link from "next/link";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = buildMetadata({
  title: "Blog — Web Development & AI Automation Insights",
  description:
    "Practical guides on web development, AI automation, and software for businesses in Zimbabwe and across Africa, from the team at Eka.",
  path: "/blog",
  keywords: ["web development blog Zimbabwe", "AI automation guide Zimbabwe"],
});

const BlogIndexPage = () => {
  const posts = getAllPosts();

  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Blog", path: "/blog" }]} />

      <div className="py-14 max-w-2xl">
        <h1 className="heading text-left">
          From the <span className="text-purple">blog</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          Practical guides on web development, AI automation, and software
          for businesses in Zimbabwe and across Africa.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pb-20">
        {posts.length === 0 && (
          <p className="text-muted-foreground">No posts published yet — check back soon.</p>
        )}
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-3xl border border-black/[0.06] shadow-input bg-white p-6 hover:shadow-xl transition duration-200"
          >
            <p className="text-xs text-muted-foreground">
              {new Date(post.date).toLocaleDateString("en-ZW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="font-bold text-lg mt-2">{post.title}</h2>
            <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
};

export default BlogIndexPage;
