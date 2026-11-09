import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { adminAllowed } from "../../lib/admin";
import { getSupabase } from "../../lib/supabase";
import { getStripe } from "../../lib/stripe";
import { sameOrigin, siteUrl } from "../../lib/config";
import { packages } from "../../lib/packages";
import { listCategories } from "../../lib/categories";
import {
  billingPlans,
  billingAmount,
  billingReady,
  billingRow,
  billingTaxRates,
  vatPercent,
  syncBilling,
  type BillingPlan,
} from "../../lib/billing";
export const runtime = "nodejs";
const noStore = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};
function tokenFor(id: string) {
  const secret = process.env.ORDER_TOKEN_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Token configuration missing");
  return createHmac("sha256", secret)
    .update("billing:" + id)
    .digest("hex");
}
async function owned(id: string, token: string) {
  if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(token))
    throw new Error("Brak dostępu.");
  const row = await billingRow(id);
  const hash = createHash("sha256").update(token).digest("hex");
  if (
    !row ||
    row.access_hash.length !== hash.length ||
    !timingSafeEqual(Buffer.from(row.access_hash), Buffer.from(hash))
  )
    throw new Error("Brak dostępu.");
  return row;
}
export async function GET(req: Request) {
  try {
    const p = new URL(req.url).searchParams;
    if (p.get("admin") === "1") {
      if (!(await adminAllowed()))
        return new Response("Forbidden", { status: 403 });
      const r = await getSupabase()
        .from("bnp_billing")
        .select(
          "id,plan,amount,net,vat,payload,state,approved,blocked,paid_until,cancel_at_end,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (r.error) {
        console.error("Supabase bnp_billing", r.error.code || "network");
        return Response.json(
          {
            error:
              "Nie udało się odczytać płatności. Sprawdź konfigurację Supabase. Kod: " +
              (r.error.code || "połączenie"),
          },
          { status: 500, headers: noStore },
        );
      }
      return Response.json({ orders: r.data }, { headers: noStore });
    }
    const row = await owned(p.get("id") || "", p.get("token") || "");
    return Response.json(
      {
        state: row.state,
        plan: row.plan,
        approved: row.approved,
        paidUntil: row.paid_until,
        cancelAtEnd: row.cancel_at_end,
        hasCustomer: !!row.customer_id,
        id: row.id,
      },
      { headers: noStore },
    );
  } catch {
    return Response.json(
      {
        error:
          "Nie udało się odczytać zamówienia. Sprawdź link i konfigurację bazy.",
      },
      { status: 400, headers: noStore },
    );
  }
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 14000)
      return new Response("Za dużo danych", { status: 413 });
    const d = JSON.parse(raw),
      db = getSupabase(),
      stripe = getStripe();
    if (["approve", "reject", "refresh"].includes(d.action)) {
      if (!(await adminAllowed()))
        return new Response("Forbidden", { status: 403 });
      let row = await syncBilling(d.id);
      if (d.action === "approve") {
        const r = await db.rpc("bnp_billing_approve", { p_id: d.id });
        if (r.error) throw r.error;
      }
      if (d.action === "reject") {
        if (row.approved || !["active", "refund_pending"].includes(row.state))
          throw new Error(
            "Można odrzucić tylko niezatwierdzony, opłacony zakup.",
          );
        if (row.subscription_id) {
          const sub = await stripe.subscriptions.retrieve(row.subscription_id);
          if (sub.status !== "canceled")
            await stripe.subscriptions.cancel(
              sub.id,
              {},
              { idempotencyKey: "bnp-billing-cancel-" + row.id },
            );
        }
        const block = await db.rpc("bnp_billing_block", {
          p_id: row.id,
          p_state: "refund_pending",
        });
        if (block.error) throw block.error;
        if (!row.payment_intent)
          throw new Error(
            "Brak identyfikatora wpłaty. Sprawdź fakturę w Stripe.",
          );
        const refund = await stripe.refunds.create(
          { payment_intent: row.payment_intent },
          { idempotencyKey: "bnp-billing-reject-" + row.id },
        );
        if (["failed", "canceled"].includes(refund.status || ""))
          throw new Error("Zwrot nie został potwierdzony.");
        const r = await db.rpc("bnp_billing_block", {
          p_id: row.id,
          p_state:
            refund.status === "succeeded" ? "refunded" : "refund_pending",
        });
        if (r.error) throw r.error;
      }
      return Response.json({ ok: true }, { headers: noStore });
    }
    if (d.action === "portal") {
      const row = await owned(d.id, d.token);
      if (!row.customer_id)
        throw new Error("Klient Stripe nie został jeszcze utworzony.");
      const config = await stripe.billingPortal.configurations.create(
        {
          business_profile: { headline: "PriceStok — płatności firmy" },
          features: {
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true },
            subscription_cancel: {
              enabled: true,
              mode: "at_period_end",
              proration_behavior: "none",
            },
          },
        },
        { idempotencyKey: "bnp-portal-at-period-end-v2" },
      );
      const portal = await stripe.billingPortal.sessions.create({
        customer: row.customer_id,
        configuration: config.id,
        return_url:
          siteUrl() + "/dla-firm?order=" + row.id + "#token=" + d.token,
      });
      return Response.json({ url: portal.url }, { headers: noStore });
    }
    const editing = d.action === "edit" || d.action === "replace";
    if (editing) {
      if (!(await adminAllowed())) return new Response("Forbidden", { status: 403 });
      const order = await billingRow(d.id);
      if (!order) throw new Error("Nie znaleziono zamówienia.");
      d.plan = order.plan;
      d.email = order.payload.email;
      d.nip = order.payload.nip;
    } else if (d.action !== "buy" || !billingReady()) {
      throw new Error("Płatności nie są jeszcze aktywne. Skontaktuj się z redakcją.");
    }
    if (!Object.hasOwn(packages, d.plan)) throw new Error("Nieprawidłowy pakiet.");
    const planId: BillingPlan = d.plan;
    const plan = billingPlans[planId];
    if (!editing && (!/^[a-f0-9-]{36}$/.test(d.requestId || "") || d.confirmed !== true))
      throw new Error("Odśwież formularz i zaakceptuj warunki zakupu.");
    const limits: Record<string, number> = {
      company: 120,
      nip: 10,
      email: 254,
      title: 140,
      summary: 300,
      conditions: 4000,
      address: 200,
      source: 1000,
      category: 40,
      end: 10,
    };
    const payload: Record<string, string> = {};
    for (const [key, max] of Object.entries(limits)) {
      if (key === "end" && planId === "company") { payload.end = ""; continue; }
      if (typeof d[key] !== "string" || d[key].length > max)
        throw new Error("Sprawdź pola formularza.");
      payload[key] = d[key].trim();
    }
    payload.area = "Białystok";
    if (
      !payload.company ||
      !payload.address ||
      !payload.summary ||
      !payload.conditions ||
      !payload.title ||
      !/^\S+@\S+\.\S+$/.test(payload.email)
    )
      throw new Error("Uzupełnij wymagane pola.");
    const nip = payload.nip;
    if (
      !/^\d{10}$/.test(nip) ||
      [6, 5, 7, 2, 3, 4, 5, 6, 7].reduce(
        (sum, w, i) => sum + w * Number(nip[i]),
        0,
      ) %
        11 !==
        Number(nip[9])
    )
      throw new Error("Podaj poprawny polski NIP.");
    if (!(await listCategories()).some((c) => c.id === payload.category))
      throw new Error("Wybierz kategorię.");
    const source = new URL(payload.source);
    if (
      !["https:", "http:"].includes(source.protocol) ||
      source.username ||
      source.password
    )
      throw new Error("Podaj publiczny adres strony.");
    if (
      payload.end && (!editing || d.action === "replace") &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(payload.end) ||
        !Number.isFinite(Date.parse(payload.end)) ||
        payload.end <
          new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" }))
    )
      throw new Error("Nieprawidłowy koniec promocji.");
    if (editing) {
      const { error } = await db.rpc("bnp_billing_edit", {
        p_id: d.id, p_payload: payload, p_replace: d.action === "replace",
      });
      if (error) throw new Error(error.code === "P0001" ? error.message : "Nie udało się zapisać zmian.");
      return Response.json({ ok: true }, { headers: noStore });
    }
    const id = d.requestId,
      token = tokenFor(id),
      amount = billingAmount(planId),
      vat = vatPercent();
    let row = await billingRow(id);
    if (row) {
      if (
        row.plan !== planId ||
        row.amount !== amount ||
        JSON.stringify(row.payload, Object.keys(row.payload).sort()) !==
          JSON.stringify(payload, Object.keys(payload).sort())
      )
        throw new Error(
          "Zamówienie już istnieje. Odśwież formularz przed zmianą danych.",
        );
      if (row.session_id) {
        const session = await stripe.checkout.sessions.retrieve(row.session_id);
        if (session.status !== "open" || !session.url)
          throw new Error("Zakup został zakończony. Sprawdź jego status.");
        return Response.json({ url: session.url }, { headers: noStore });
      }
    } else {
      const r = await db.from("bnp_billing").insert({
        id,
        plan: planId,
        net: plan.net,
        vat,
        amount,
        payload,
        access_hash: createHash("sha256").update(token).digest("hex"),
      });
      if (r.error)
        throw new Error("Zamówienie jest już przetwarzane. Spróbuj ponownie.");
    }
    const rates = await billingTaxRates();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: id,
        integration_identifier: "bialystok-abonament_xqmvrtpa",
        customer_email: payload.email,
        billing_address_collection: "required",
        tax_id_collection: { enabled: true },
        line_items: [
          {
            price_data: {
              currency: "pln",
              unit_amount: plan.net,
              tax_behavior: "exclusive",
              product_data: { name: plan.name + " — PriceStok" },
              
            },
            quantity: 1,
            ...(rates.length ? { tax_rates: rates } : {}),
          },
        ],
        metadata: { billing_id: id },
        customer_creation: "always",
        payment_intent_data: { metadata: { billing_id: id } },
        invoice_creation: { enabled: true },
        success_url: siteUrl() + "/dla-firm?order=" + id + "#token=" + token,
        cancel_url: siteUrl() + "/dla-firm?anulowano=1",
      },
      { idempotencyKey: "bnp-billing-" + id },
    );
    const saved = await db
      .from("bnp_billing")
      .update({ session_id: session.id })
      .eq("id", id);
    if (saved.error) throw saved.error;
    if (!session.url) throw new Error("Brak adresu płatności.");
    return Response.json({ url: session.url }, { headers: noStore });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error && !e.message.includes("Stripe")
            ? e.message
            : "Nie udało się potwierdzić operacji. Sprawdź konfigurację i status płatności przed ponowieniem.",
      },
      { status: 400, headers: noStore },
    );
  }
}
