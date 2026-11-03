import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { getPlan, validPaidSession, publicationEnd } from "../app/lib/plans.ts";
import { isActive } from "../app/lib/data.ts";
test("cena pochodzi z pakietu serwera, obcy pakiet nie jest akceptowany", () => {
  assert.equal(getPlan("standard")?.amount, 4900);
  assert.equal(getPlan("featured")?.amount, 9900);
  assert.equal(getPlan("free"), null);
  assert.equal(getPlan({ amount: 1 }), null);
});
test("publikacja tylko po opłaceniu właściwej kwoty i zamówienia", () => {
  const order = { id: "a", amount: 4900, plan: "standard" };
  const session = {
    payment_status: "paid",
    amount_total: 4900,
    currency: "pln",
    metadata: { order_id: "a", plan: "standard" },
  };
  assert.equal(validPaidSession(session, order), true);
  for (const patch of [
    { payment_status: "unpaid" },
    { amount_total: 1 },
    { currency: "eur" },
    { metadata: { order_id: "b", plan: "standard" } },
    { metadata: { order_id: "a", plan: "featured" } },
  ])
    assert.equal(validPaidSession({ ...session, ...patch }, order), false);
});
test("30 dni liczone łącznie z pierwszym dniem; wcześniejszy koniec promocji wygrywa", () => {
  assert.equal(publicationEnd("2026-11-03", "", 30), "2026-12-02");
  assert.equal(publicationEnd("2026-11-03", "2026-11-20", 30), "2026-11-20");
  assert.equal(publicationEnd("2028-02-01", "", 30), "2028-03-01");
});
test("oferta nie jest widoczna przed startem, po końcu ani jako szkic", () => {
  const o = {
    status: "published",
    start: "2026-11-03",
    end: "2026-12-02",
  } as any;
  assert.equal(isActive(o, "2026-11-02"), false);
  assert.equal(isActive(o, "2026-11-03"), true);
  assert.equal(isActive(o, "2026-12-02"), true);
  assert.equal(isActive(o, "2026-12-03"), false);
  assert.equal(isActive({ ...o, status: "draft" }, "2026-11-04"), false);
});
test("SDK Stripe odrzuca podmieniony lub niepodpisany webhook", () => {
  const stripe = new Stripe("offline-placeholder-not-an-api-key");
  const secret = "offline-webhook-signature-test";
  const payload = JSON.stringify({
    id: "evt_offline",
    object: "event",
    type: "checkout.session.completed",
    data: { object: { id: "cs_offline" } },
  });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(
    stripe.webhooks.constructEvent(payload, header, secret).id,
    "evt_offline",
  );
  assert.throws(() =>
    stripe.webhooks.constructEvent(payload + " ", header, secret),
  );
  assert.throws(() =>
    stripe.webhooks.constructEvent(payload, "invalid", secret),
  );
});
