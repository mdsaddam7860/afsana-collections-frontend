/**
 * Single source of truth for price formatting. Every component should
 * call formatPrice() instead of doing `${value.toFixed(2)}` — that
 * hardcodes USD and breaks the moment the store needs a different
 * currency or locale-aware grouping (e.g. Indian lakh/crore commas).
 *
 * Prices are stored as plain numbers (rupees, not paise) throughout the
 * frontend. The backend's /orders and /payments/create-intent endpoints
 * expect a "currency" field alongside the amount — CHECKOUT_DEFAULTS.currency
 * in constants.ts is the value sent there, and must stay in sync with
 * CURRENCY_CODE below.
 */

export const CURRENCY_CODE = "INR";
export const CURRENCY_LOCALE = "en-IN";

const formatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return formatter.format(amount);
}

/**
 * The backend's Order/OrderItem money fields (totalAmount, subtotal,
 * taxAmount, shippingAmount, discountAmount, unitPrice, totalPrice) are
 * in PAISE, not rupees — confirmed against real API responses:
 * subtotal 1250 + tax 100 + shipping 6900 = totalAmount 8250, and only
 * resolves to a sane order (₹12.50 + ₹1.00 + ₹69.00 = ₹82.50) once
 * divided by 100. This makes sense: Stripe's PaymentIntent `amount`
 * parameter requires the smallest currency unit, so the backend stores
 * money that way throughout the Order model rather than converting at
 * the Stripe call site.
 *
 * This is a DIFFERENT convention from the rest of this frontend — the
 * cart store, product catalog (basePrice), and everywhere else in this
 * file's own doc comment above assume plain rupees. Mixing the two up
 * is exactly what caused an order to display as "₹8,250" when the real
 * charge was ₹82.50: formatPrice() was called directly on a raw paise
 * value from the backend.
 *
 * Always use this — never formatPrice() directly — for any value that
 * came from an Order or OrderItem object returned by the backend.
 */
export function formatOrderAmount(paise: number): string {
  return formatter.format(paise / 100);
}
