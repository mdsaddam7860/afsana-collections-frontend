// Matches prisma/schema.prisma's ProductVariant model exactly.
// attributes is a free-form JSON bag ({color, size, material, ...}) —
// nothing in it is guaranteed to exist, so every read must be optional.
// priceAdjustment/stockQuantity come back from Prisma Decimal/Int; Decimal
// fields serialize to strings over JSON (Prisma's Decimal.toJSON()), so
// priceAdjustment is typed as a string even though it's numeric data.
export interface VariantAttributes {
  color?: string;
  size?: string;
  material?: string;
  [key: string]: string | undefined;
}

export interface Variant {
  id: string;
  sku: string;
  variantName: string;
  attributes: VariantAttributes;
  priceAdjustment: string; // decimal string, e.g. "0.00"
  stockQuantity: number;
  weightGrams?: number | null;
  barcode?: string | null;
  isActive: boolean;
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

// Matches the backend's serializeProduct() in product.controller.ts.
// basePrice is a Prisma Decimal — arrives as a string over JSON, same
// reasoning as Variant.priceAdjustment above. category is always the
// full object the backend joins in, never just a slug string.
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  basePrice: string; // decimal string, e.g. "18.00"
  status: ProductStatus;
  images: string[];
  tags: string[];
  category: ProductCategory;
  variants: Variant[];
  createdAt: string;
}

export interface CartLine {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  emailVerified: boolean;
  // Backend returns this uppercase (Prisma Role enum) — matches the
  // same reality the NextAuth session.role normalizes to lowercase,
  // but /users/me itself is untouched, so this type should reflect
  // what actually comes back over the wire.
  role: "CUSTOMER" | "ADMIN";
}

// Matches the Express API's addresses schema exactly (POST/PATCH
// /users/me/addresses) — field is "street", not "line1". fullName and
// phone are now REQUIRED (backend rejects a save without them);
// addressLine2 is optional. Existing addresses saved before this
// change won't have fullName/phone populated — AddressBook.tsx treats
// a missing fullName/phone as "needs re-entry" rather than silently
// submitting an incomplete payload.
export interface Address {
  id?: string;
  type: "SHIPPING" | "BILLING";
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2, e.g. "IN"
  isDefault: boolean;
}

// The exact, strict shape POST /orders now requires for
// shippingAddress/billingAddress — this backend 400s on extra OR
// missing keys, so this is intentionally narrower than the account
// Address type above (no id/type/label/isDefault, which the orders
// endpoint doesn't want at all).
export interface OrderAddress {
  fullName: string;
  phone: string;
  street: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// PATCH /admin/orders/:id/status only accepts these three values —
// cancel and return go through their own dedicated endpoints
// (POST /orders/:id/cancel, POST /orders/:id/return) and are never set
// via this status field directly. "PENDING" still appears as the
// initial status straight out of order creation, before any admin
// action — kept in the type since it's a real value the backend can
// return, just not one the admin dropdown should offer as a target.
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// NOTE: the Postman collection's [Admin] Update Order Status example
// body uses "SHIPPED" (uppercase) — see OrderStatus above for the
// locked set PATCH /admin/orders/:id/status actually accepts.
// Response shape for POST /orders specifically — NOT the same as Order
// above, which is what GET /orders/:id returns (the raw Prisma row,
// keyed by `id`). The create-order service (order.service.ts) returns
// a completely different shape: it creates the Stripe PaymentIntent
// inline as part of order creation and hands back its clientSecret
// directly, keyed by `orderId` (not `id`).
export interface CreateOrderResult {
  orderId: string;
  clientSecret: string | null;
  totalAmount: number;
}

export interface Order {
  id: string;
  userId: string;
  lines: CartLine[];
  subtotal: number;
  status: string;
  // REQUESTED/APPROVED/REJECTED/null — a separate field from `status`.
  // A DELIVERED order with returnStatus "REQUESTED" is still
  // "DELIVERED"; the return is tracked independently until an admin
  // approves or rejects it.
  returnStatus?: "REQUESTED" | "APPROVED" | "REJECTED" | null;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimitGlobal?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil: string;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  authorName?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface PaymentStatus {
  orderId: string;
  status: string;
  clientSecret?: string;
}