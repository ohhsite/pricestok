import "server-only";
import Stripe from "stripe";
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe nie jest skonfigurowany.");
  return new Stripe(key, {
    apiVersion: "2026-10-28.endive",
    maxNetworkRetries: 2,
  });
}
