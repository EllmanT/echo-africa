import Link from "next/link";
import type { Metadata } from "next";
import { FaArrowRight } from "react-icons/fa6";

import PageShell from "@/components/PageShell";
import Breadcrumbs from "@/components/Breadcrumbs";
import Checklist, { type ChecklistGroup } from "@/components/funnel/Checklist";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Website Launch Checklist for Zimbabwean Businesses",
  description:
    "A free, tick-off checklist for putting your business online properly: domain, phone-friendly pages, getting found on Google and going live without mistakes.",
  path: "/resources/launch-checklist",
  keywords: ["website checklist Zimbabwe", "how to launch a business website", "get my business online Zimbabwe"],
});

const groups: ChecklistGroup[] = [
  {
    title: "1. Get the basics ready",
    items: [
      "Write one short line about what your business does and who it is for.",
      "Register a domain name in your business name (.co.zw or .com).",
      "Set up an email address on your domain, like info@yourbusiness.co.zw.",
      "Collect your logo, your best photos and your prices in one folder.",
    ],
  },
  {
    title: "2. Make it work on phones",
    items: [
      "Open the site on a real phone using mobile data, not only on wifi.",
      "Compress your photos before you upload them, so pages open fast.",
      "Make your phone number and WhatsApp button one tap to use.",
      "Check that the text is easy to read without zooming.",
    ],
  },
  {
    title: "3. Make it easy to say yes",
    items: [
      "Put one clear next step at the top of every page: call, WhatsApp or ask for a quote.",
      "Show proof: real photos, real client names and short reviews (with permission).",
      "Say what you charge, or explain how you quote.",
      "Answer the questions customers always ask, in a short list.",
    ],
  },
  {
    title: "4. Get found on Google",
    items: [
      "Create a free Google Business Profile with the same name, address and phone number as your website.",
      "Put your service and your city in your page titles, like \"Used cars in Harare\".",
      "Connect Google Search Console and submit your sitemap.",
      "Add Google Analytics so you can see who visits.",
    ],
  },
  {
    title: "5. Before you go live",
    items: [
      "Read every page for spelling mistakes and wrong phone numbers.",
      "Check the address starts with https and shows the padlock.",
      "Send yourself a message through your contact form or WhatsApp button to test it.",
      "Know who to call if the site breaks, and make sure it is backed up.",
    ],
  },
  {
    title: "6. After you launch",
    items: [
      "Share the link on Facebook and your WhatsApp status.",
      "Ask three happy customers to leave you a Google review.",
      "Look at your visitor numbers once a week and fix what is not working.",
    ],
  },
];

const ChecklistPage = () => (
  <PageShell>
    <Breadcrumbs
      items={[
        { name: "Resources", path: "/resources/launch-checklist" },
        { name: "Website Launch Checklist", path: "/resources/launch-checklist" },
      ]}
    />

    <section className="mx-auto max-w-3xl pb-6 pt-14 text-center md:pt-20">
      <div className="animate-rise">
        <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
          The Website Launch <span className="text-purple">Checklist</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Everything to sort out before your business goes online. Tick things off as you go. It is free.
        </p>
      </div>
    </section>

    <div className="mx-auto max-w-3xl pb-16">
      <Checklist groups={groups} />

      <div className="mt-16 rounded-3xl bg-foreground px-7 py-10 text-center text-background md:px-12">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">Want us to do this for you?</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-background/70">
          We build it first. You pay only when you love it.
        </p>
        <Link
          href="/contact"
          className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-base font-medium text-foreground transition-[background-color,color,transform] duration-200 ease-out-strong hover:bg-purple hover:text-white active:scale-[0.97]"
        >
          Start the conversation
          <FaArrowRight size={13} className="transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  </PageShell>
);

export default ChecklistPage;
