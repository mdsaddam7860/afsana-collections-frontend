import AdminSidebar from "@/components/admin/AdminSidebar";

// Separate shell from app/(storefront)/layout.tsx — no Navbar, Footer,
// or CartDrawer here. Access is already enforced upstream by
// middleware.ts (role check happens at the edge, before this renders),
// so this layout only needs to handle presentation.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  );
}
