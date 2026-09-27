import JsonLd from "./seo/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export type Crumb = { name: string; path: string };

/**
 * Emits BreadcrumbList structured data only. The visible breadcrumb trail was
 * removed on purpose: the header logo is the way home, and Google still gets
 * the hierarchy from the JSON-LD.
 */
const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const allItems: Crumb[] = [{ name: "Home", path: "/" }, ...items];
  return <JsonLd data={buildBreadcrumbSchema(allItems)} />;
};

export default Breadcrumbs;
