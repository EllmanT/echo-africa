import Link from "next/link";
import JsonLd from "./seo/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export type Crumb = { name: string; path: string };

const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const allItems: Crumb[] = [{ name: "Home", path: "/" }, ...items];

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(allItems)} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          {allItems.map((item, index) => (
            <li key={item.path} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === allItems.length - 1 ? (
                <span className="text-foreground">{item.name}</span>
              ) : (
                <Link href={item.path} className="hover:text-purple transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
