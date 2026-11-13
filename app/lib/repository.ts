import "server-only";
import { getSupabase } from "./supabase";
import { databaseConfigured } from "./config";
import { seeds, type AdminOffer, type Offer } from "./data";
type OfferRow = {
  id: string;
  data: Offer;
  added_at?: string | null;
  facebook_shared_at?: string | null;
};

export async function listOffers(admin = false): Promise<AdminOffer[]> {
  const map = new Map(seeds.map((o) => [o.id, o]));
  if (!databaseConfigured()) return [...map.values()];
  const db = getSupabase();
  const columns = admin ? "id,data,added_at,facebook_shared_at" : "id,data";
  const { data, error } = await db.from("bnp_offers").select(columns).overrideTypes<OfferRow[]>();
  if (error) {
    console.error("Supabase bnp_offers", error.code || "network");
    if (!admin) return [...map.values()];
    throw new Error(
      "Odczyt ofert nie powiódł się. Sprawdź URL projektu i klucz serwerowy Supabase. Kod: " +
        (error.code || "połączenie"),
    );
  }
  for (const row of data || []) {
    if (row.data.status === "deleted") map.delete(row.id);
    else {
      const offer: AdminOffer = row.data;
      if (admin) {
        offer.addedAt = map.has(row.id) ? null : row.added_at;
        offer.facebookSharedAt = row.facebook_shared_at;
      }
      map.set(row.id, offer);
    }
  }
  if (admin) return [...map.values()];
  const counts = await getSupabase().rpc("bnp_heart_counts");
  for (const row of counts.data || []) {
    const offer = map.get(row.offer_id);
    if (offer) map.set(row.offer_id, { ...offer, hearts: Number(row.total) });
  }
  const billing = await getSupabase()
    .from("bnp_billing")
    .select("id,state,approved,blocked,paid_until")
    .in("plan", ["monthly", "oneoff", "quarter", "halfyear", "year"]);
  if (billing.error)
    console.error("Supabase bnp_billing", billing.error.code || "network");
  const subscriptions = new Map(
    (billing.data || []).map((r) => ["abonament-" + r.id, r]),
  );
  return [...map.values()].filter((o) => {
    if (!o.id.startsWith("abonament-")) return true;
    const row = subscriptions.get(o.id);
    return (
      !!row &&
      row.approved &&
      !row.blocked &&
      row.state === "active" &&
      !!row.paid_until &&
      Date.parse(row.paid_until) > Date.now()
    );
  });
}
export function offerRecord({ addedAt, facebookSharedAt, ...offer }: AdminOffer) {
  return { id: offer.id, data: offer };
}

export async function setFacebookShared(offer: Offer, shared: boolean) {
  const db = getSupabase();
  if (shared && seeds.some((seed) => seed.id === offer.id)) {
    const { error } = await db.from("bnp_offers").upsert(
      offerRecord(offer), { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }
  const { data, error } = await db.from("bnp_offers")
    .update({ facebook_shared_at: shared ? new Date().toISOString() : null })
    .eq("id", offer.id)
    .neq("data->>status", "deleted")
    .select("id");
  if (error) throw error;
  return !!data?.length;
}

export async function saveOffer(o: Offer) {
  const { error } = await getSupabase()
    .from("bnp_offers")
    .upsert(offerRecord(o));
  if (error) throw new Error("Nie udało się zapisać oferty.");
}

