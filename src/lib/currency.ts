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
