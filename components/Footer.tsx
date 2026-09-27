import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";

import FadeTypeCTA from "./FadeTypeCTA";
import { siteConfig } from "@/lib/seo/site";

const columns = [
  {
    title: "Services",
    links: [
      { name: "Websites", href: "/services/web-development" },
      { name: "AI automation", href: "/services/ai-automation" },
      { name: "Custom software", href: "/services/software-development" },
      { name: "Logos and brands", href: "/work" },
    ],
  },
  {
    title: "Work",
    links: [
      { name: "All projects", href: "/work" },
      { name: "Faramatsi Motors", href: "/work/faramatsi-motors" },
      { name: "Faramatsi Toyota", href: "/work/faramatsi-toyota" },
      { name: "Mosalex Group", href: "/work/mosalex-group" },
    ],
  },
  {
    title: "Learn",
    links: [
      { name: "The Playbook", href: "/playbook" },
      { name: "Website Launch Checklist", href: "/resources/launch-checklist" },
      { name: "Questions and answers", href: "/contact#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Start a project", href: "/contact" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: FaLinkedinIn },
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FaFacebookF },
  { label: "WhatsApp", href: siteConfig.social.whatsapp, Icon: FaWhatsapp },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: FaInstagram },
  { label: "X", href: siteConfig.social.x, Icon: FaXTwitter },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: FaYoutube },
  { label: "Email", href: `mailto:${siteConfig.email}`, Icon: FaEnvelope },
].filter((s) => Boolean(s.href));

const Footer = ({ showCta = true }: { showCta?: boolean }) => {
  return (
    <>
      {showCta && <FadeTypeCTA />}

      <footer className="w-full border-t border-black/[0.06] pb-8 pt-14">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/" aria-label="Eka home" className="inline-block">
              <Image src="/eka-wordmark.png" alt="Eka" width={760} height={255} className="h-9 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Websites, logos and AI systems for African businesses. We build it first. You pay only when you love it.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-neutral-700 transition-[color,border-color,transform] duration-200 hover:border-purple/40 hover:text-purple active:scale-[0.95]"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-purple"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] pt-6 text-sm text-muted-foreground md:flex-row">
          <p>&copy; 2026 EkaDev. Built by Eka.dev</p>
          <Link href="/admin" className="text-xs opacity-60 transition-opacity hover:opacity-100" rel="nofollow">
            Admin
          </Link>
        </div>
      </footer>
    </>
  );
};

export default Footer;
