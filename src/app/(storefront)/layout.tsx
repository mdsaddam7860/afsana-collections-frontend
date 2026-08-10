import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

// Chrome for every customer-facing route (home, shop, product, checkout,
// account). The (storefront) group prefix doesn't affect URLs — /shop is
// still /shop — it only scopes this layout to these routes so none of it
// leaks into app/(admin).
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
