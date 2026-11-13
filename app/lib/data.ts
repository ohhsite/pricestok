import reviewedOffers from "./reviewed-offers.json" with { type: "json" };
export type Offer = {
  id: string;
  slug: string;
  title: string;
  company: string;
  companySlug: string;
  category: string;
  badge: string;
  summary: string;
  conditions: string;
  address: string;
  area: string;
  source: string;
  image: string;
  logo?: string;
  days: number[];
  start: string;
  end: string;
  verified: string;
  status: string;
  featured: boolean;
  price: string;
  oldPrice: string;
  sponsored?: boolean;
  hearts?: number;
  metaTitle?: string;
  metaDescription?: string;
  guides?: string[];
  guideKind?: "offer" | "idea";
  fulfillment?: string;
};
export type AdminOffer = Offer & {
  addedAt?: string | null;
  facebookSharedAt?: string | null;
};
export const categories = [
  { id: "jedzenie", name: "Jedzenie", icon: "Utensils", color: "#fff0e6" },
  { id: "beauty", name: "Beauty", icon: "Sparkles", color: "#f5eafb" },
  {
    id: "sport-i-relaks",
    name: "Sport i relaks",
    icon: "Dumbbell",
    color: "#eaf2e7",
  },
  { id: "rozrywka", name: "Rozrywka", icon: "Ticket", color: "#e9edff" },
  { id: "zakupy", name: "Zakupy", icon: "ShoppingBag", color: "#fff3d8" },
  { id: "uslugi", name: "Usługi", icon: "Wrench", color: "#e7f1f1" },
  { id: "dla-dzieci", name: "Dla dzieci", icon: "Baby", color: "#fce9ed" },
];
// Current source-checked offers; removed legacy entries remain recoverable in the database.
export const seeds: Offer[] = [...reviewedOffers];
export function today() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(
    new Date(),
  );
}
export function isActive(o: Offer, date = today()) {
  return (
    o.status === "published" &&
    (!o.start || o.start <= date) &&
    (!o.end || o.end >= date)
  );
}
export function weekday(date = today()) {
  return new Date(date + "T12:00:00Z").getUTCDay();
}
export function dateLabel(v: string) {
  return v
    ? new Date(v + "T12:00:00").toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
      })
    : "Oferta cykliczna";
}

