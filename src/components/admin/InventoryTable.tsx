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

const STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

// Small helper so mobile cards show a "Label: value" pair while the
// same markup collapses to plain table cells at md+. Using CSS display
// utilities (table/table-row/table-cell) rather than two parallel
// markups keeps state and handlers in one place.
function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-3 ${className}`}
    >
      <span className="font-mono-price text-[10px] uppercase tracking-widest text-muted md:hidden">
        {label}
      </span>
      <span className="text-right md:text-left">{children}</span>
    </div>
  );
}

export default function InventoryTable({
  products: initialProducts,
}: {
  products: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const initialStock = Object.fromEntries(
    initialProducts.flatMap((p) => p.variants.map((v) => [v.id, v.stockQuantity]))
  );
  const [stock, setStock] = useState<Record<string, number>>(initialStock);
  // Tracks which variantIds have an unsaved stock edit, so "Save all"
  // only sends rows that actually changed rather than every row.
  const [savedStock, setSavedStock] = useState<Record<string, number>>(initialStock);
  const dirtyIds = Object.keys(stock).filter((id) => stock[id] !== savedStock[id]);

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
    setSavedStock((s) => ({ ...s, [variantId]: stock[variantId] }));
    toast.success("Stock updated.");
  };

  // Batches every row with an unsaved stock edit into one bulk PATCH
  // (see updateVariantStockBulk in admin-api.ts) instead of one
  // request per row.
  const handleSaveAll = async () => {
    if (dirtyIds.length === 0) return;
    setSavingAll(true);
    const updates = dirtyIds.map((variantId) => ({
      variantId,
      stockQuantity: stock[variantId],
    }));
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    }).catch(() => null);
    setSavingAll(false);
    if (!res || !res.ok) {
      toast.error("Couldn't save changes.");
      return;
    }
    setSavedStock((s) => {
      const next = { ...s };
      for (const { variantId, stockQuantity } of updates) {
        next[variantId] = stockQuantity;
      }
      return next;
    });
    toast.success(
      `Saved ${updates.length} ${updates.length === 1 ? "row" : "rows"}.`
    );
  };

  // PATCH /admin/products/:id — lets an admin publish a DRAFT, archive
  // a live product, or pull an ARCHIVED one back to DRAFT, without
  // needing the delete-and-recreate workaround this screen used to
  // require.
  const handleStatusChange = async (productId: string, status: ProductStatus) => {
    setSavingStatus(productId);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    setSavingStatus(null);
    if (!res || !res.ok) {
      toast.error("Couldn't update status.");
      return;
    }
    setProducts((ps) =>
      ps.map((p) => (p.id === productId ? { ...p, status } : p))
    );
    toast.success("Status updated.");
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
          {dirtyIds.length > 0
            ? `${dirtyIds.length} unsaved ${dirtyIds.length === 1 ? "change" : "changes"}`
            : "No unsaved changes"}
        </p>
        <button
          onClick={handleSaveAll}
          disabled={dirtyIds.length === 0 || savingAll}
          className="btn-fill rounded-pill border border-accent px-5 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {savingAll ? "Saving…" : `Save all${dirtyIds.length ? ` (${dirtyIds.length})` : ""}`}
        </button>
      </div>
      <div className="rounded-soft border border-border md:overflow-x-auto">
        <div className="flex flex-col divide-y divide-border md:table md:w-full md:min-w-[720px] md:divide-y-0 md:text-left md:text-sm">
          <div className="hidden bg-surface font-mono-price text-[10px] uppercase tracking-widest text-muted md:table-header-group">
            <div className="md:table-row">
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Product</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Category</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Status</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Variant</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">SKU</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal">Stock</span>
              <span className="md:table-cell md:px-5 md:py-3 md:font-normal"></span>
            </div>
          </div>
          <div className="md:table-row-group">
            {products.map((product) =>
              product.variants.map((variant, i) => (
                <div
                  key={variant.id}
                  className={`px-4 py-3 md:table-row md:border-b md:border-border md:px-0 md:py-0 md:last:border-0 ${
                    i === 0 ? "bg-surface/40 md:bg-transparent" : ""
                  }`}
                >
                  {i === 0 && (
                    <div className="mb-1 flex items-center justify-between gap-3 md:hidden">
                      <span className="font-display text-base italic text-foreground">
                        {product.name}
                      </span>
                      <select
                        value={product.status}
                        onChange={(e) =>
                          handleStatusChange(product.id, e.target.value as ProductStatus)
                        }
                        disabled={savingStatus === product.id}
                        className={`rounded-sharp border border-border bg-transparent px-2 py-1 font-mono-price text-[10px] uppercase tracking-widest disabled:opacity-40 ${STATUS_STYLES[product.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-surface">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Field label="Product">
                    {i === 0 ? (
                      <span className="hidden font-display italic text-foreground md:inline">
                        {product.name}
                      </span>
                    ) : (
                      <span className="hidden md:inline"></span>
                    )}
                  </Field>
                  <Field label="Category">
                    <span className="text-muted">
                      {i === 0 ? product.category.name : ""}
                    </span>
                  </Field>
                  <Field label="Status">
                    {i === 0 ? (
                      <select
                        value={product.status}
                        onChange={(e) =>
                          handleStatusChange(product.id, e.target.value as ProductStatus)
                        }
                        disabled={savingStatus === product.id}
                        className={`hidden rounded-sharp border border-border bg-transparent px-2 py-1 font-mono-price text-xs uppercase disabled:opacity-40 md:inline-block ${STATUS_STYLES[product.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-surface">
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </Field>
                  <Field label="Variant">
                    <span className="text-muted">
                      {variant.variantName}
                      {variant.attributes.color ? ` · ${variant.attributes.color}` : ""}
                    </span>
                  </Field>
                  <Field label="SKU">
                    <span className="font-mono-price text-xs text-muted">{variant.sku}</span>
                  </Field>
                  <Field label="Stock">
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
                        stock[variant.id] !== savedStock[variant.id]
                          ? "border-accent ring-1 ring-accent/40"
                          : stock[variant.id] === 0
                          ? "border-accent text-accent"
                          : stock[variant.id] <= 5
                          ? "border-accent/50 text-foreground"
                          : "border-border text-foreground"
                      }`}
                    />
                  </Field>
                  <div className="mt-2 flex items-center gap-4 md:table-cell md:mt-0 md:px-5 md:py-3">
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
                        {deleting === product.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
