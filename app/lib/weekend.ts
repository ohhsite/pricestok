import groups from "./weekend-2026-11-21.json" with { type: "json" };
import type { Offer } from "./data";
export const weekendGroups = groups;
export const weekendPath = "/weekend-bialystok-21-22-listopada-2026";
export const weekendOffers: Offer[] = groups.map((group) => ({
  id: "weekend-21-22-listopada-2026-" + group.id,
  slug: "weekend-21-22-listopada-2026-" + group.id,
  kind: "event",
  title: group.name + " — weekend 21–22 listopada",
  company: "PriceStok — przewodnik na weekend",
  companySlug: "pricestok-weekend",
  category: group.category,
  badge: "21–22 listopada",
  summary: group.intro,
  conditions: group.events.map((event) => `${event.title}: ${event.when}. ${event.address}. ${event.price}. ${event.note}`).join("\n\n") + "\n\nWszystkie źródła i szczegóły znajdziesz w przewodniku. Dostępność biletów i zapisów sprawdź u organizatora. Grafika poglądowa.",
  address: "Białystok" + (group.id === "dzieci" ? " i Wasilków" : ""),
  area: "Białystok" + (group.id === "dzieci" ? " i okolice" : ""),
  source: "https://pricestok.pl" + group.path,
  image: group.image,
  logo: "/pricestok-logo.svg",
  days: [6, 0],
  start: "2026-11-21",
  end: "2026-11-22",
  verified: "2026-11-20",
  status: "published",
  featured: false,
  price: "Ceny i zapisy przy wydarzeniach",
  oldPrice: "",
}));
