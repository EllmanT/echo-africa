import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  coverImage?: string;
};

export type BlogPost = {
  slug: string;
  content: string;
} & BlogFrontmatter;

export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    content,
    title: data.title,
    description: data.description,
    date: data.date,
    updated: data.updated,
    tags: data.tags ?? [],
    coverImage: data.coverImage,
  };
}

export function getAllPosts(): BlogPost[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
