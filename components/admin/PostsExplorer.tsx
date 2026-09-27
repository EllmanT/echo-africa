"use client";

import { useState } from "react";
import Link from "next/link";

import type { AdminPost } from "@/lib/admin/posts";

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-ZW", { year: "numeric", month: "short", day: "numeric" });

const PostsExplorer = ({ posts: initial }: { posts: AdminPost[] }) => {
  const [posts, setPosts] = useState(initial);

  const togglePublished = async (slug: string, published: boolean) => {
    setPosts((prev) => prev.map((p) => (p.slug === slug ? { ...p, published } : p)));
    await fetch(`/api/admin/posts/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
  };

  const remove = async (slug: string) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
    await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/[0.08] text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Source</th>
            <th className="px-5 py-3 font-medium">Published</th>
            <th className="px-5 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.06]">
          {posts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                No posts yet.
              </td>
            </tr>
          )}
          {posts.map((post) => (
            <tr key={post.slug}>
              <td className="px-5 py-3">
                <p className="font-medium">{post.title}</p>
                <p className="max-w-md truncate text-xs text-muted-foreground">{post.description}</p>
              </td>
              <td className="px-5 py-3 text-muted-foreground">{formatDate(post.date)}</td>
              <td className="px-5 py-3 text-muted-foreground capitalize">{post.source}</td>
              <td className="px-5 py-3">
                <input
                  type="checkbox"
                  checked={post.published}
                  onChange={(e) => togglePublished(post.slug, e.target.checked)}
                  className="h-4 w-4 accent-purple"
                />
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/playbook/${post.slug}`}
                    className="rounded-full border border-black/[0.12] px-3 py-1.5 text-xs font-medium transition-colors hover:border-purple/40 hover:text-purple"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(post.slug)}
                    className="rounded-full border border-black/[0.12] px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:border-destructive/40"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostsExplorer;
