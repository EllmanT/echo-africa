import { siteConfig } from "@/lib/seo/site";
import { services } from "@/data/services";
import { caseStudies } from "@/data/case-studies";
import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `${siteConfig.name} is a web development and AI automation agency based in ${siteConfig.city}, ${siteConfig.country}, serving businesses across Africa. Clients pay only after they're satisfied with the delivered work.`,
    "",
    "## Services",
    ...services.map(
      (service) => `- [${service.name}](${siteConfig.url}/services/${service.slug}): ${service.shortDescription}`
    ),
    "",
    "## Work",
    `- [Case studies](${siteConfig.url}/work)`,
    ...caseStudies.map(
      (study) => `- [${study.client}](${siteConfig.url}/work/${study.slug}): ${study.summary}`
    ),
    "",
    "## Blog",
    ...getAllPosts().map(
      (post) => `- [${post.title}](${siteConfig.url}/blog/${post.slug}): ${post.description}`
    ),
    "",
    "## Contact",
    `- [Contact](${siteConfig.url}/contact)`,
    `- Email: ${siteConfig.email}`,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
