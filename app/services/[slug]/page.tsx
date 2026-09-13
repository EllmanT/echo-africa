import { notFound } from "next/navigation";
import { FaLocationArrow } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import MagicButton from "@/components/MagicButton";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildServiceSchema, buildFAQSchema } from "@/lib/seo/structured-data";
import { services, getServiceBySlug } from "@/data/services";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};

  return buildMetadata({
    title: `${service.name} in Zimbabwe`,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
    keywords: service.keywords,
  });
}

const ServicePage = ({ params }: { params: { slug: string } }) => {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ]}
      />
      <JsonLd
        data={buildServiceSchema({
          name: service.name,
          description: service.shortDescription,
          path: `/services/${service.slug}`,
        })}
      />
      <JsonLd data={buildFAQSchema(service.faqs)} />

      <div className="py-14 max-w-3xl">
        <h1 className="heading text-left">{service.name}</h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          {service.heroDescription}
        </p>
        <a href="mailto:tmuranda1@gmail.com">
          <MagicButton
            title="Start the Conversation"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pb-16">
        {service.features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-black/[0.06] shadow-input bg-white p-6"
          >
            <h2 className="font-bold text-lg">{feature.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="pb-20 max-w-3xl">
        <h2 className="heading text-left text-2xl md:text-3xl">
          Frequently asked <span className="text-purple">questions</span>
        </h2>
        <dl className="mt-8 flex flex-col gap-6">
          {service.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-bold">{faq.question}</dt>
              <dd className="text-muted-foreground mt-1 text-sm">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </PageShell>
  );
};

export default ServicePage;
