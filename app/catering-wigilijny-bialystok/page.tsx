import { HolidayPage } from "../components/Holiday";
import { holiday } from "../lib/holiday";
import CateringCards from "../components/CateringCards";
import { comparisonPath } from "../lib/christmas-catering";
const guide = holiday.food;
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Catering wigilijny Białystok 2026 — menu, ceny i odbiór",
  description: "Catering na Wigilię 2026 w Białymstoku: restauracje, menu, ceny zestawów i terminy zamówień. Sprawdź potwierdzone oferty i status cenników.",
  alternates: { canonical: "/" + guide.slug },
};
export default function Catering() {
  return <HolidayPage guide={guide}>
    <div className="holiday-editorial-intro">
      <p>Zamów całe menu albo tylko potrawy, których nie chcesz przygotowywać samodzielnie. Wybierz restaurację w Białymstoku lub okolicach i sprawdź menu, ceny oraz odbiór.</p>
      <a className="button" href={comparisonPath}>Porównaj ceny →</a>
    </div>
    <section className="holiday-links"><h2>Gdzie zamówić catering świąteczny w Białymstoku?</h2>
      <p>Zestawy na rodzinny stół, pierogi na wynos i przekąski na spotkanie firmowe.</p>
      <CateringCards />
    </section>
    <section className="holiday-editorial-intro"><h2>Wigilia w restauracji</h2>
      <article className="seasonal-highlight"><div className="holiday-brand holiday-brand-dark"><img src="/brands/na-lipowej.svg" alt="Logo Restauracja Na Lipowej" loading="lazy" /></div><div><p className="eyebrow">24 GRUDNIA 2026 · GODZ. 18:00</p><h3>Kolacja wigilijna Na Lipowej / Hotel Cristal</h3><strong className="catering-price">349 zł / osobę dorosłą</strong><p>Bufet świąteczny, desery, napoje i wizyta Mikołaja dla najmłodszych. Dzieci 4–12 lat: 175 zł; dzieci do 4 lat bez opłaty. Kolacja na miejscu przy ul. Lipowej 3/5.</p><p>Rezerwacje do 22 grudnia: 695 302 508 lub 695 802 114.</p><a className="text-link" href="https://www.nalipowej.pl/kolacja-wigilijna" target="_blank" rel="noopener noreferrer">Sprawdź kolację wigilijną ↗</a></div></article>
    </section>
    <section className="holiday-editorial-intro"><h2>Przed złożeniem zamówienia</h2><p>Sprawdź jednostkę ceny: kilogram, litr, sztuka, porcja czy cały zestaw. Do kosztu potraw mogą dojść opakowania i dowóz. Ustal termin odbioru, sposób przechowywania oraz instrukcję podgrzewania.</p><a href={comparisonPath} className="text-link">Zobacz zestawienie cen i koszt na osobę →</a></section>
  </HolidayPage>;
}
