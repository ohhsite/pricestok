import "server-only";
import { getSupabase } from "./supabase";
import { databaseConfigured } from "./config";
import { seeds, Offer } from "./data";
export async function listOffers(admin = false): Promise<Offer[]> {
  const map = new Map(seeds.map((o) => [o.id, o]));
  if (!databaseConfigured()) return [...map.values()];
  const { data, error } = await getSupabase()
    .from("bnp_offers")
    .select("id,data");
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
    else map.set(row.id, row.data as Offer);
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
export async function saveOffer(o: Offer) {
  const { error } = await getSupabase()
    .from("bnp_offers")
    .upsert({ id: o.id, data: o });
  if (error) throw new Error("Nie udało się zapisać oferty.");
}
