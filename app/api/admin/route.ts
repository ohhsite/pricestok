import { holiday } from "../../lib/holiday";
import { adminAllowed } from "../../lib/admin";
import { listOffers, offerRecord, saveOffer, setFacebookShared } from "../../lib/repository";
import { getSupabase } from "../../lib/supabase";
import { getStripe } from "../../lib/stripe";
import { validPaidSession } from "../../lib/plans";
import { sameOrigin } from "../../lib/config";
import { listCategories } from "../../lib/categories";
import { Offer, today } from "../../lib/data";
import { photoName } from "../../lib/photos";
export async function GET() {
  if (!(await adminAllowed()))
    return new Response("Brak dostępu", { status: 403 });
  try {
    const db = getSupabase();
    const [sub, metrics, orders] = await Promise.all([
      db
        .from("bnp_submissions")
        .select("*")
        .order("created", { ascending: false })
        .limit(200),
      db.from("bnp_metrics").select("*"),
      db
        .from("bnp_orders")
        .select(
          "id,plan,amount,offer,status,session_id,payment_intent,created_at,paid_at,offer_id",
        )
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    const errors = [
      ["zgłoszenia", sub.error],
      ["statystyki", metrics.error],
      ["zamówienia", orders.error],
    ] as const;
    for (const [section, error] of errors)
      if (error) {
        console.error("Supabase panel", section, error.code);
        throw new Error(
          "Nie udało się odczytać sekcji „" +
            section +
            "”. Sprawdź konfigurację Supabase. Kod: " +
            (error.code || "połączenie"),
        );
      }
    return Response.json(
      {
        offers: await listOffers(true),
        categories: await listCategories(),
        submissions: sub.data?.map((s) => ({
          ...s,
          data: JSON.stringify(s.data),
        })),
        metrics: metrics.data,
        orders: orders.data,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać panelu. Sprawdź konfigurację bazy.",
      },
      { status: 500 },
    );
  }
}
function valid(o: any): o is Offer {
  return (
    (o?.metaTitle === undefined || (typeof o.metaTitle === "string" && o.metaTitle.length <= 120)) &&
    (o?.metaDescription === undefined || (typeof o.metaDescription === "string" && o.metaDescription.length <= 320)) &&
    (o?.guides === undefined || (Array.isArray(o.guides) && o.guides.length <= 3 &&
      o.guides.every((slug: unknown) => Object.values(holiday).some((g) => g.slug === slug)))) &&
    (o?.guideKind === undefined || ["offer", "idea"].includes(o.guideKind)) &&
    (o?.fulfillment === undefined || (typeof o.fulfillment === "string" && o.fulfillment.length <= 250)) &&
    typeof o?.id === "string" &&
    /^[a-z0-9-]{1,100}$/.test(o.id) &&
    typeof o.slug === "string" &&
    /^[a-z0-9-]{1,100}$/.test(o.slug) &&
    [
      "title",
      "company",
      "summary",
      "conditions",
      "address",
      "area",
      "companySlug",
      "badge",
      "start",
      "end",
      "verified",
      "price",
      "oldPrice",
      "image",
      "source",
    ].every((k) => typeof o[k] === "string" && o[k].length < 5000) &&
    (!o.logo || (typeof o.logo === "string" && o.logo.length < 2000 && (/^https:\/\//.test(o.logo) || /^\/brands\/[a-zA-Z0-9_.-]+$/.test(o.logo)))) &&
    ["published", "draft", "archived"].includes(o.status) &&
    Array.isArray(o.days) &&
    o.days.length > 0 &&
    o.days.every((d: any) => Number.isInteger(d) && d >= 0 && d <= 6) &&
    ([
      "pizza",
      "beauty",
      "spa",
      "gym",
      "shopping",
      "cinema",
      "coffee",
      "pancakes",
    ].includes(o.image) ||
      photoName.test(o.image)) &&
    /^https?:\/\//.test(o.source) &&
    (!o.start || /^\d{4}-\d{2}-\d{2}$/.test(o.start)) &&
    (!o.end || /^\d{4}-\d{2}-\d{2}$/.test(o.end)) &&
    (!o.start || !o.end || o.start <= o.end)
  );
}
export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await adminAllowed()))
    return new Response("Brak dostępu", { status: 403 });
  let action: string | undefined;
  try {
    const raw = await req.text();
    if (raw.length > 100000)
      return new Response("Za dużo danych", { status: 413 });
    const data = JSON.parse(raw),
      db = getSupabase();
    action = data.action;
    if (data.action === "save") {
      if (!valid(data.offer) || !(await listCategories()).some((c) => c.id === data.offer.category))
        return Response.json(
          { error: "Sprawdź pola, adres URL, daty i dni." },
          { status: 400 },
        );
      const all = await listOffers(true);
      if (all.some((o) => o.slug === data.offer.slug && o.id !== data.offer.id))
        return Response.json(
          { error: "Ten adres oferty jest zajęty." },
          { status: 400 },
        );
      await saveOffer(data.offer);
    } else if (data.action === "deleteOffer") {
      const offer = (await listOffers(true)).find((o) => o.id === data.id);
      if (!offer) return Response.json({ ok: true });
      if (offer.sponsored)
        return Response.json({ error: "Płatną ofertę możesz zarchiwizować." }, { status: 409 });
      await saveOffer({ ...offer, status: "deleted" });
    } else if (data.action === "verifyOffer") {
      const offer = (await listOffers(true)).find((o) => o.id === data.id);
      if (!offer) return Response.json({ error: "Oferta niedostępna." }, { status: 404 });
      await saveOffer({ ...offer, verified: today() });
    } else if (data.action === "setFacebookShared") {
      if (typeof data.id !== "string" || typeof data.shared !== "boolean")
        return Response.json({ error: "Nieprawidłowy status Facebooka." }, { status: 400 });
      const offer = (await listOffers(true)).find((o) => o.id === data.id);
      if (!offer) return Response.json({ error: "Oferta niedostępna." }, { status: 404 });
      if ((data.shared || offer.facebookSharedAt) && !(await setFacebookShared(offer, data.shared)))
        return Response.json({ error: "Oferta niedostępna." }, { status: 404 });
    } else if (data.action === "moveOffers") {
      if (!Array.isArray(data.ids) || !data.ids.length || data.ids.length > 100 ||
        !(await listCategories()).some((c) => c.id === data.category))
        return Response.json({ error: "Zaznacz oferty i wybierz kategorię docelową." }, { status: 400 });
      const offers = (await listOffers(true)).filter((o) => data.ids.includes(o.id));
      if (offers.length) {
        const { error } = await db.from("bnp_offers").upsert(offers.map((o) => offerRecord({ ...o, category: data.category })));
        if (error) throw error;
      }
    } else if (data.action === "bulk") {
      if (
        !Array.isArray(data.ids) ||
        data.ids.length > 100 ||
        !["published", "draft", "archived"].includes(data.status)
      )
        return new Response("Invalid", { status: 400 });
      for (const o of (await listOffers(true)).filter((o) =>
        data.ids.includes(o.id),
      ))
        await saveOffer({ ...o, status: data.status });
    } else if (
      ["archiveSubmission", "restoreSubmission", "deleteSubmission"].includes(
        data.action,
      )
    ) {
      const { error } = await db
        .from("bnp_submissions")
        .update({
          archived_at:
            data.action === "restoreSubmission"
              ? null
              : new Date().toISOString(),
        })
        .eq("id", data.id);
      if (error) throw error;
    } else if (data.action === "approveOrder") {
      const { data: order, error } = await db
        .from("bnp_orders")
        .select("*")
        .eq("id", data.id)
        .single();
      if (error) throw error;
      if (order.status === "published") return Response.json({ ok: true });
      if (order.status !== "paid_review")
        return Response.json(
          { error: "To zamówienie nie oczekuje na akceptację." },
          { status: 409 },
        );
      if (order.offer.end && order.offer.end < today())
        return Response.json(
          { error: "Promocja wygasła. Odrzuć zamówienie i zwróć wpłatę." },
          { status: 400 },
        );
      const session = await getStripe().checkout.sessions.retrieve(
        order.session_id,
        { expand: ["payment_intent.latest_charge"] },
      );
      if (!validPaidSession(session, order))
        return Response.json(
          { error: "Stripe nie potwierdza prawidłowej płatności." },
          { status: 409 },
        );
      const paymentIntent = session.payment_intent;
      const charge =
        paymentIntent && typeof paymentIntent !== "string"
          ? paymentIntent.latest_charge
          : null;
      if (
        charge &&
        typeof charge !== "string" &&
        (charge.refunded || charge.disputed)
      ) {
        const { error: blockError } = await db.rpc("bnp_block_order", {
          p_payment_intent:
            typeof paymentIntent === "string"
              ? paymentIntent
              : paymentIntent?.id,
          p_status: charge.refunded ? "refunded" : "disputed",
        });
        if (blockError) throw blockError;
        return Response.json(
          {
            error:
              "Wpłata została zwrócona lub jest sporna. Publikacja jest zablokowana.",
          },
          { status: 409 },
        );
      }
      const images: Record<string, string> = {
        jedzenie: "pizza",
        beauty: "beauty",
        "sport-i-relaks": "gym",
        zakupy: "shopping",
        rozrywka: "cinema",
        uslugi: "coffee",
        "dla-dzieci": "cinema",
      };
      const p = order.offer;
      const offer = {
        ...p,
        id: "platna-" + order.id,
        slug: "platna-" + order.id,
        companySlug: "firma-" + order.id,
        category: p.category,
        badge: p.badge || "OFERTA",
        image: images[p.category] || "shopping",
        start: "",
        end: p.end || "",
        verified: today(),
        status: "published",
        featured: order.plan === "featured",
        sponsored: true,
        price: "",
        oldPrice: "",
      };
      const { error: approveError } = await db.rpc("bnp_approve_order", {
        p_order_id: order.id,
        p_data: offer,
      });
      if (approveError) throw approveError;
    } else if (data.action === "refundOrder") {
      const { data: order, error } = await db
        .from("bnp_orders")
        .select("*")
        .eq("id", data.id)
        .single();
      if (error) throw error;
      if (
        !["paid_review", "refund_pending"].includes(order.status) ||
        !order.payment_intent
      )
        return Response.json(
          { error: "Zwrot nie jest dostępny dla tego zamówienia." },
          { status: 409 },
        );
      const refund = await getStripe().refunds.create(
        { payment_intent: order.payment_intent },
        { idempotencyKey: "bnp-reject-" + order.id },
      );
      if (refund.status === "failed" || refund.status === "canceled")
        throw new Error("Refund failed");
      const { error: blockError } = await db.rpc("bnp_block_order", {
        p_payment_intent: order.payment_intent,
        p_status: refund.status === "succeeded" ? "refunded" : "refund_pending",
      });
      if (blockError) throw blockError;
    } else return new Response("Nieznana operacja", { status: 400 });
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          action === "approveOrder" || action === "refundOrder"
            ? "Operacja nie została potwierdzona. Odśwież panel i sprawdź status w Stripe przed ponowieniem."
            : "Zapis nie został potwierdzony. Odśwież panel i sprawdź stan przed ponowieniem.",
      },
      { status: 500 },
    );
  }
}

