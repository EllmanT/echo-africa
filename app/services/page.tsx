import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/Reveal";
import ToolDrift from "@/components/services/ToolDrift";
import ServiceNav from "@/components/services/ServiceNav";
import ServiceRow from "@/components/services/ServiceRow";
import {
  AutomationVisual,
  IntegrationVisual,
  LogoVisual,
  SoftwareVisual,
  WebVisual,
} from "@/components/services/visuals";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildServiceSchema } from "@/lib/seo/structured-data";
import { services } from "@/data/services";

export const metadata: Metadata = buildMetadata({
  title: "Web Development, AI Automation, Integration, Software & Logos",
  description:
    "Eka's services: web development, AI automation, system integration, custom software and logo design for businesses in Zimbabwe and across Africa. Zero risk, you only pay when you love it.",
  path: "/services",
  keywords: [
    "web development Zimbabwe",
    "AI automation Zimbabwe",
    "system integration Zimbabwe",
    "software development company Harare",
    "logo design Zimbabwe",
  ],
});

const ANCHORS = [
  { id: "web-development", label: "Web development" },
  { id: "ai-automation", label: "AI automation" },
  { id: "system-integration", label: "Integration" },
  { id: "custom-software", label: "Custom software" },
  { id: "logos", label: "Logos and brands" },
];

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

      <section className="relative mx-auto max-w-5xl pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <ToolDrift />
        <div className="animate-rise relative">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            What we <span className="text-purple">build.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Websites, AI automation, connected systems, software and logos for businesses in Zimbabwe and across Africa.
            You see the finished work before you pay anything.
          </p>
        </div>
      </section>

      <ServiceNav items={ANCHORS} />

      <ServiceRow
        first
        id="web-development"
        title={
          <>
            Websites that bring in <span className="text-purple">customers.</span>
          </>
        }
        subheading="Fast, clear and built for phones. Your customers find you, trust you and message you."
        points={[
          "Loads fast, even on mobile data",
          "Clear pages that turn visitors into enquiries",
          "You see it built before you pay",
        ]}
        quoteHref="/contact?service=website"
        learnHref="/services/web-development"
        visualLabel="A website being built on a desktop and shown on a phone"
        visual={<WebVisual />}
      />

      <ServiceRow
        flip
        id="ai-automation"
        title={
          <>
            AI that does the <span className="text-purple">boring work.</span>
          </>
        }
        subheading="Hand your repeat tasks to software. Replies, invoices and reports run on their own."
        points={[
          "Answers the same customer questions for you",
          "Reads documents and fills in your spreadsheets",
          "Keeps a person in the loop where it matters",
        ]}
        quoteHref="/contact?service=ai-automation"
        learnHref="/services/ai-automation"
        visualLabel="A workflow: a message arrives, AI reads it, an invoice is made and the customer gets a reply"
        visual={<AutomationVisual />}
      />

      <ServiceRow
        id="system-integration"
        title={
          <>
            Your tools, <span className="text-purple">talking to each other.</span>
          </>
        }
        subheading="Stop typing the same thing into three systems. We connect the tools you already use so information moves on its own."
        points={[
          "Orders, invoices and stock stay in sync",
          "WhatsApp, email, sheets and accounting linked",
          "An alert if a connection ever breaks",
        ]}
        quoteHref="/contact?service=system-integration"
        learnHref="/services/system-integration"
        visualLabel="Six business tools connected to a central hub by lines carrying information"
        visual={<IntegrationVisual />}
      />

      <ServiceRow
        flip
        id="custom-software"
        title={
          <>
            Software built around <span className="text-purple">how you work.</span>
          </>
        }
        subheading="When off-the-shelf tools do not fit, we build the one that does."
        points={["Your process, not a template", "Simple to use on any phone or computer", "Grows as your business grows"]}
        quoteHref="/contact?service=custom-software"
        learnHref="/services/software-development"
        visualLabel="A custom business dashboard with figures, a task list and a new order arriving"
        visual={<SoftwareVisual />}
      />

      <ServiceRow
        id="logos"
        title={
          <>
            A logo that looks <span className="text-purple">serious.</span>
          </>
        }
        subheading="Marks that look good on a signboard, an invoice and a phone screen."
        points={["Made for you, not from a template", "Files ready for print and screen", "You see ideas before you pay"]}
        quoteHref="/contact?service=logo"
        learnHref="/services/logo-design"
        visualLabel="A logo being built on guide lines, a colour palette and two logos Eka designed"
        visual={<LogoVisual />}
      />

      <Reveal>
        <section className="mb-20 rounded-[2rem] bg-purple/[0.07] px-6 py-14 text-center md:mb-28 md:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            Not sure which one you need?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Tell us about your business in two minutes. We will point you to the right fix, and we build it first.
          </p>
          <Link
            href="/contact"
            className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]"
          >
            Start your project
            <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
          </Link>
        </section>
      </Reveal>
    </PageShell>
  );
};

export default ServicesPage;
