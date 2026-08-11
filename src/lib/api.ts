import type { Address, CreateOrderResult, Discount, Order, OrderAddress, PaymentStatus, Product, Review, User } from "@/types";
import { apiFetch } from "@/lib/http";

// Every page/component imports from here, never from a DB client or
// fetch() directly, so all backend calls go through apiFetch in one
// place (auth headers, base URL, error formatting).
//
// Product/CartLine "image"/"images" fields hold a Cloudinary filename
// only (e.g. "product-scrunchie-1.jpg") — components resolve the
// actual URL via cldUrl() from lib/cloudinary.ts.

// Express list endpoints commonly wrap the array in an envelope rather
// than returning a bare array — and sometimes nest it two levels deep,
// e.g. this backend's actual shape:
//   { success: true, data: { items: [...], page, pageSize, total } }
// This walks through the common wrapper keys (recursing, since "data"
// can itself contain another wrapper) so callers reliably get back a
// plain T[] regardless of nesting. If your backend uses a key not
// listed here, add it to WRAPPER_KEYS rather than adjusting call sites.
const WRAPPER_KEYS = [
  "data",
  "products",
  "items",
  "results",
  "orders",
  "addresses",
  "discounts",
  "reviews",
  "users",
];

export function unwrapList<T>(raw: unknown, depth = 0): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (depth < 3 && raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of WRAPPER_KEYS) {
      if (key in obj) {
        try {
          return unwrapList<T>(obj[key], depth + 1);
        } catch {
          // this key wasn't it — keep trying the others
        }
      }
    }
  }
  throw new Error(
    `Expected a list but got: ${JSON.stringify(raw)?.slice(0, 200)}`
  );
}

// Same envelope problem as unwrapList, but for single-object responses
// (this backend's actual shape: { success: true, data: {...} }). Falls
// through the same WRAPPER_KEYS, one level, since single objects don't
// nest as deeply as paginated lists.
export function unwrapObject<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if ("data" in obj && obj.data && typeof obj.data === "object") {
      return obj.data as T;
    }
  }
  return raw as T;
}

export async function getAllProducts(): Promise<Product[]> {
  const raw = await apiFetch<unknown>("/products");
  return unwrapList<Product>(raw);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  // The API's /products has no documented "featured" filter — using
  // "newest" sort as a stand-in until a real featured flag/endpoint
  // exists on the backend.
  const raw = await apiFetch<unknown>("/products?sort=newest&limit=4");
  return unwrapList<Product>(raw);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const raw = await apiFetch<unknown>(`/products/${slug}`);
  return unwrapObject<Product | null>(raw);
}

// GET /orders is scoped to the authenticated user via the bearer token
// (no userId in the path) — the old /users/:id/orders shape doesn't
// exist on this backend, so this requires an accessToken instead.
export async function getOrdersForUser(accessToken: string): Promise<Order[]> {
  const raw = await apiFetch<unknown>("/orders?page=1&pageSize=20", { accessToken });
  return unwrapList<Order>(raw);
}

// POST /auth/register — the API only accepts email + password (no name
// field), then requires an OTP email verification step before login
// will succeed. Adjust the signup UI to reflect that: it currently
// collects a name, which this call silently drops.
export async function registerUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ id: string; email: string } | null> {
  const raw = await apiFetch<unknown>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name: name || undefined }),
  });
  return unwrapObject<{ id: string; email: string } | null>(raw);
}

export async function verifyRegistrationOtp(
  email: string,
  otp: string
): Promise<boolean> {
  await apiFetch<void>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  return true;
}

interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Used by lib/auth.ts's CredentialsProvider — real login against the
// Express API, returning the JWT pair that gets stored in the NextAuth
// session token (see auth.ts jwt callback).
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginResult | null> {
  try {
    const raw = await apiFetch<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return unwrapObject<LoginResult>(raw);
  } catch {
    // Wrong credentials -> apiFetch throws on non-2xx; NextAuth's
    // authorize() should return null (not throw) for a failed login.
    return null;
  }
}

export async function getCurrentUser(accessToken: string): Promise<User | null> {
  const raw = await apiFetch<unknown>("/users/me", { accessToken });
  return unwrapObject<User | null>(raw);
}

export async function updateCurrentUser(
  updates: Partial<Pick<User, "name" | "email" | "phone">>,
  accessToken: string
): Promise<User> {
  const raw = await apiFetch<unknown>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
    accessToken,
  });
  return unwrapObject<User>(raw);
}

// POST /auth/verify-email — public, no accessToken needed (see
// auth.routes.ts: not behind requireAuth). Confirms the 6-digit OTP
// emailed at registration.
//
// NOTE: there is currently no backend endpoint to RESEND that OTP —
// only POST /auth/register sends one, and it's a one-time send valid
// for 15 minutes. If it expires before the user verifies, there is no
// way for them to get a new code short of a backend fix.
export async function verifyEmailOtp(email: string, otp: string): Promise<void> {
  await apiFetch<unknown>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function listAddresses(accessToken: string): Promise<Address[]> {
  const raw = await apiFetch<unknown>("/users/me/addresses", { accessToken });
  return unwrapList<Address>(raw);
}

export async function createAddress(
  address: Omit<Address, "id">,
  accessToken: string
): Promise<Address> {
  const raw = await apiFetch<unknown>("/users/me/addresses", {
    method: "POST",
    body: JSON.stringify(address),
    accessToken,
  });
  return unwrapObject<Address>(raw);
}

interface CreateOrderPayload {
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  discountCode?: string;
  currency: string;
}

// POST /orders has no items/lines field in its body — it converts
// whatever's currently in the authenticated user's server-side cart
// into an order (see lib/cart-api.ts syncCartToBackend, which must run
// before this).
export async function createOrder(
  payload: CreateOrderPayload,
  accessToken: string
): Promise<CreateOrderResult> {
  const raw = await apiFetch<unknown>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
  return unwrapObject<CreateOrderResult>(raw);
}

export async function updateAddress(
  addressId: string,
  address: Partial<Omit<Address, "id">>,
  accessToken: string
): Promise<Address> {
  const raw = await apiFetch<unknown>(`/users/me/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(address),
    accessToken,
  });
  return unwrapObject<Address>(raw);
}

export async function deleteAddress(
  addressId: string,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/users/me/addresses/${addressId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function cancelOrder(
  orderId: string,
  accessToken: string
): Promise<Order> {
  const raw = await apiFetch<unknown>(`/orders/${orderId}/cancel`, {
    method: "POST",
    accessToken,
  });
  return unwrapObject<Order>(raw);
}

export async function initiateReturn(
  orderId: string,
  reason: string,
  accessToken: string
): Promise<Order> {
  const raw = await apiFetch<unknown>(`/orders/${orderId}/return`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    accessToken,
  });
  return unwrapObject<Order>(raw);
}

export async function getOrder(
  orderId: string,
  accessToken: string
): Promise<Order> {
  const raw = await apiFetch<unknown>(`/orders/${orderId}`, { accessToken });
  return unwrapObject<Order>(raw);
}

export async function getPaymentStatus(
  orderId: string,
  accessToken: string
): Promise<PaymentStatus> {
  const raw = await apiFetch<unknown>(`/payments/${orderId}/status`, {
    accessToken,
  });
  return unwrapObject<PaymentStatus>(raw);
}

export async function validateDiscount(
  code: string,
  cartSubtotalCents: number,
  cartCategoryIds: string[] = [],
  cartProductIds: string[] = [],
  accessToken?: string
): Promise<{ valid: boolean; discountAmountCents?: number; message?: string }> {
  const raw = await apiFetch<unknown>("/discounts/validate", {
    method: "POST",
    body: JSON.stringify({ code, cartSubtotalCents, cartCategoryIds, cartProductIds }),
    accessToken,
  });
  return unwrapObject(raw);
}

export async function listReviews(
  productId: string,
  page = 1,
  pageSize = 20,
  sort: "newest" | "highest" | "lowest" = "newest"
): Promise<Review[]> {
  const raw = await apiFetch<unknown>(
    `/products/${productId}/reviews?page=${page}&pageSize=${pageSize}&sort=${sort}`
  );
  return unwrapList<Review>(raw);
}

export async function createReview(
  productId: string,
  review: { rating: number; title: string; body: string },
  accessToken: string
): Promise<Review> {
  const raw = await apiFetch<unknown>(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(review),
    accessToken,
  });
  return unwrapObject<Review>(raw);
}

export async function updateReview(
  reviewId: string,
  review: Partial<{ rating: number; title: string; body: string }>,
  accessToken: string
): Promise<Review> {
  const raw = await apiFetch<unknown>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(review),
    accessToken,
  });
  return unwrapObject<Review>(raw);
}

export async function deleteReview(
  reviewId: string,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/reviews/${reviewId}`, {
    method: "DELETE",
    accessToken,
  });
}

// Re-exported here so admin-api.ts's discount functions (which live
// there since they're admin-only writes) can share the same Discount
// type without a separate import path.
export type { Discount };

export async function createPaymentIntent(
  orderId: string,
  accessToken: string
): Promise<{ clientSecret: string }> {
  const raw = await apiFetch<unknown>("/payments/create-intent", {
    method: "POST",
    body: JSON.stringify({ orderId }),
    accessToken,
  });
  return unwrapObject<{ clientSecret: string }>(raw);
}