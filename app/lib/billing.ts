import "server-only";
import type Stripe from "stripe";
import { getSupabase } from "./supabase";
import { getStripe } from "./stripe";
import { databaseConfigured, stripeConfigured } from "./config";

import { packages } from "./packages";

export const billingPlans = {
  ...packages,
  monthly: { name: "Abonament archiwalny", net: 5000 },
} as const;
export type BillingPlan = keyof typeof billingPlans;
export function vatPercent() {
  return process.env.BILLING_VAT_PERCENT === "0" ? 0 : 23;
}
export function billingReady() {
  return (
    stripeConfigured() &&
    ["0", "23"].includes(process.env.BILLING_VAT_PERCENT || "") &&
    (vatPercent() === 0 || !!process.env.STRIPE_PL_VAT_RATE_ID)
  );
}
export function billingAmount(plan: BillingPlan) {
  return Math.round(billingPlans[plan].net * (1 + vatPercent() / 100));
}
export async function billingTaxRates() {
  if (vatPercent() === 0) return [];
  const id = process.env.STRIPE_PL_VAT_RATE_ID;
  if (!id) throw new Error("Uzupełnij stawkę VAT w Stripe.");
  const rate = await getStripe().taxRates.retrieve(id);
  if (
    !rate.active ||
    rate.inclusive ||
    rate.percentage !== 23 ||
    rate.country !== "PL"
  )
    throw new Error("Nieprawidłowa stawka VAT PL 23% exclusive.");
  return [id];
}
export const resourceId = (
  value: { id: string } | string | null | undefined,
) => (typeof value === "string" ? value : value?.id);
async function checked(result: { error: unknown }) {
  if (result.error) throw result.error;
}
export async function billingRow(id: string) {
  const r = await getSupabase()
    .from("bnp_billing")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  await checked(r);
  return r.data;
}
async function latestInvoicePayment(invoice: Stripe.Invoice) {
  const payments = await getStripe().invoicePayments.list({
    invoice: invoice.id,
    limit: 100,
  });
  const id = resourceId(
    payments.data.find(
      (p) => p.status === "paid" && p.payment.type === "payment_intent",
    )?.payment.payment_intent,
  );
  if (!id) return null;
  return getStripe().paymentIntents.retrieve(id, { expand: ["latest_charge"] });
}
export async function syncBilling(
  id: string,
  version = Math.floor(Date.now() / 1000),
) {
  const row = await billingRow(id);
  if (!row) throw new Error("Billing order missing");
  const stripe = getStripe();
  let subscriptionId = row.subscription_id;
  let customerId = row.customer_id;
  let pi: Stripe.PaymentIntent | null = null;
  let state = row.state,
    paidUntil: string | null = null;
  if (!subscriptionId && row.session_id) {
    const session = await stripe.checkout.sessions.retrieve(row.session_id);
    if (
      session.client_reference_id !== row.id ||
      session.metadata?.billing_id !== row.id
    )
      throw new Error("Checkout mismatch");
    subscriptionId = resourceId(session.subscription);
    customerId = resourceId(session.customer);
    if (row.plan !== "monthly") {
      if (session.payment_status === "paid") {
        if (session.amount_total !== row.amount || session.currency !== "pln")
          throw new Error("Amount mismatch");
        const paymentId = resourceId(session.payment_intent);
        if (paymentId)
          pi = await stripe.paymentIntents.retrieve(paymentId, {
            expand: ["latest_charge"],
          });
        state = "active";
      } else
        state = session.status === "expired" ? "expired" : "awaiting_payment";
    }
  }
  let cancelAtEnd = false;
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice"],
    });
    if (sub.metadata.billing_id !== row.id || sub.items.data.length !== 1)
      throw new Error("Subscription ownership mismatch");
    const item = sub.items.data[0];
    if (
      item.price.unit_amount !== row.net ||
      item.price.currency !== "pln" ||
      item.price.recurring?.interval !== "month" ||
      item.quantity !== 1
    )
      throw new Error("Subscription price mismatch");
    const invoice =
      typeof sub.latest_invoice === "string"
        ? await stripe.invoices.retrieve(sub.latest_invoice)
        : sub.latest_invoice;
    state = sub.pause_collection ? "paused" : sub.status;
    cancelAtEnd = sub.cancel_at_period_end;
    if (
      invoice?.status === "paid" &&
      invoice.amount_paid >= row.amount &&
      invoice.currency === "pln"
    ) {
      paidUntil = new Date(item.current_period_end * 1000).toISOString();
      pi = await latestInvoicePayment(invoice);
    } else if (state === "active") state = "payment_failed";
    customerId = resourceId(sub.customer);
  }
  const charge = pi?.latest_charge;
  if (
    charge &&
    typeof charge !== "string" &&
    (charge.refunded || charge.disputed)
  )
    state = charge.refunded ? "refunded" : "disputed";
  await checked(
    await getSupabase().rpc("bnp_billing_sync", {
      p_id: id,
      p_state: state,
      p_until: paidUntil,
      p_pi: pi?.id || null,
      p_customer: customerId || null,
      p_subscription: subscriptionId || null,
      p_cancel: cancelAtEnd,
      p_version: version,
    }),
  );
  return billingRow(id);
}
export async function handleBillingEvent(event: Stripe.Event) {
  const stripe = getStripe(),
    db = getSupabase();
  let row: any = null;
  if (event.type.startsWith("checkout.session.")) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.billing_id) return false;
    row = await billingRow(session.metadata.billing_id);
    if (!row) throw new Error("Billing order missing");
    if (row.session_id && row.session_id !== session.id)
      throw new Error("Session mismatch");
    await checked(
      await db
        .from("bnp_billing")
        .update({ session_id: session.id })
        .eq("id", row.id)
        .is("session_id", null),
    );
  } else if (event.type.startsWith("customer.subscription.")) {
    const sub = event.data.object as Stripe.Subscription;
    const r = await db
      .from("bnp_billing")
      .select("*")
      .eq("subscription_id", sub.id)
      .maybeSingle();
    await checked(r);
    row = r.data;
    if (!row && sub.metadata.billing_id) {
      row = await billingRow(sub.metadata.billing_id);
      if (row && !row.subscription_id)
        await checked(
          await db
            .from("bnp_billing")
            .update({ subscription_id: sub.id })
            .eq("id", row.id)
            .is("subscription_id", null),
        );
      else if (row?.subscription_id !== sub.id)
        throw new Error("Subscription mismatch");
    }
  } else if (
    [
      "invoice.paid",
      "invoice.payment_failed",
      "invoice.payment_action_required",
    ].includes(event.type)
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = resourceId(
      invoice.parent?.subscription_details?.subscription,
    );
    if (!subId) return false;
    const r = await db
      .from("bnp_billing")
      .select("*")
      .eq("subscription_id", subId)
      .maybeSingle();
    await checked(r);
    row = r.data;
    if (!row) {
      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.metadata.billing_id) {
        row = await billingRow(sub.metadata.billing_id);
        if (row && !row.subscription_id)
          await checked(
            await db
              .from("bnp_billing")
              .update({ subscription_id: sub.id })
              .eq("id", row.id)
              .is("subscription_id", null),
          );
        else if (row?.subscription_id !== sub.id)
          throw new Error("Subscription mismatch");
      }
    }
  } else if (
    [
      "charge.refunded",
      "charge.dispute.created",
      "radar.early_fraud_warning.created",
    ].includes(event.type)
  ) {
    const object = event.data.object as any;
    const chargeId =
      event.type === "charge.refunded" ? object.id : resourceId(object.charge);
    if (!chargeId) return false;
    const charge = await stripe.charges.retrieve(chargeId);
    if (event.type === "charge.refunded" && !charge.refunded) return true;
    const piId = resourceId(charge.payment_intent);
    if (!piId) return false;
    const direct = await db
      .from("bnp_billing")
      .select("*")
      .eq("payment_intent", piId)
      .maybeSingle();
    await checked(direct);
    row = direct.data;
    if (!row) {
      const payments = await stripe.invoicePayments.list({
        payment: { type: "payment_intent", payment_intent: piId },
        limit: 100,
      });
      for (const payment of payments.data) {
        const invoiceId = resourceId(payment.invoice);
        if (!invoiceId) continue;
        const invoice = await stripe.invoices.retrieve(invoiceId);
        const subId = resourceId(
          invoice.parent?.subscription_details?.subscription,
        );
        if (!subId) continue;
        const result = await db
          .from("bnp_billing")
          .select("*")
          .eq("subscription_id", subId)
          .maybeSingle();
        await checked(result);
        row = result.data;
        if (!row) {
          const sub = await stripe.subscriptions.retrieve(subId);
          if (sub.metadata.billing_id)
            row = await billingRow(sub.metadata.billing_id);
        }
        if (row) break;
      }
    }
    if (!row) {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: piId,
        limit: 10,
      });
      const id = sessions.data.find((s) => s.metadata?.billing_id)?.metadata
        ?.billing_id;
      if (id) row = await billingRow(id);
    }
    if (row) {
      row = await syncBilling(row.id, event.created);
      await checked(
        await db.rpc("bnp_billing_block", {
          p_id: row.id,
          p_state:
            event.type === "charge.refunded"
              ? "refunded"
              : event.type === "charge.dispute.created"
                ? "disputed"
                : "fraud_review",
        }),
      );
      if (row.subscription_id) {
        const sub = await stripe.subscriptions.retrieve(row.subscription_id);
        if (
          !["canceled", "incomplete_expired"].includes(sub.status) &&
          !sub.cancel_at_period_end
        )
          await stripe.subscriptions.update(sub.id, {
            cancel_at_period_end: true,
          });
      }
    }
    return !!row;
  }
  if (!row) return false;
  await syncBilling(row.id, event.created);
  return true;
}
export async function publicCompany(id: string) {
  if (!databaseConfigured()) return null;
  const row = await billingRow(id);
  return row?.plan === "company" && row.approved && !row.blocked && row.state === "active" &&
    (row.net === 20000 || Date.parse(row.paid_until) > Date.now())
    ? row.payload
    : null;
}
