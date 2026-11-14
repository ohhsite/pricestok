import type { Offer } from "./data";
export function shareLink(origin: string, slug: string, company = false) {
  const url = new URL("/promocja/" + encodeURIComponent(slug), origin);
  url.search = new URLSearchParams({utm_source:"facebook",utm_medium:"social",utm_campaign:company ? "firmy" : "promocje",utm_content:slug}).toString();
  return url.toString();
}
export function sharePost(offer: Offer, url: string, company = false) {
  if (offer.kind === "event") {
    return [offer.title, offer.summary, `Gdzie: ${offer.address}`, offer.conditions.replaceAll("\\n", "\n"), `Szczegóły: ${url}`].filter(Boolean).join("\n\n");
  }
  return [company ? `${offer.company} — poznaj naszą ofertę w Białymstoku!` : `Lokalna okazja w Białymstoku: ${offer.company}`, offer.title, offer.summary, `Gdzie: ${offer.address}`, offer.end ? `Do: ${offer.end}` : "Aktualną dostępność potwierdź u firmy.", `Warunki: ${offer.conditions.replaceAll("\\n", "\n")}`, `Szczegóły: ${url}`].join("\n\n");
}

export function shareGraphic(slug: string) {
  return "/grafika-oferty/" + encodeURIComponent(slug) + "?v=3";
}
