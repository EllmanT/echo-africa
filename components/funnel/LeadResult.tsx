"use client";

import Link from "next/link";
import { FaArrowRight, FaWhatsapp } from "react-icons/fa6";

import { siteConfig } from "@/lib/seo/site";
import { track } from "@/lib/analytics/track";
import type { LeadTier } from "@/lib/leads/types";

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

const waHref = (text: string) => `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;

const LeadResult = ({
  tier,
  name,
  email,
  businessName,
}: {
  tier: LeadTier;
  name: string;
  email: string;
  businessName: string;
}) => {
  const first = firstName(name);

  if (tier === "nurture") {
    return (
      <div aria-live="polite">
        <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
          Thanks, {first}. Not the right fit <span className="text-purple">yet.</span>
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          I&apos;d rather be honest than waste your time. A custom build is probably beyond this budget for now. I&apos;ve emailed
          you something useful to do in the meantime, and both of these are free.
        </p>

        <ul className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
          <li>
            <Link
              href="/resources/launch-checklist"
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-purple"
            >
              <span>
                <span className="block text-lg font-semibold">The Website Launch Checklist</span>
                <span className="block text-sm text-muted-foreground">Everything to sort before you go online.</span>
              </span>
              <FaArrowRight className="shrink-0 transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
            </Link>
          </li>
          <li>
            <Link
              href="/playbook"
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-purple"
            >
              <span>
                <span className="block text-lg font-semibold">The Playbook</span>
                <span className="block text-sm text-muted-foreground">Free tips on websites and AI, every day.</span>
              </span>
              <FaArrowRight className="shrink-0 transition-transform duration-200 ease-out-strong group-hover:translate-x-1" />
            </Link>
          </li>
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          When your budget grows, come back. The offer stays the same: we build it first, and you pay only when you love it.
        </p>
      </div>
    );
  }

  const calSrc = `${siteConfig.calUrl}?embed=true&theme=light&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
  const message = `Hi Tapiwa, it's ${name} from ${businessName}. I just sent my request on eka.dev.`;

  return (
    <div aria-live="polite">
      <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
        You&apos;re a fit, {first}. <span className="text-purple">Let&apos;s talk.</span>
      </h2>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        Pick a time below and we&apos;ll go through your project together. I&apos;ve also sent a confirmation to {email}.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-black/[0.1] bg-white">
        <iframe
          title="Book a call with Tapiwa"
          src={calSrc}
          loading="lazy"
          className="h-[720px] w-full border-0"
        />
      </div>

      <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <a
          href={waHref(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click")}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-black/[0.14] bg-white px-6 text-base font-medium transition-[border-color,color,transform] duration-200 ease-out-strong hover:border-purple/50 hover:text-purple active:scale-[0.97]"
        >
          <FaWhatsapp size={18} className="text-[#25D366]" />
          Prefer WhatsApp? Message me
        </a>
        <a
          href={siteConfig.calUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("booking_click")}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-purple"
        >
          Calendar not loading? Open it in a new tab
        </a>
      </div>
    </div>
  );
};

export default LeadResult;
