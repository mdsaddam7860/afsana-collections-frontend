"use client";

import { useState } from "react";
import { toast } from "@/store/toast-store";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Product, ProductStatus } from "@/types";

const STATUS_STYLES: Record<ProductStatus, string> = {
  ACTIVE: "text-foreground",
  DRAFT: "text-muted",
  ARCHIVED: "text-muted line-through",
};

export default function InventoryTable({
  products: initialProducts,
}: {
  products: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      initialProducts.flatMap((p) =>
        p.variants.map((v) => [v.id, v.stockQuantity])
      )
    )
  );

  const handleSave = async (variantId: string) => {
    setSaving(variantId);
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, stockQuantity: stock[variantId] }),
    }).catch(() => null);
    setSaving(null);
    if (!res || !res.ok) {
      toast.error("Couldn't update stock.");
      return;
    }
    toast.success("Stock updated.");
  };

  // Soft delete — the product disappears from listings but isn't
  // destroyed server-side (see prisma schema: deletedAt + status ->
  // ARCHIVED, order history stays intact).
  const handleDeleteProduct = async () => {
    if (!confirmingDelete) return;
    const { id: productId, name } = confirmingDelete;
    setDeleting(productId);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    setDeleting(null);
    setConfirmingDelete(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error || "Couldn't delete this product.");
      return;
    }
    toast.success(`${name} deleted.`);
    setProducts((p) => p.filter((prod) => prod.id !== productId));
  };

  return (
    <div>
      <p className="mb-3 font-mono-price text-[10px] uppercase tracking-widest text-muted">
        Only ACTIVE products are listed here — this backend has no admin-only
        product list endpoint, so DRAFT and ARCHIVED products aren&apos;t
        retrievable from this screen.
      </p>
      <div className="overflow-x-auto rounded-soft border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface font-mono-price text-[10px] uppercase tracking-widest text-muted">
              <th className="px-5 py-3 font-normal">Product</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Variant</th>
              <th className="px-5 py-3 font-normal">SKU</th>
              <th className="px-5 py-3 font-normal">Stock</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
              product.variants.map((variant, i) => (
                <tr
                  key={variant.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-5 py-3 text-foreground">
                    {i === 0 ? (
                      <span className="font-display italic">
                        {product.name}
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {i === 0 ? product.category.name : ""}
                  </td>
                  <td
                    className={`px-5 py-3 font-mono-price text-xs uppercase ${
                      STATUS_STYLES[product.status]
                    }`}
                  >
                    {i === 0 ? product.status : ""}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {variant.variantName}
                    {variant.attributes.color
                      ? ` · ${variant.attributes.color}`
                      : ""}
                  </td>
                  <td className="px-5 py-3 font-mono-price text-xs text-muted">
                    {variant.sku}
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min={0}
                      value={stock[variant.id]}
                      onChange={(e) =>
                        setStock((s) => ({
                          ...s,
                          [variant.id]: Number(e.target.value),
                        }))
                      }
                      className={`w-20 rounded-sharp border bg-transparent px-2 py-1 font-mono-price text-sm ${
                        stock[variant.id] === 0
                          ? "border-accent text-accent"
                          : stock[variant.id] <= 5
                          ? "border-accent/50 text-foreground"
                          : "border-border text-foreground"
                      }`}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleSave(variant.id)}
                        disabled={saving === variant.id}
                        className="font-mono-price text-[11px] uppercase tracking-widest text-accent hover:opacity-70 disabled:opacity-40"
                      >
                        {saving === variant.id ? "Saving…" : "Save"}
                      </button>
                      {i === 0 && (
                        <button
                          onClick={() =>
                            setConfirmingDelete({
                              id: product.id,
                              name: product.name,
                            })
                          }
                          disabled={deleting === product.id}
                          className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent disabled:opacity-40"
                        >
                          {deleting === product.id
                            ? "Deleting…"
                            : "Delete product"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmingDelete}
        title={`Delete "${confirmingDelete?.name}"?`}
        description="This can't be undone."
        confirmLabel="Delete product"
        busy={!!deleting}
        onConfirm={handleDeleteProduct}
        onCancel={() => setConfirmingDelete(null)}
      />
    </div>
  );
}
