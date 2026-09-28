"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight, FaBars, FaXmark } from "react-icons/fa6";

import { headerCta, navItems } from "@/data";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { name: string; link: string; highlight?: boolean };

const isActive = (pathname: string, link: string) =>
  link === "/" ? pathname === "/" : pathname === link || pathname.startsWith(`${link}/`);

const CtaButton = ({ className }: { className?: string }) => (
  <Link
    href={headerCta.link}
    className={cn(
      "group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background",
      "transition-[background-color,transform] duration-200 ease-out-strong hover:bg-purple active:scale-[0.97]",
      className
    )}
  >
    {headerCta.name}
    <FaArrowRight
      size={12}
      className="transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5"
    />
  </Link>
);

const NavLink = ({
  item,
  pathname,
  onNavigate,
  className,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) => {
  const active = isActive(pathname, item.link);
  return (
    <Link
      href={item.link}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200",
        item.highlight ? "text-purple" : active ? "text-foreground" : "text-neutral-600 hover:text-foreground",
        className
      )}
    >
      <span className="relative">
        {item.name}
        {item.highlight && (
          <span
            aria-label="free"
            className="pointer-events-none absolute -right-[1.35rem] -top-2 rounded-full bg-purple px-1.5 py-[2px] text-[9px] font-bold uppercase leading-none tracking-wider text-white"
          >
            Free
          </span>
        )}
      </span>
    </Link>
  );
};

const SiteHeader = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[5000] transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-black/[0.06] bg-white/95 shadow-[0_1px_0_rgba(25,28,33,0.02)]"
          : "border-b border-transparent bg-white/0"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-10">
        <Link href="/" aria-label="Eka home" className="flex shrink-0 items-center">
          <Image
            src="/eka-wordmark.png"
            alt="Eka"
            width={760}
            height={255}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label="Main" className="flex items-center gap-7">
            {(navItems as NavItem[]).map((item) => (
              <NavLink key={item.link} item={item} pathname={pathname} />
            ))}
          </nav>
          <CtaButton />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CtaButton className="h-9 px-4" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-transform duration-150 active:scale-[0.95]"
              >
                <FaBars size={18} />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm font-semibold">Menu</SheetTitle>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-foreground"
                  >
                    <FaXmark size={18} />
                  </button>
                </SheetClose>
              </div>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <nav aria-label="Mobile" className="mt-6 flex flex-col">
                {(navItems as NavItem[]).map((item) => (
                  <NavLink
                    key={item.link}
                    item={item}
                    pathname={pathname}
                    onNavigate={() => setOpen(false)}
                    className="border-b border-black/[0.06] py-4 font-display text-2xl tracking-tight"
                  />
                ))}
              </nav>
              <div className="mt-auto pb-2">
                <p className="mb-3 text-sm text-muted-foreground">
                  We build it first. You pay only when you love it.
                </p>
                <CtaButton className="h-12 w-full text-base" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
