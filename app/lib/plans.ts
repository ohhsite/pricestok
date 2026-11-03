export const plans = {
  standard: {
    id: "standard",
    name: "Publikacja standard",
    amount: 4900,
    days: 30,
    featured: false,
  },
  featured: {
    id: "featured",
    name: "Publikacja wyróżniona",
    amount: 9900,
    days: 30,
    featured: true,
  },
} as const;
export type PlanId = keyof typeof plans;
export function getPlan(value: unknown) {
  return value === "standard" || value === "featured" ? plans[value] : null;
}
export function publicationEnd(
  start: string,
  promotionEnd: string,
  days: number,
) {
  const d = new Date(start + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days - 1);
  const paidEnd = d.toISOString().slice(0, 10);
  return promotionEnd && promotionEnd < paidEnd ? promotionEnd : paidEnd;
}
export function validPaidSession(
  session: {
    payment_status: string;
    amount_total: number | null;
    currency: string | null;
    metadata: Record<string, string> | null;
  },
  order: { id: string; amount: number; plan: string },
) {
  return (
    session.payment_status === "paid" &&
    session.amount_total === order.amount &&
    session.currency === "pln" &&
    session.metadata?.order_id === order.id &&
    session.metadata?.plan === order.plan
  );
}
