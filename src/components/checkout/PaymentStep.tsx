"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/store/toast-store";

export default function PaymentStep({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // stripe/elements not ready yet, or a payment is already in flight —
    // the disabled state on the submit button covers the same case, but
    // guarding here too prevents a double-submit from a fast double-click
    // or an Enter-key repeat before the button visually disables.
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setSubmitting(false);

    if (stripeError) {
      const message =
        stripeError.message ?? "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/*
        Stripe's PaymentElement renders its own iframe-based UI, so it can't
        be restyled with Tailwind classes directly — instead we pass an
        `appearance` object to <Elements options> (see CheckoutPage) that
        maps Stripe's theme variables to this app's CSS custom properties,
        so the embedded fields visually match the rest of the form.
      */}
      <div className="rounded-soft border border-border bg-surface p-4">
        <PaymentElement />
      </div>

      {error && (
        <p role="alert" className="font-mono-price text-xs text-accent">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 rounded-sharp border border-border py-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="btn-fill flex-[2] flex items-center justify-center gap-2 rounded-sharp border border-accent py-4 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && <Spinner size={13} />}
          {submitting ? "Processing payment…" : "Pay now"}
        </button>
      </div>
    </form>
  );
}
