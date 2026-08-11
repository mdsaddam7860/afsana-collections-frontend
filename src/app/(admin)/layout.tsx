import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Every /admin/* page is private and behind auth — never indexable,
// regardless of any global robots.ts allow-rules (see app/robots.ts,
// which also explicitly disallows /admin as a second layer).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
