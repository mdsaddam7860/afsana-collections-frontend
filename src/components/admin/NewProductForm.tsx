"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/admin-api";
import type { ProductStatus } from "@/types";
import { toast } from "@/store/toast-store";
import { useDialogA11y } from "@/hooks/useDialogA11y";

export default function NewProductForm() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    status: "DRAFT" as ProductStatus,
    categoryId: "",
    tags: "",
    // First variant
    variantName: "",
    sku: "",
    color: "",
    size: "",
    material: "",
    priceAdjustment: 0,
    stockQuantity: 10,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const dialogRef = useDialogA11y(showForm, () => {
    setShowForm(false);
    setImageFiles([]);
  });

  useEffect(() => {
    if (!showForm || categories) return;
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [showForm, categories]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setUploadStatus(null);
    if (!form.categoryId) {
      setSaving(false);
      setError(
        "Choose a category — the backend 400s without a real categoryId."
      );
      return;
    }
    if (!form.sku || !form.variantName) {
      setSaving(false);
      setError("SKU and variant name are required for the first variant.");
      return;
    }

    const attributes: Record<string, string> = {};
    if (form.color) attributes.color = form.color;
    if (form.size) attributes.size = form.size;
    if (form.material) attributes.material = form.material;

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().trim().replace(/\s+/g, "-"),
      description: form.description || undefined,
      basePrice: Number(form.basePrice),
      status: form.status,
      categoryId: form.categoryId,
      // Images are attached in a second step below, once the product
      // has a real id — the backend's signed-upload flow requires an
      // existing productId, so it can't be part of this create call.
      images: [],
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      variants: [
        {
          sku: form.sku,
          variantName: form.variantName,
          attributes,
          priceAdjustment: Number(form.priceAdjustment) || 0,
          stockQuantity: Number(form.stockQuantity),
        },
      ],
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create product.");
      }
      const product = await res.json();

      // Upload each selected image, one at a time, now that the product
      // has a real id: sign -> upload straight to Cloudinary from the
      // browser -> confirm with our backend so it writes a Media row.
      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        setUploadStatus(`Uploading image ${i + 1} of ${imageFiles.length}…`);
        const file = imageFiles[i];

        const signRes = await fetch("/api/admin/media/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!signRes.ok) {
          throw new Error(`Couldn't get an upload URL for "${file.name}".`);
        }
        const signed = await signRes.json();

        // Client-side size check against the same limit the backend
        // used when it built the signature — this is enforced here,
        // NOT by sending max_file_size to Cloudinary (see below).
        if (file.size > signed.max_file_size) {
          const limitMb = (signed.max_file_size / (1024 * 1024)).toFixed(1);
          throw new Error(`"${file.name}" is over the ${limitMb}MB limit.`);
        }

        // IMPORTANT: only send params that were actually part of the
        // signed string the backend returned (timestamp, folder,
        // allowed_formats — see signed.signature). Cloudinary
        // recomputes the signature from whatever params are present in
        // THIS request and rejects it if that doesn't match exactly.
        // max_file_size is a client-side-only limit, never a signed
        // Cloudinary param — appending it here is what was causing
        // "Invalid Signature" for every upload.
        const cloudForm = new FormData();
        cloudForm.append("file", file);
        cloudForm.append("timestamp", String(signed.timestamp));
        cloudForm.append("signature", signed.signature);
        cloudForm.append("api_key", signed.apiKey);
        cloudForm.append("folder", signed.folder);
        cloudForm.append("allowed_formats", signed.allowed_formats);

        const cloudRes = await fetch(signed.uploadUrl, {
          method: "POST",
          body: cloudForm,
        });
        if (!cloudRes.ok) {
          const cloudBody = await cloudRes.json().catch(() => ({}));
          throw new Error(
            cloudBody.error?.message ||
              `Upload to Cloudinary failed for "${file.name}".`
          );
        }
        const cloudData = await cloudRes.json();

        const confirmRes = await fetch("/api/admin/media/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: cloudData.public_id,
            productId: product.id,
          }),
        });
        if (!confirmRes.ok) {
          throw new Error(`"${file.name}" uploaded but couldn't be confirmed.`);
        }
        const media = await confirmRes.json();
        uploadedUrls.push(media.url);
      }

      // Confirming a Media row doesn't make the photo show up anywhere
      // by itself — the product's own `images` array (what the
      // storefront actually reads from) still needs to be pushed via
      // PATCH /admin/products/:id once every upload has landed.
      if (uploadedUrls.length > 0) {
        setUploadStatus("Attaching images to product…");
        const patchRes = await fetch(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: uploadedUrls }),
        });
        if (!patchRes.ok) {
          throw new Error(
            "Images uploaded, but couldn't attach them to the product."
          );
        }
      }

      setShowForm(false);
      toast.success(`${form.name} created.`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create product."
      );
    } finally {
      setSaving(false);
      setUploadStatus(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="btn-fill rounded-pill border border-accent px-6 py-2.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground"
      >
        + New product
      </button>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowForm(false);
            setImageFiles([]);
          }}
        >
          <div
            ref={dialogRef as React.RefObject<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-product-heading"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-soft border border-border bg-background p-5 sm:p-6"
          >
            <h3
              id="new-product-heading"
              className="font-display text-xl italic text-foreground"
            >
              New product
            </h3>

            <div className="mt-5 space-y-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <input
                placeholder="Slug (auto-generated if blank)"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Base price (₹)"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      basePrice: Number(e.target.value),
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as ProductStatus,
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                >
                  <option value="DRAFT" className="bg-surface">
                    Draft
                  </option>
                  <option value="ACTIVE" className="bg-surface">
                    Active
                  </option>
                  <option value="ARCHIVED" className="bg-surface">
                    Archived
                  </option>
                </select>
              </div>

              <div>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground"
                >
                  <option value="" className="bg-surface">
                    {categories === null
                      ? "Loading categories…"
                      : "Select a category"}
                  </option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">
                      {c.label}
                    </option>
                  ))}
                </select>
                {categories?.length === 0 && (
                  <p className="mt-1 font-mono-price text-[10px] text-accent">
                    No categories found. This backend has no categories list
                    endpoint — this dropdown is built from categories already
                    used by existing products, so it&apos;s empty until at least
                    one product exists per category. Create the first product
                    for a new category directly via the backend/DB.
                  </p>
                )}
              </div>

              <div>
                <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                  Images
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(e) =>
                    setImageFiles(Array.from(e.target.files ?? []))
                  }
                  className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-sharp file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-foreground"
                />
                {imageFiles.length > 0 && (
                  <p className="mt-1 font-mono-price text-[10px] text-muted">
                    {imageFiles.length} file{imageFiles.length > 1 ? "s" : ""}{" "}
                    selected — uploaded to Cloudinary right after the product is
                    created.
                  </p>
                )}
              </div>
              <input
                placeholder="Tags, comma-separated (optional)"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                className="w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />

              <p className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                First variant
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Variant name (e.g. Small / Blush)"
                  value={form.variantName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, variantName: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <input
                  placeholder="SKU"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  placeholder="Color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, color: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <input
                  placeholder="Size"
                  value={form.size}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, size: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <input
                  placeholder="Material"
                  value={form.material}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, material: e.target.value }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price adjustment (± ₹, optional)"
                  value={form.priceAdjustment}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priceAdjustment: Number(e.target.value),
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stockQuantity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stockQuantity: Number(e.target.value),
                    }))
                  }
                  className="rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 font-mono-price text-xs text-accent"
              >
                {error}
              </p>
            )}
            {uploadStatus && !error && (
              <p className="mt-3 font-mono-price text-xs text-muted">
                {uploadStatus}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setImageFiles([]);
                }}
                className="font-mono-price text-xs uppercase tracking-widest text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="btn-fill rounded-pill border border-accent px-6 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
              >
                {saving ? uploadStatus ?? "Saving…" : "Save product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
