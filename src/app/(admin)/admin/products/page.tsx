import InventoryTable from "@/components/admin/InventoryTable";
import NewProductForm from "@/components/admin/NewProductForm";
import { getInventory } from "@/lib/admin-api";

export default async function AdminProductsPage() {
  const products = await getInventory();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-fluid-h1 italic text-foreground">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-muted">
            {products.length} active products · stock levels below 5 are
            flagged. Draft and archived products aren&apos;t shown — this
            backend has no admin list endpoint that includes them.
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
