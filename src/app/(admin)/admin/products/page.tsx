import { getServerSession } from "next-auth";
import InventoryTable from "@/components/admin/InventoryTable";
import NewProductForm from "@/components/admin/NewProductForm";
import { getAdminProducts } from "@/lib/admin-api";
import { authOptions } from "@/lib/auth";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  const accessToken =
    (session as unknown as { accessToken?: string })?.accessToken ?? "";
  const products = await getAdminProducts(accessToken);
  const activeCount = products.filter((p) => p.status === "ACTIVE").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-muted">
            {products.length} products ({activeCount} active) · stock levels
            below 5 are flagged.
          </p>
        </div>
        <NewProductForm />
      </div>

      <div className="mt-8">
        <InventoryTable products={products} />
      </div>
    </div>
  );
}
