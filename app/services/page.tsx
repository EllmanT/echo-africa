import Link from "next/link";
import { FaLocationArrow } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import MagicButton from "@/components/MagicButton";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildServiceSchema } from "@/lib/seo/structured-data";
import { services } from "@/data/services";

export const metadata: Metadata = buildMetadata({
  title: "Web Development, AI Automation & Software Development Services",
  description:
    "Eka's services: web development, AI automation, and custom software development for businesses in Zimbabwe and across Africa. Zero risk — you only pay when you love it.",
  path: "/services",
  keywords: [
    "web development Zimbabwe",
    "AI automation Zimbabwe",
    "software development company Harare",
    "digital services Zimbabwe",
  ],
});

const ServicesPage = () => {
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Services", path: "/services" }]} />
      {services.map((service) => (
        <JsonLd
          key={service.slug}
          data={buildServiceSchema({
            name: service.name,
            description: service.shortDescription,
            path: `/services/${service.slug}`,
          })}
        />
      ))}

      <div className="py-14 text-center max-w-2xl mx-auto">
        <h1 className="heading">
          What we <span className="text-purple">build</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          Websites, AI automation, and custom software for businesses in
          Zimbabwe and across Africa — built on a zero-risk basis. You see
          the finished work before you pay anything.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pb-20">
        {services.map((service) => (
          <div
            key={service.slug}
            className="rounded-3xl border border-black/[0.06] shadow-input bg-white p-8 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold">{service.name}</h2>
              <p className="text-muted-foreground mt-3 text-sm">
                {service.shortDescription}
              </p>
            </div>
            <Link href={`/services/${service.slug}`} className="mt-8">
              <MagicButton
                title="Learn more"
                icon={<FaLocationArrow />}
                position="right"
                otherClasses="w-full"
              />
            </Link>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default ServicesPage;
