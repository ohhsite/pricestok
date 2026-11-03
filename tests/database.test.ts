import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("PostgreSQL: akceptacja raz, ograniczenie czasu, zwrot i blokada publicznego dostępu", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    await db.exec(
      await readFile(
        new URL("../supabase/schema.sql", import.meta.url),
        "utf8",
      ),
    );
    const id = "11111111-1111-4111-8111-111111111111";
    const offer = {
      title: "Oferta testowa",
      company: "Firma testowa",
      end: "",
      category: "jedzenie",
    };
    await db.query(
      "insert into public.bnp_orders(id,plan,amount,offer,status,access_hash,payment_intent) values($1,$2,$3,$4,$5,$6,$7)",
      [
        id,
        "featured",
        9900,
        JSON.stringify(offer),
        "paid_review",
        "offline-hash",
        "pi_offline_test",
      ],
    );
    const first = await db.query<{ bnp_approve_order: string }>(
      "select public.bnp_approve_order($1,$2::jsonb)",
      [id, JSON.stringify(offer)],
    );
    const oid = first.rows[0].bnp_approve_order;
    assert.equal(oid, "platna-" + id);
    const before = (
      await db.query<any>("select data from public.bnp_offers where id=$1", [
        oid,
      ])
    ).rows[0].data;
    assert.equal(before.status, "published");
    assert.equal(before.sponsored, true);
    assert.equal(before.featured, true);
    assert.equal(
      (new Date(before.end).getTime() - new Date(before.start).getTime()) /
        86400000,
      29,
    );
    await db.query("select public.bnp_approve_order($1,$2::jsonb)", [
      id,
      JSON.stringify({ ...offer, title: "Nie należy nadpisać" }),
    ]);
    const after = (
      await db.query<any>("select data from public.bnp_offers where id=$1", [
        oid,
      ])
    ).rows[0].data;
    assert.deepEqual(after, before);
    await db.query("select public.bnp_increment_metric($1,'views')", [oid]);
    await db.query("select public.bnp_increment_metric($1,'clicks')", [oid]);
    const metric = (
      await db.query<any>("select * from public.bnp_metrics where id=$1", [oid])
    ).rows[0];
    assert.equal(metric.views, 1);
    assert.equal(metric.clicks, 1);
    await db.query("select public.bnp_block_order($1,'refunded')", [
      "pi_offline_test",
    ]);
    assert.equal(
      (
        await db.query<any>("select data from public.bnp_offers where id=$1", [
          oid,
        ])
      ).rows[0].data.status,
      "archived",
    );
    assert.equal(
      (
        await db.query<any>(
          "select status from public.bnp_orders where id=$1",
          [id],
        )
      ).rows[0].status,
      "refunded",
    );
    const unpaid = "22222222-2222-4222-8222-222222222222";
    await db.query(
      "insert into public.bnp_orders(id,plan,amount,offer,status,access_hash) values($1,$2,$3,$4,$5,$6)",
      [unpaid, "standard", 4900, "{}", "awaiting_payment", "offline-hash"],
    );
    await assert.rejects(
      () =>
        db.query("select public.bnp_approve_order($1,$2::jsonb)", [
          unpaid,
          "{}",
        ]),
      /not paid/,
    );
    await db.exec("set role anon");
    await assert.rejects(
      () => db.query("select * from public.bnp_orders"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query("select public.bnp_increment_metric('x','views')"),
      /permission denied/,
    );
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
