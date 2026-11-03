import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("billing: paid-only approval, renewals, event order, sticky risk block and RLS", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role bypassrls;",
    );
    await db.exec(
      await readFile(
        new URL("../supabase/schema.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(
      await readFile(
        new URL("../supabase/abonamenty.sql", import.meta.url),
        "utf8",
      ),
    );
    const id = "33333333-3333-4333-8333-333333333333";
    await db.query(
      "insert into bnp_billing(id,plan,net,vat,amount,payload,access_hash) values($1,'monthly',5000,23,6150,$2,'hash')",
      [
        id,
        JSON.stringify({
          company: "Firma",
          title: "Promocja",
          category: "jedzenie",
          email: "private@example.com",
          nip: "1234567890",
          end: "",
        }),
      ],
    );
    await assert.rejects(
      () => db.query("select bnp_billing_approve($1)", [id]),
      /not active/,
    );
    const until = new Date(Date.now() + 30 * 86400000).toISOString();
    await db.query(
      "select bnp_billing_sync($1,'active',$2,'pi_test','cus_test','sub_test',false,100)",
      [id, until],
    );
    await db.query("select bnp_billing_approve($1)", [id]);
    await db.query("select bnp_billing_approve($1)", [id]);
    const rows = await db.query<any>("select data from bnp_offers");
    assert.equal(rows.rows.length, 1);
    assert.equal(rows.rows[0].data.email, undefined);
    assert.equal(rows.rows[0].data.nip, undefined);
    const later = new Date(Date.now() + 60 * 86400000).toISOString();
    await db.query(
      "select bnp_billing_sync($1,'active',$2,'pi_new','cus_test','sub_test',true,200)",
      [id, later],
    );
    await db.query(
      "select bnp_billing_sync($1,'past_due',null,null,null,null,false,101)",
      [id],
    );
    const state = (
      await db.query<any>("select * from bnp_billing where id=$1", [id])
    ).rows[0];
    assert.equal(state.state, "active");
    assert.equal(state.cancel_at_end, true);
    assert.equal(new Date(state.paid_until).toISOString(), later);
    await db.query("select bnp_billing_block($1,'disputed')", [id]);
    await db.query(
      "select bnp_billing_sync($1,'active',$2,null,null,null,false,300)",
      [id, later],
    );
    assert.equal(
      (await db.query<any>("select state from bnp_billing")).rows[0].state,
      "disputed",
    );
    assert.equal(
      (await db.query<any>("select data from bnp_offers")).rows[0].data.status,
      "archived",
    );
    const quarter = "55555555-5555-4555-8555-555555555555";
    const payload = { title: "Pierwsza", end: "" };
    await db.query(
      "insert into bnp_billing(id,plan,net,vat,amount,payload,access_hash,state) values($1,'quarter',13900,0,13900,$2,'hash','active')",
      [quarter, payload],
    );
    await db.query("select bnp_billing_approve($1)", [quarter]);
    const getEnd = async () => (await db.query<{ paid_until: Date }>(
      "select paid_until from bnp_billing where id=$1", [quarter],
    )).rows[0].paid_until.toISOString();
    const end = await getEnd();
    await assert.rejects(
      () => db.query("select bnp_billing_edit($1,$2,true)", [quarter, payload]),
      /30 dniach/,
    );
    await db.query("update bnp_billing set approved_at=now()-interval '31 days' where id=$1", [quarter]);
    await db.query("select bnp_billing_edit($1,$2,true)", [quarter, { ...payload, title: "Druga" }]);
    assert.equal(await getEnd(), end);
    assert.equal((await db.query<{ title: string }>(
      "select data->>'title' as title from bnp_offers where id=$1", ["abonament-" + quarter],
    )).rows[0].title, "Druga");
    await db.query("delete from bnp_offers where id=$1", ["abonament-" + quarter]);
    await db.query("delete from bnp_billing where id=$1", [quarter]);
    const oneoff = "44444444-4444-4444-8444-444444444444";
    await db.query(
      'insert into bnp_billing(id,plan,net,vat,amount,payload,access_hash) values($1,\'oneoff\',5000,23,6150,\'{"title":"Jednorazowa","company":"Firma","end":""}\',\'hash\')',
      [oneoff],
    );
    await assert.rejects(
      () => db.query("select bnp_billing_approve($1)", [oneoff]),
      /not active/,
    );
    await db.query(
      "select bnp_billing_sync($1,'active',null,'pi_oneoff','cus_oneoff',null,false,400)",
      [oneoff],
    );
    await db.query("select bnp_billing_approve($1)", [oneoff]);
    const single = (
      await db.query<any>(
        "select b.*,o.data from bnp_billing b join bnp_offers o on o.id='abonament-'||b.id::text where b.id=$1",
        [oneoff],
      )
    ).rows[0];
    assert.equal(single.subscription_id, null);
    assert.equal(single.cancel_at_end, false);
    assert.equal(
      (Date.parse(single.data.end) - Date.parse(single.data.start)) / 86400000,
      29,
    );
    const beforeUntil = new Date(single.paid_until).toISOString();
    // Powtórzony webhook / akceptacja nie resetują jednorazowego okresu.
    await db.query(
      "select bnp_billing_sync($1,'active',null,'pi_oneoff','cus_oneoff',null,false,401)",
      [oneoff],
    );
    await db.query("select bnp_billing_approve($1)", [oneoff]);
    assert.equal(
      new Date(
        (
          await db.query<any>(
            "select paid_until from bnp_billing where id=$1",
            [oneoff],
          )
        ).rows[0].paid_until,
      ).toISOString(),
      beforeUntil,
    );
    const short = "55555555-5555-4555-8555-555555555555";
    await db.query(
      "insert into bnp_billing(id,plan,net,vat,amount,payload,access_hash,state) values($1,'oneoff',5000,0,5000,jsonb_build_object('end',((now() at time zone 'Europe/Warsaw')::date+2)::text),'hash','active')",
      [short],
    );
    await db.query("select bnp_billing_approve($1)", [short]);
    const shorter = (
      await db.query<any>(
        "select data from bnp_offers where id='abonament-'||$1",
        [short],
      )
    ).rows[0].data;
    assert.equal(
      (Date.parse(shorter.end) - Date.parse(shorter.start)) / 86400000,
      2,
    );
    await db.query("select bnp_billing_block($1,'refunded')", [oneoff]);
    assert.equal(
      (
        await db.query<any>(
          "select data from bnp_offers where id='abonament-'||$1",
          [oneoff],
        )
      ).rows[0].data.status,
      "archived",
    );
    await db.exec("set role anon");
    await assert.rejects(
      () => db.query("select * from bnp_billing"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query("select bnp_billing_approve($1)", [id]),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
