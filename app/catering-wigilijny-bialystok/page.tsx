import { HolidayPage } from "../components/Holiday";
import { holiday } from "../lib/holiday";
import CateringCards from "../components/CateringCards";
import { checkedOn, comparisonPath } from "../lib/christmas-catering";
const guide = holiday.food;
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Catering wigilijny Białystok 2026 — menu, ceny i odbiór",
  description: "Catering na Wigilię 2026 w Białymstoku: restauracje, menu, ceny zestawów i terminy zamówień. Sprawdź potwierdzone oferty i status cenników.",
  alternates: { canonical: "/" + guide.slug },
};
export default function Catering() {
  return <HolidayPage guide={guide}>
    <div className="holiday-editorial-intro"><p className="eyebrow">SEZON 2026 · AKTUALIZACJA {checkedOn}</p>
      <p>Zamów całe menu albo tylko potrawy, których nie chcesz przygotowywać samodzielnie. Poniżej znajdziesz osiem kuchni z Białegostoku i okolic oraz informację, czy firma potwierdziła już tegoroczną ofertę.</p>
      <a className="button" href={comparisonPath}>Porównaj ceny cateringu na Wigilię 2026 →</a>
    </div>
    <section className="holiday-links"><h2>Gdzie zamówić catering świąteczny w Białymstoku?</h2>
      <p>Traugutta3 i Dwór Czarneckiego opublikowały oferty na 2026 rok. Pozostałe miejsca pokazujemy z oznaczeniem statusu — bez przepisywania zeszłorocznych cen jako aktualnych.</p>
      <CateringCards />
    </section>
    <section className="holiday-editorial-intro"><h2>Przed złożeniem zamówienia</h2><p>Sprawdź jednostkę ceny: kilogram, litr, sztuka, porcja czy cały zestaw. Do kosztu potraw mogą dojść opakowania i dowóz. Ustal termin odbioru, sposób przechowywania oraz instrukcję podgrzewania.</p><a href={comparisonPath} className="text-link">Zobacz zestawienie cen i koszt na osobę →</a></section>
  </HolidayPage>;
}
