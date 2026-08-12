import type { Discount, Order, Product, ProductStatus, Variant } from "@/types";
import { getAllProducts, unwrapList, unwrapObject } from "@/lib/api";
import { apiFetch } from "@/lib/http";

// Deliberately separate from lib/api.ts: this file is for writes and
// cross-customer reads (all inventory, all orders) — operations a
// storefront page should never be able to call. Keeping the boundary
// as a separate module (not just separate functions in the same file)
// means it's easy to later point this at an internal-only API route or
// a different backend host with elevated permissions, without touching
// customer-facing code at all.
//
// Every function here requires an admin accessToken — the middleware.ts
// role check happens at the edge, but these calls hit the Express API
// directly and it re-checks role server-side too (belt-and-suspenders).

// GET /admin/products?limit=... — this IS in the Postman collection
// ("[Admin] List all products (incl. DRAFT/ARCHIVED)") even though it
// was previously assumed missing. Unlike the public listProducts(),
// this doesn't filter to ACTIVE-only, so drafts/archived/soft-deleted
// products are visible to admins here.
export async function getAdminProducts(accessToken: string): Promise<Product[]> {
  const raw = await apiFetch<unknown>("/admin/products?limit=100", {
    accessToken,
  });
  return unwrapList<Product>(raw);
}

// Kept for backwards compatibility with existing call sites — now a
// thin wrapper over the real admin-scoped listing instead of the
// public ACTIVE-only one. Requires an accessToken now; call sites that
// don't have one should switch to getAdminProducts directly.
export async function getInventory(accessToken: string): Promise<Product[]> {
  return getAdminProducts(accessToken);
}

// PATCH /admin/products/:id — general product update (status, images,
// name, description, basePrice, tags, categoryId). Used for things
// like publishing a DRAFT, archiving a product, or attaching images
// after a Cloudinary upload confirms. Partial — only send changed
// fields, matches updateProductSchema (also .strict() on the backend).
export interface UpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  status?: ProductStatus;
  images?: string[];
  tags?: string[];
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
  accessToken: string
): Promise<Product> {
  const raw = await apiFetch<unknown>(`/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    accessToken,
  });
  return unwrapObject<Product>(raw);
}

// The backend's inventory PATCH is bulk: PATCH /admin/products/:variantId/inventory
// with body { updates: [{ variantId, stockQuantity }] }. Kept as a
// single-variant helper for callers that just tweak one row, but it
// still sends the array shape the API expects; batch multiple edits
// with updateVariantStockBulk below to avoid one request per row.
export async function updateVariantStock(
  variantId: string,
  stockQuantity: number,
  accessToken: string
): Promise<Pick<Variant, "id" | "stockQuantity">> {
  await apiFetch<void>(`/admin/products/${variantId}/inventory`, {
    method: "PATCH",
    body: JSON.stringify({ updates: [{ variantId, stockQuantity }] }),
    accessToken,
  });
  // The bulk PATCH only returns { updated: <count> } (see
  // product.routes.ts) — no updated variant fields come back, so this
  // is deliberately a partial Variant, not the full shape.
  return { id: variantId, stockQuantity };
}

export async function updateVariantStockBulk(
  updates: { variantId: string; stockQuantity: number }[],
  accessToken: string
): Promise<void> {
  // Note: the endpoint path itself contains a :variantId segment even
  // though the body carries an updates[] array — confirm with the
  // backend whether that path param is required/ignored for a bulk
  // call, or whether this needs one request per unique variant.
  const [first, ...rest] = updates;
  if (!first) return;
  await apiFetch<void>(`/admin/products/${first.variantId}/inventory`, {
    method: "PATCH",
    body: JSON.stringify({ updates }),
    accessToken,
  });
  void rest;
}

export async function approveReturn(
  orderId: string,
  accessToken: string
): Promise<Order> {
  const raw = await apiFetch<unknown>(`/admin/orders/${orderId}/return/approve`, {
    method: "POST",
    accessToken,
  });
  return unwrapObject<Order>(raw);
}

// Mirrors approveReturn's path convention (/return/reject alongside
// /return/approve) — confirm this exact path against your backend if
// it 404s; it wasn't in the original Postman collection but the brief
// confirms a reject action now exists.
export async function rejectReturn(
  orderId: string,
  accessToken: string
): Promise<Order> {
  const raw = await apiFetch<unknown>(`/admin/orders/${orderId}/return/reject`, {
    method: "POST",
    accessToken,
  });
  return unwrapObject<Order>(raw);
}

export interface DiscountInput {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimitGlobal?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  isActive?: boolean;
}

export async function listDiscounts(
  accessToken: string,
  page = 1,
  pageSize = 20
): Promise<Discount[]> {
  const raw = await apiFetch<unknown>(
    `/admin/discounts?page=${page}&pageSize=${pageSize}`,
    { accessToken }
  );
  return unwrapList<Discount>(raw);
}

export async function getDiscount(
  discountId: string,
  accessToken: string
): Promise<Discount> {
  const raw = await apiFetch<unknown>(`/admin/discounts/${discountId}`, {
    accessToken,
  });
  return unwrapObject<Discount>(raw);
}

export async function createDiscount(
  input: DiscountInput,
  accessToken: string
): Promise<Discount> {
  const raw = await apiFetch<unknown>("/admin/discounts", {
    method: "POST",
    body: JSON.stringify({
      applicableCategories: [],
      applicableProducts: [],
      isActive: true,
      ...input,
    }),
    accessToken,
  });
  return unwrapObject<Discount>(raw);
}

export async function updateDiscount(
  discountId: string,
  input: Partial<DiscountInput>,
  accessToken: string
): Promise<Discount> {
  const raw = await apiFetch<unknown>(`/admin/discounts/${discountId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    accessToken,
  });
  return unwrapObject<Discount>(raw);
}

// Backend has no hard-delete for discounts — DELETE deactivates
// (isActive: false) rather than removing the row, per the collection
// naming "[Admin] Deactivate Discount".
export async function deactivateDiscount(
  discountId: string,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/admin/discounts/${discountId}`, {
    method: "DELETE",
    accessToken,
  });
}
// Matches createProductVariantSchema in product.routes.ts exactly.
export interface CreateProductVariantInput {
  sku: string;
  variantName: string;
  attributes?: Record<string, string>; // {color, size, material}
  priceAdjustment?: number;
  stockQuantity?: number;
  weightGrams?: number;
  barcode?: string;
  isActive?: boolean;
}

// Matches createProductSchema in product.routes.ts exactly — the
// backend uses .strict(), so any extra key (e.g. the old "price" or
// "material") causes a 400, not a silently-ignored field.
export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  categoryId: string; // must be a real category UUID — see getCategories() below
  status?: ProductStatus;
  images?: string[]; // full URLs — z.string().url() on the backend, filenames will 400
  tags?: string[];
  variants?: CreateProductVariantInput[];
}

export async function createProduct(
  input: CreateProductInput,
  accessToken: string
): Promise<Product> {
  const raw = await apiFetch<unknown>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
    accessToken,
  });
  return unwrapObject<Product>(raw);
}

export interface SignedUploadParams {
  timestamp: number;
  folder: string;
  allowed_formats: string;
  max_file_size: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadUrl: string;
}

// POST /admin/upload/sign — see media.service.ts's createSignedUploadParams.
// Requires an existing productId; there is no way to sign an upload before
// the product row exists, so image upload always happens after product
// creation, not as part of the same create-product payload.
export async function signMediaUpload(
  productId: string,
  accessToken: string
): Promise<SignedUploadParams> {
  const raw = await apiFetch<unknown>("/admin/upload/sign", {
    method: "POST",
    body: JSON.stringify({ productId }),
    accessToken,
  });
  return unwrapObject<SignedUploadParams>(raw);
}

// POST /admin/upload/confirm — called after the browser's direct upload to
// Cloudinary succeeds, so the backend can verify the asset via Cloudinary's
// Admin API and persist a Media row. Returns the created Media record.
export async function confirmMediaUpload(
  publicId: string,
  productId: string,
  accessToken: string
): Promise<{ id: string; url: string }> {
  const raw = await apiFetch<unknown>("/admin/upload/confirm", {
    method: "POST",
    body: JSON.stringify({ publicId, productId }),
    accessToken,
  });
  return unwrapObject<{ id: string; url: string }>(raw);
}

export async function deleteMedia(
  mediaId: string,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/admin/media/${mediaId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function deleteProduct(
  productId: string,
  accessToken: string
): Promise<void> {
  // Soft delete — the product is hidden from listings but not
  // destroyed server-side. Nothing extra to do here on the frontend
  // beyond removing it from the local table (InventoryTable does that
  // optimistically after this call succeeds).
  await apiFetch<void>(`/admin/products/${productId}`, {
    method: "DELETE",
    accessToken,
  });
}

export interface Category {
  id: string;
  slug: string;
  label: string;
  isActive?: boolean;
}

// GET /categories is a real, public, unauthenticated endpoint on this
// backend (see the Postman collection's "Categories / List categories")
// — no accessToken required. Returns every category regardless of
// whether it has products yet, which the old derive-from-products
// workaround couldn't do for brand-new empty categories.
export async function getCategories(): Promise<Category[]> {
  const raw = await apiFetch<unknown>("/categories");
  const list = unwrapList<{ id: string; slug: string; name: string; isActive?: boolean }>(raw);
  return list.map((c) => ({
    id: c.id,
    slug: c.slug,
    label: c.name,
    isActive: c.isActive,
  }));
}

export interface CategoryInput {
  name: string;
  slug: string;
}

export async function createCategory(
  input: CategoryInput,
  accessToken: string
): Promise<Category> {
  const raw = await apiFetch<unknown>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
    accessToken,
  });
  const c = unwrapObject<{ id: string; slug: string; name: string; isActive?: boolean }>(raw);
  return { id: c.id, slug: c.slug, label: c.name, isActive: c.isActive };
}

export async function updateCategory(
  categoryId: string,
  input: Partial<CategoryInput>,
  accessToken: string
): Promise<Category> {
  const raw = await apiFetch<unknown>(`/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    accessToken,
  });
  const c = unwrapObject<{ id: string; slug: string; name: string; isActive?: boolean }>(raw);
  return { id: c.id, slug: c.slug, label: c.name, isActive: c.isActive };
}

// Postman labels this "[Admin] Deactivate category" (not a hard
// delete) — mirrors the discount code's isActive:false soft-disable.
export async function deactivateCategory(
  categoryId: string,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/admin/categories/${categoryId}`, {
    method: "DELETE",
    accessToken,
  });
}

// Admin order listing — separate from the customer-scoped GET /orders,
// this returns every order across all customers. `status` filters
// server-side to one OrderStatus value (e.g. "PROCESSING") — omit for
// every status.
export async function getAllOrders(
  accessToken: string,
  status?: string
): Promise<Order[]> {
  const params = new URLSearchParams({ page: "1", pageSize: "20" });
  if (status) params.set("status", status);
  const raw = await apiFetch<unknown>(`/admin/orders?${params.toString()}`, {
    accessToken,
  });
  return unwrapList<Order>(raw);
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  accessToken: string
): Promise<{ id: string; status: Order["status"] }> {
  const raw = await apiFetch<unknown>(
    `/admin/orders/${orderId}/status`,
    { method: "PATCH", body: JSON.stringify({ status }), accessToken }
  );
  return unwrapObject<{ id: string; status: Order["status"] }>(raw);
}