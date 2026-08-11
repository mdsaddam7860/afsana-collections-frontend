"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe";
import { useCartStore } from "@/store/cart-store";
import StepIndicator, {
  type CheckoutStep,
} from "@/components/checkout/StepIndicator";
import OrderSummary from "@/components/checkout/OrderSummary";
import InformationStep, {
  type ContactInfo,
} from "@/components/checkout/InformationStep";
import ShippingStep, {
  type ShippingAddress,
} from "@/components/checkout/ShippingStep";
import { EMPTY_ORDER_ADDRESS } from "@/components/checkout/AddressFields";
import PaymentStep from "@/components/checkout/PaymentStep";
import { toast } from "@/store/toast-store";
import OrderConfirmed from "@/components/checkout/OrderConfirmed";
import type { OrderAddress } from "@/types";

// Maps Stripe's PaymentElement theme to this app's CSS custom properties
// so the embedded iframe fields match the rest of the Linen form —
// Stripe fields can't take Tailwind classes directly.
const STRIPE_APPEARANCE: StripeElementsOptions["appearance"] = {
  theme: "stripe",
  variables: {
    colorPrimary: "#E0793C",
    colorBackground: "#F8F3EC",
    colorText: "#2E2620",
    colorTextSecondary: "#78706A",
    colorDanger: "#E0793C",
    fontFamily: "Archivo, sans-serif",
    borderRadius: "6px",
    spacingUnit: "4px",
  },
  rules: {
    ".Label": {
      textTransform: "uppercase",
      fontSize: "11px",
      letterSpacing: "0.1em",
      color: "#78706A",
    },
    ".Input": {
      border: "1px solid #E5D9C6",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #E0793C",
      boxShadow: "none",
    },
  },
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<CheckoutStep>(0);
  const [contact, setContact] = useState<ContactInfo>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [shipping, setShipping] = useState<ShippingAddress>({
    ...EMPTY_ORDER_ADDRESS,
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState<OrderAddress>({
    ...EMPTY_ORDER_ADDRESS,
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // POST /orders (and everything downstream) is scoped to the
  // authenticated user's own cart/session on the backend — there's no
  // guest checkout path, so bounce to login rather than letting someone
  // fill out the whole form and fail at the payment step.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/account/login?next=/checkout`);
    }
  }, [status, router]);

  // Creates the order (syncing the local cart to the backend cart first)
  // and the PaymentIntent together, once shipping info is submitted —
  // not on page load, so we don't create abandoned orders/intents for
  // people who never make it past step 1.
  const handleShippingSubmit = async () => {
    // Guards against a re-entrant call even if ShippingStep's own
    // disabled-button check is somehow bypassed (e.g. Enter-key repeat
    // racing the state update) — this is the actual source of truth
    // that prevents creating two orders for one submission.
    if (creatingOrder) return;

    const accessToken = (session as unknown as { accessToken?: string })
      ?.accessToken;
    if (!accessToken) {
      router.push("/account/login?next=/checkout");
      return;
    }

    setCreatingOrder(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: shipping,
          billingAddress: billingSameAsShipping ? shipping : billing,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderId);
      setStep(2);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setCreatingOrder(false);
    }
  };

  const stripePromise = useMemo(() => getStripe(), []);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-lg px-6 pb-24 pt-32">
        <p className="font-mono-price text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-lg px-6 pb-24 pt-32">
        <OrderConfirmed orderNumber={orderNumber} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <h1 className="font-display text-fluid-h1 italic text-foreground">
        Checkout
      </h1>

      <div className="mt-10">
        <StepIndicator current={step} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-14 md:grid-cols-[1.3fr_1fr]">
        <div>
          {step === 0 && (
            <InformationStep
              value={contact}
              onChange={setContact}
              onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <div>
              <ShippingStep
                value={shipping}
                onChange={setShipping}
                billingSameAsShipping={billingSameAsShipping}
                onBillingSameAsShippingChange={setBillingSameAsShipping}
                billingValue={billing}
                onBillingChange={setBilling}
                onNext={handleShippingSubmit}
                onBack={() => setStep(0)}
                loading={creatingOrder}
              />
              {checkoutError && (
                <p
                  role="alert"
                  className="mt-4 font-mono-price text-xs text-accent"
                >
                  {checkoutError}
                </p>
              )}
            </div>
          )}

          {step === 2 &&
            (clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
              >
                <PaymentStep
                  onBack={() => setStep(1)}
                  onSuccess={() => {
                    clearCart();
                    setConfirmed(true);
                    toast.success("Order placed!");
                  }}
                />
              </Elements>
            ) : (
              <p className="font-mono-price text-xs uppercase tracking-widest text-muted">
                Preparing payment…
              </p>
            ))}
        </div>

        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
