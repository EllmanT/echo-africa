import { FaLocationArrow, FaLinkedin, FaRegEnvelope } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import MagicButton from "@/components/MagicButton";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Eka to start a website, AI automation, or custom software project. Based in Harare, Zimbabwe, serving businesses across Africa — zero risk, pay only when you love it.",
  path: "/contact",
  keywords: ["contact web developer Zimbabwe", "hire AI automation agency Harare"],
});

const ContactPage = () => {
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />

      <div className="py-14 max-w-2xl">
        <h1 className="heading text-left">
          Let&apos;s <span className="text-purple">talk</span>
        </h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          Tell us what you&apos;re trying to build — a website, AI automation, or
          custom software — and we&apos;ll get back to you. No upfront fees: we
          build first, you pay only when you&apos;re happy with the result.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 pb-20 max-w-2xl">
        <a
          href={`mailto:${siteConfig.email}`}
          className="rounded-3xl border border-black/[0.06] shadow-input bg-white p-6 flex flex-col gap-3 hover:shadow-xl transition duration-200"
        >
          <FaRegEnvelope className="text-purple" size={22} />
          <div>
            <h2 className="font-bold">Email</h2>
            <p className="text-muted-foreground text-sm mt-1">{siteConfig.email}</p>
          </div>
        </a>
        <a
          href={siteConfig.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-3xl border border-black/[0.06] shadow-input bg-white p-6 flex flex-col gap-3 hover:shadow-xl transition duration-200"
        >
          <FaLinkedin className="text-purple" size={22} />
          <div>
            <h2 className="font-bold">LinkedIn</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Connect with Tapiwa Muranda
            </p>
          </div>
        </a>
      </div>

      <div className="pb-20">
        <a href={`mailto:${siteConfig.email}`}>
          <MagicButton
            title="Start the Conversation"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>
    </PageShell>
  );
};

export default ContactPage;
