"use client";
import { useState } from "react";
import { comparisonPrice, housingMoney, sortHousing, type HousingOffer, type HousingSort } from "../lib/housing";
import styles from "./Housing.module.css";

const developerLogos: Record<string, string> = {
  "KTK Deweloper": "/brands/developers/ktk.svg",
  "Yuniversal Podlaski": "/brands/developers/yuniversal.png",
  "MERCISE": "/brands/developers/mercise.webp",
  "Sokołowscy Nieruchomości": "/brands/developers/sokolowscy.svg",
};

function OfferCard({ offer }: { offer: HousingOffer }) {
  const total = comparisonPrice(offer);
  const basis = offer.basis === "incomplete" ? "Dopłaty do potwierdzenia" : offer.basis === "apartment-only" ? "Bez opcjonalnych dodatków" : offer.basis === "optional-parking" ? "Z opcjonalnym parkingiem" : "Z parkingiem i komórką";
  return <article className={styles.card} id={offer.id}>
    <div className={styles.cardTop}>
      <div className={`${styles.developer} ${offer.developer === "Sokołowscy Nieruchomości" ? styles.developerDark : ""}`}>
        {/* Official brand assets are served locally without changing their artwork. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={developerLogos[offer.developer]} alt={offer.developer} width="112" height="36" loading="lazy" />
      </div>
      <span className={styles.cardState}>Rynek pierwotny</span>
    </div>
    <h3>{offer.investment}{offer.id.startsWith("polarna-") ? ` · lokal ${offer.id.split("-")[1]}` : offer.id.startsWith("jagienki-") ? ` · nr ${offer.id.split("-").at(-1)}` : ""}</h3>
    <p className={styles.address}>{offer.address} · {offer.district}</p>
    <div className={styles.features}><strong>{offer.area.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} m²</strong><span>{offer.rooms} {offer.rooms === 1 ? "pokój" : offer.rooms < 5 ? "pokoje" : "pokoi"}</span><span>{offer.floor === 0 ? "Parter" : `Piętro ${offer.floor}`}</span></div>
    <div className={styles.priceRow}>
      <div className={styles.total}><span>{total === null ? "Cena samego mieszkania" : "Cena porównawcza"}</span><strong>{offer.basis === "optional-parking" ? "od " : ""}{housingMoney(total ?? offer.price)}</strong></div>
      <a className={styles.offerLink} href={offer.source} target="_blank" rel="noopener noreferrer" aria-label={`Zobacz ofertę: ${offer.investment}, ${offer.area} m²`}>Zobacz ofertę</a>
    </div>
    <p className={styles.basis}>{basis}</p>
    <details className={styles.cardDetails}>
      <summary>Koszty i szczegóły</summary>
      <p className={styles.developerName}>Deweloper: {offer.developer} · stan deweloperski</p>
      <dl className={styles.costs}>
        <div><dt>Mieszkanie</dt><dd>{housingMoney(offer.price)}</dd></div>
        <div><dt>Parking{offer.basis === "optional-parking" ? " (opcjonalny)" : ""}</dt><dd>{offer.parking !== null ? `${offer.basis === "optional-parking" ? "od " : ""}${housingMoney(offer.parking)}` : offer.basis === "apartment-only" ? "Nie wliczamy" : "Do ustalenia"}</dd></div>
        <div><dt>Komórka / box</dt><dd>{offer.storageIncluded ? "W cenie" : offer.storage !== null ? housingMoney(offer.storage) : offer.basis === "apartment-only" ? "Opcjonalna, niewliczona" : "Do ustalenia"}</dd></div>
      </dl>
      <p className={styles.note}>{offer.note}</p>
      <p className={styles.source}>Sprawdzono 22.11.2026</p>
      {offer.detailsSource && <a className={styles.detailsLink} href={offer.detailsSource} target="_blank" rel="noopener noreferrer">{offer.id.startsWith("polarna-") ? "Plan i szczegóły lokalu" : "Źródło informacji o dodatkach"}</a>}
    </details>
  </article>;
}

export default function HousingCatalog({ offers, pending }: { offers: HousingOffer[]; pending: HousingOffer[] }) {
  const [sort, setSort] = useState<HousingSort>("price-asc");
  const [rooms, setRooms] = useState("all");
  const [developer, setDeveloper] = useState("all");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const reset = () => { setSort("price-asc"); setRooms("all"); setDeveloper("all"); setMinArea(""); setMaxArea(""); };
  const visible = sortHousing(offers.filter(o => (rooms === "all" || (rooms === "4+" ? o.rooms >= 4 : o.rooms === Number(rooms))) && (developer === "all" || o.developer === developer) && (!minArea || o.area >= Number(minArea)) && (!maxArea || o.area <= Number(maxArea))), sort);
  return <section id="oferty" className={styles.catalog} aria-label="Katalog mieszkań">
    <div className={styles.filterHeading}><div><p className={styles.kicker}>ZNAJDŹ SWÓJ UKŁAD</p><h2>Mieszkania w wybranym budżecie</h2></div><button onClick={reset} type="button" className={styles.reset}>Wyczyść filtry</button></div>
    <div className={styles.filters}>
      <label>Pokoje<select value={rooms} onChange={e => setRooms(e.target.value)}><option value="all">Dowolna liczba</option><option value="1">1 pokój</option><option value="2">2 pokoje</option><option value="3">3 pokoje</option><option value="4+">4 i więcej</option></select></label>
      <label>Deweloper<select value={developer} onChange={e => setDeveloper(e.target.value)}><option value="all">Wszyscy deweloperzy</option>{Array.from(new Set(offers.map(o => o.developer))).sort().map(d => <option key={d} value={d}>{d}</option>)}</select></label>
      <label>Metraż od (m²)<input type="number" min="0" step="0.01" inputMode="decimal" value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="np. 30" /></label>
      <label>Metraż do (m²)<input type="number" min="0" step="0.01" inputMode="decimal" value={maxArea} onChange={e => setMaxArea(e.target.value)} placeholder="np. 60" /></label>
      <label>Sortowanie<select value={sort} onChange={e => setSort(e.target.value as HousingSort)}><option value="price-asc">Cena: od najniższej</option><option value="price-desc">Cena: od najwyższej</option><option value="area-asc">Metraż: rosnąco</option><option value="area-desc">Metraż: malejąco</option><option value="unit-price">Cena lokalu za m²: rosnąco</option><option value="rooms-desc">Liczba pokoi: malejąco</option></select></label>
    </div>
    <p className={styles.resultCount} role="status" aria-live="polite">Wyniki: <strong>{visible.length}</strong> z {offers.length}. Sortowanie według ceny porównawczej; cena za m² dotyczy samego lokalu.</p>
    <div className={styles.grid}>{visible.map(o => <OfferCard key={o.id} offer={o} />)}</div>
    {!visible.length && <div className={styles.empty}><h3>Brak mieszkań przy tych ustawieniach</h3><p>Zmień metraż lub liczbę pokoi albo wybierz większy budżet. Nie doliczamy tu ofert z nieustalonym kosztem obowiązkowych dodatków.</p><button className="button" onClick={reset}>Wyczyść filtry</button></div>}
    {!!pending.length && <details className={styles.pending}><summary>Inne propozycje — koszt dodatków wymaga potwierdzenia ({pending.length})</summary><p>To ceny samych lokali. Nie zaliczamy tych ofert do wyników w ustalonym budżecie i nie przedstawiamy ich jako pełnej ceny zakupu.</p><div className={styles.grid}>{pending.map(o => <OfferCard key={o.id} offer={o} />)}</div></details>}
  </section>;
}
