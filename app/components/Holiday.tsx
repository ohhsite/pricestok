import { Gift, CookingPot, TreePine, ArrowUpRight } from "lucide-react";
import { listOffers } from "../lib/repository";
import { isActive } from "../lib/data";
import { holiday } from "../lib/holiday";
import { Header, Footer } from "./Shell";
import type { ReactNode } from "react";

export function HolidayLinks({ current }: { current?: string }) {
  return (
    <section className="holiday-links" aria-labelledby="holiday-heading">
      <div className="holiday-heading">
        <span className="eyebrow">ZIMOWY PRZEWODNIK PRICESTOK</span>
        <h2 id="holiday-heading">{current ? "Zaplanuj resztę świąt" : "Święta w Białymstoku"}</h2>
        {!current && <p>Znajdź prezent, zamów potrawy na Wigilię albo wybierz choinkę z dostawą.</p>}
      </div>
      <div className="holiday-grid">
        {[
          { guide: holiday.gifts, Icon: Gift, theme: "gifts", cta: "Znajdź prezent" },
          { guide: holiday.food, Icon: CookingPot, theme: "food", cta: "Sprawdź catering" },
          { guide: holiday.trees, Icon: TreePine, theme: "trees", cta: "Zobacz choinki" },
        ].filter(({ guide }) => guide.slug !== current).map(({ guide, Icon, theme, cta }) => (
          <a key={guide.slug} href={"/" + guide.slug} className={`holiday-card holiday-${theme}`}>
            <Icon size={26} aria-hidden="true" />
            <strong>{guide.label}</strong>
            <span>{guide.description}</span>
            <b>{cta} <ArrowUpRight size={16} aria-hidden="true" /></b>
          </a>
        ))}
      </div>
    </section>
  );
}

export async function HolidayPage({ guide, children }: {
  guide: (typeof holiday)[keyof typeof holiday];
  children: ReactNode;
}) {
  const offers = (await listOffers()).filter((offer) =>
    offer.guides?.includes(guide.slug) && isActive(offer),
  );
  return (
    <>
      <Header />
      <main className="container inner-main">
        <p className="eyebrow">PRICESTOK · ŚWIĘTA W BIAŁYMSTOKU</p>
        <h1 className="page-title">{guide.title}</h1>
        <p className="lead">{guide.description}</p>
        {children}
        {offers.length > 0 && (
          <section className="holiday-links">
            <h2>Aktualne propozycje</h2>
            <div className="holiday-grid">
              {offers.map((offer) => (
                <article className="detail-box" key={offer.id}>
                  <div className="eyebrow">{offer.guideKind === "idea" ? "Propozycja" : "Promocja"}{offer.sponsored && " · Sponsorowane"}</div>
                  <h3><a href={"/promocja/" + offer.slug}>{offer.title}</a></h3>
                  <p>{offer.summary}</p>
                  <p>{[offer.company, offer.address, offer.price].filter(Boolean).join(" · ")}</p>
                  {offer.fulfillment && <p>{offer.fulfillment}</p>}
                  {offer.end && <p>Ważna do {offer.end}</p>}
                  {offer.verified && <p>Sprawdzono {offer.verified}</p>}
                  <a href={offer.source} rel={offer.sponsored ? "sponsored" : undefined}>Źródło i warunki ↗</a>
                </article>
              ))}
            </div>
          </section>
        )}
        <HolidayLinks current={guide.slug} />
      </main>
      <Footer />
    </>
  );
}
