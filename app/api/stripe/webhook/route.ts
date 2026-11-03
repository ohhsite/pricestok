import type Stripe from "stripe";
import { getStripe } from "../../../lib/stripe";
import { getSupabase } from "../../../lib/supabase";
import { validPaidSession } from "../../../lib/plans";
import { handleBillingEvent } from "../../../lib/billing";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature"),
    secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret)
    return new Response("Missing signature or webhook configuration", {
      status: 400,
    });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await req.text(),
      signature,
      secret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    const db = getSupabase();
    if (await handleBillingEvent(event))
      return Response.json({ received: true });
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    ) {
      const notified = event.data.object as Stripe.Checkout.Session;
      const session = await getStripe().checkout.sessions.retrieve(
        notified.id,
        { expand: ["payment_intent.latest_charge"] },
      );
      if (session.payment_status !== "paid")
        return Response.json({ received: true });
      const id = session.metadata?.order_id;
      if (!id) return Response.json({ received: true });
      const { data: order, error } = await db
        .from("bnp_orders")
        .select("id,amount,plan,session_id")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!order) throw new Error("Order missing");
      if (
        !validPaidSession(session, order) ||
        (order.session_id && order.session_id !== session.id)
      )
        throw new Error("Payment/order mismatch");
      const pi = session.payment_intent;
      const charge = pi && typeof pi !== "string" ? pi.latest_charge : null;
      const refunded = charge && typeof charge !== "string" && charge.refunded;
      const disputed = charge && typeof charge !== "string" && charge.disputed;
      const { error: saveError } = await db
        .from("bnp_orders")
        .update({
          status: refunded ? "refunded" : disputed ? "disputed" : "paid_review",
          session_id: session.id,
          payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", id)
        .in("status", ["awaiting_payment", "payment_failed", "expired"]);
      if (saveError) throw saveError;
    } else if (
      [
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
      ].includes(event.type)
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.order_id) {
        const { error } = await db
          .from("bnp_orders")
          .update({
            status: event.type.endsWith("expired")
              ? "expired"
              : "payment_failed",
          })
          .eq("id", session.metadata.order_id)
          .eq("status", "awaiting_payment");
        if (error) throw error;
      }
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      if (charge.refunded && charge.payment_intent) {
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent.id;
        const { error } = await db.rpc("bnp_block_order", {
          p_payment_intent: pi,
          p_status: "refunded",
        });
        if (error) throw error;
      }
    } else if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as Stripe.Dispute;
      const pi = dispute.payment_intent;
      if (pi) {
        const { error } = await db.rpc("bnp_block_order", {
          p_payment_intent: typeof pi === "string" ? pi : pi.id,
          p_status: "disputed",
        });
        if (error) throw error;
      }
    }
    return Response.json({ received: true });
  } catch {
    return new Response("Webhook processing failed; retry required", {
      status: 500,
    });
  }
}
