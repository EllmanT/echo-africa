import { FaLocationArrow } from "react-icons/fa6";
import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import MagicButton from "@/components/MagicButton";
import Experience from "@/components/Experience";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Eka is founded by Tapiwa Muranda, a full-stack developer and AI practitioner based in Harare, Zimbabwe, building websites, custom software, and AI automation for African businesses.",
  path: "/about",
  keywords: ["Tapiwa Muranda", "Eka founder", "software developer Zimbabwe"],
});

const AboutPage = () => {
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "About", path: "/about" }]} />

      <div className="py-14 max-w-3xl">
        <h1 className="heading text-left">
          About <span className="text-purple">Eka</span>
        </h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          Eka is a {siteConfig.city}-based web development and AI automation
          agency, founded by Tapiwa Muranda — a full-stack developer and AI
          practitioner working with businesses across Zimbabwe and Africa.
        </p>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          Before founding Eka, Tapiwa worked in full-stack development and AI
          automation at Axis Solutions, and is JS Mastery certified. That
          background shows up in how Eka works: modern tools (Next.js,
          TypeScript, AI automation with n8n), applied to real business
          problems — not templates dressed up as custom work.
        </p>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          Eka operates on a zero-risk model: we build your website, logo, or
          AI system first, and you only pay once you&apos;re satisfied with the
          result.
        </p>
        <a href="mailto:tmuranda1@gmail.com">
          <MagicButton
            title="Start the Conversation"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      <Experience />
    </PageShell>
  );
};

export default AboutPage;
