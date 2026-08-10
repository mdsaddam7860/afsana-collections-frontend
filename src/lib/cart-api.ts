import { apiFetch } from "@/lib/http";
import type { CartLine } from "@/types";

// The Express API owns its own cart server-side (GET/POST/PATCH/DELETE
// /cart...) and POST /orders has no items/lines field — it converts
// whatever is currently in the user's backend cart into an order. Our
// zustand cart-store is a local-first UI cart (works for guests, persists
// across refresh) that's never been synced to the backend, so before
// creating an order we have to push each local line up via POST
// /cart/items first.
export async function syncCartToBackend(
  items: CartLine[],
  accessToken: string
): Promise<void> {
  // Sequential, not Promise.all — if the backend cart endpoint dedupes
  // by variantId with a naive last-write-wins, concurrent requests for
  // the same variant could race. Checkout carts are small (a handful of
  // lines), so the latency cost here is negligible.
  for (const line of items) {
    await apiFetch<void>("/cart/items", {
      method: "POST",
      body: JSON.stringify({
        variantId: line.variantId,
        quantity: line.quantity,
      }),
      accessToken,
    });
  }
}

export async function getBackendCart(accessToken: string): Promise<unknown> {
  return apiFetch<unknown>("/cart", { accessToken });
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/cart/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
    accessToken,
  });
}

export async function removeCartItem(
  cartItemId: string,
  accessToken: string
): Promise<void> {
  await apiFetch<void>(`/cart/items/${cartItemId}`, {
    method: "DELETE",
    accessToken,
  });
}

// POST /cart/merge — no documented request body in the collection, so
// this assumes it merges whatever guest-identified cart the backend
// already associates with the request (e.g. via a guest cart cookie
// set by earlier unauthenticated /cart calls) into the now-authenticated
// user's cart. Since our local zustand cart was never guest-synced to
// the backend either, we push local lines up first via syncCartToBackend
// so there's something for /cart/merge to reconcile — if your backend's
// guest-cart mechanism differs (e.g. expects a guestCartId in the body),
// adjust the call below.
export async function mergeGuestCart(
  items: CartLine[],
  accessToken: string
): Promise<void> {
  if (items.length > 0) {
    await syncCartToBackend(items, accessToken);
  }
  await apiFetch<void>("/cart/merge", {
    method: "POST",
    accessToken,
  });
}
