// "$14.99" / "$70": cents when there are any, whole dollars otherwise. Plain
// module (no Stripe import) so client components can use it too.
export function formatPrice(cents: number, currency = "usd"): string {
  const amount = cents / 100;
  const formatted = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  const symbol = currency.toLowerCase() === "usd" ? "$" : `${currency.toUpperCase()} `;
  return `${symbol}${formatted}`;
}
