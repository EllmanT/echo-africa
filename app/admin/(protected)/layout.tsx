import AdminSidebar from "@/components/admin/AdminSidebar";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden p-6 md:p-10">{children}</main>
    </div>
  );
}
