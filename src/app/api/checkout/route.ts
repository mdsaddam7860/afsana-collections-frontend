import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder, createPaymentIntent, getCurrentUser } from "@/lib/api";
import { syncCartToBackend } from "@/lib/cart-api";
import { CHECKOUT_DEFAULTS } from "@/lib/constants";
import type { CartLine, OrderAddress } from "@/types";

interface CheckoutRequestBody {
  items: CartLine[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  discountCode?: string;
}

// POST /orders now validates shippingAddress/billingAddress strictly —
// extra keys OR missing keys both 400. This picks out exactly the
// fields OrderAddress defines, in case a stale client or future field
// addition sends something extra, so we never accidentally forward a
// key the backend will reject.
function pickOrderAddress(addr: OrderAddress): OrderAddress {
  return {
    fullName: addr.fullName,
    phone: addr.phone,
    street: addr.street,
    addressLine2: addr.addressLine2 ?? "",
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
  };
}

// Real order flow, in order:
//   1. Require a logged-in session — POST /orders is scoped to the
//      authenticated user's cart on the backend, there's no guest
//      checkout path documented for this API.
//   2. Push the local (zustand) cart into the backend's own cart via
//      POST /cart/items, since POST /orders has no items field — it
//      converts whatever's already in the user's server-side cart.
//   3. POST /orders with the shipping/billing address to actually
//      create the order.
//   4. POST /payments/create-intent with that order's id to get the
//      Stripe PaymentIntent client secret PaymentStep needs.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as unknown as { accessToken?: string })
    ?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Please log in to check out." },
      { status: 401 }
    );
  }

  const { items, shippingAddress, billingAddress, discountCode } =
    (await request.json()) as CheckoutRequestBody;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!shippingAddress?.fullName || !shippingAddress?.phone) {
    return NextResponse.json(
      { error: "Full name and phone are required on the shipping address." },
      { status: 400 }
    );
  }

  try {
    // The backend itself does NOT reject order creation for an
    // unverified email — POST /orders has no such check (see
    // order.routes.ts / order.service.ts). Enforcing it only here is
    // a soft, client-side-reachable gate: someone could still call the
    // backend directly and bypass it. Flagged to the backend team to
    // add the same check server-side for real enforcement.
    const currentUser = await getCurrentUser(accessToken);
    if (currentUser && !currentUser.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before placing an order." },
        { status: 403 }
      );
    }

    await syncCartToBackend(items, accessToken);

    const order = await createOrder(
      {
        shippingAddress: pickOrderAddress(shippingAddress),
        billingAddress: pickOrderAddress(billingAddress ?? shippingAddress),
        discountCode: discountCode || undefined,
        currency: CHECKOUT_DEFAULTS.currency,
      },
      accessToken
    );

    // POST /orders already creates the Stripe PaymentIntent inline and
    // returns its clientSecret directly — /payments/create-intent is
    // only a retry path for the rare case that inline creation failed
    // (clientSecret comes back null). Calling it unconditionally was
    // the actual bug: order.id doesn't exist on this response (the
    // real field is order.orderId), so `orderId: order.id` silently
    // serialized to `orderId: undefined`, which JSON.stringify drops
    // entirely — the backend then saw a request with no orderId at all.
    const clientSecret =
      order.clientSecret ?? (await createPaymentIntent(order.orderId, accessToken)).clientSecret;

    return NextResponse.json({ clientSecret, orderId: order.orderId });
  } catch (err) {
    // apiFetch throws a plain Error with the backend's status/body baked
    // into the message — surface that rather than a generic 500 so
    // checkout failures are debuggable from the browser network tab.
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}