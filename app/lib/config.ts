export function siteUrl() {
  const raw = process.env.SITE_URL || "http://localhost:3000";
  const u = new URL(raw);
  if (!["http:", "https:"].includes(u.protocol))
    throw new Error("Nieprawidłowy SITE_URL");
  return u.origin;
}
export function databaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}
export function stripeConfigured() {
  return (
    databaseConfigured() &&
    !!process.env.STRIPE_SECRET_KEY &&
    !!process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.PAYMENTS_ENABLED === "true" &&
    (process.env.ORDER_TOKEN_SECRET || "").length >= 32 &&
    !!process.env.SELLER_NAME &&
    !!process.env.SELLER_ADDRESS &&
    !!process.env.SELLER_CONTACT_EMAIL &&
    process.env.SALES_TERMS_READY === "true"
  );
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === siteUrl();
}
