import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Client-side singleton — loadStripe must only be called once.
let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
    );
  }
  return stripePromise;
}
