"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaArrowRightFromBracket, FaArrowUpRightFromSquare } from "react-icons/fa6";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/playbook", label: "Playbook" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/settings", label: "Settings" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-black/[0.08] bg-white px-4 py-6">
      <Link href="/admin" className="px-2 font-display text-lg font-bold tracking-tight">
        Eka Admin
      </Link>

      <nav aria-label="Admin sections" className="mt-8 flex-1 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                active ? "bg-purple/10 text-purple" : "text-neutral-600 hover:bg-black/[0.04] hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-black/[0.08] pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-purple"
        >
          View site <FaArrowUpRightFromSquare size={11} />
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          <FaArrowRightFromBracket size={13} /> Log out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
