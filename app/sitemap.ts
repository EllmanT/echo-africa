import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";
import { services } from "@/data/services";
import { getPublishedProjects } from "@/lib/content/projects";
import { getAllPublishedPosts } from "@/lib/content/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseStudies, posts] = await Promise.all([getPublishedProjects(), getAllPublishedPosts()]);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "monthly", priority: 1.0 },
    { url: `${siteConfig.url}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/work`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/about`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteConfig.url}/playbook`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/resources/launch-checklist`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteConfig.url}/services/${service.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${siteConfig.url}/work/${study.slug}`,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/playbook/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...caseStudyRoutes, ...blogRoutes];
}
