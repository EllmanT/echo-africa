import { toJsonLd } from "@/lib/seo/structured-data";

const JsonLd = ({ data }: { data: unknown }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: toJsonLd(data) }}
  />
);

export default JsonLd;
