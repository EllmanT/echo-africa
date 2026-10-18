import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// Middleware also guards /admin, but the layout re-checks the session so a middleware bypass cannot expose the CMS.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await verifySessionToken(cookies().get(ADMIN_COOKIE)?.value))) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden p-6 md:p-10">{children}</main>
    </div>
  );
}
