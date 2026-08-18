import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder, createPaymentIntent, getCurrentUser } from "@/lib/api";
import { syncCartToBackend } from "@/lib/cart-api";
import type { CartLine, OrderAddress, PaymentMethod } from "@/types";

interface CheckoutRequestBody {
  items: CartLine[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  discountCode?: string;
  paymentMethod?: PaymentMethod;
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

  const { items, shippingAddress, billingAddress, discountCode, paymentMethod } =
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
    // POST /orders itself now enforces this server-side (403 for an
    // unverified email) — this client-side check just surfaces the
    // same error earlier/friendlier, without a round trip to /orders
    // first. Kept rather than removed since it saves a request.
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
        // No `currency` field — see CreateOrderPayload's comment in
        // lib/api.ts. This WAS being sent and WAS the cause of every
        // order creation 400ing with "Unrecognized key(s): 'currency'".
        paymentMethod: paymentMethod ?? "CARD",
      },
      accessToken
    );

    // COD orders never get a PaymentIntent — order.service.ts skips
    // Stripe entirely for COD, and clientSecret comes back null on
    // purpose (not a failure to retry). Only CARD/UPI fall through to
    // the retry-via-create-intent path below.
    let clientSecret = order.clientSecret;
    if (!clientSecret && paymentMethod !== "COD") {
      // POST /orders already creates the Stripe PaymentIntent inline and
      // returns its clientSecret directly — /payments/create-intent is
      // only a retry path for the rare case that inline creation failed.
      clientSecret = (await createPaymentIntent(order.orderId, accessToken)).clientSecret;
    }

    return NextResponse.json({
      clientSecret,
      orderId: order.orderId,
      paymentMethod: paymentMethod ?? "CARD",
      // The order's own authoritative total, straight from the backend
      // that created it — not the client-side OrderSummary estimate.
      // Shown right before the Stripe step so any mismatch between
      // what the customer expected and what's about to be charged is
      // visible rather than silent.
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    // apiFetch throws a plain Error with the backend's status/body baked
    // into the message — surface that rather than a generic 500 so
    // checkout failures are debuggable from the browser network tab.
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}