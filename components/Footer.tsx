import { FaLocationArrow } from "react-icons/fa6";

import { socialMedia } from "@/data";
import MagicButton from "./MagicButton";
import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { name: "Services", href: "/services" },
  { name: "Work", href: "/work" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="w-full pt-20 pb-10" id="contact">
      {/* background grid */}
      {/*  */}
      <div className="w-full absolute left-0 -bottom-72 min-h-96">
        <img
          src="/footer-grid.svg"
          alt=""
          className="w-full h-full opacity-20 "
        />
      </div>

      <div className="flex flex-col items-center">
        <h2 className="heading lg:max-w-[45vw]">
          Ready to Get Your Business{" "}
          <span className="text-purple">Online, Properly?</span>
        </h2>
        <p className="text-muted-foreground md:mt-10 my-5 text-center">
          Start for free. Pay only when you love it. No upfront fees.
        </p>
        <a href="mailto:tmuranda1@gmail.com">
          <MagicButton
            title="Start the Conversation"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-16 text-sm text-muted-foreground">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-purple transition-colors">
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex mt-8 md:flex-row flex-col justify-between items-center">
        <p className="md:text-base text-sm md:font-normal font-light">
          Eka. Only when you love it.
        </p>

        <div className="flex items-center md:gap-3 gap-6">
          {socialMedia.map((info) => (
            <div
              key={info.id}
              className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-white/70 rounded-lg border border-black/5 shadow-sm"
            >
              <a href={info.link} target="_blank">
                <Image src={info.img} alt="LinkedIn" width={20} height={20} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
