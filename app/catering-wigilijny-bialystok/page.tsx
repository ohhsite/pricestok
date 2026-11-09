import { HolidayPage } from "../components/Holiday";
import { holiday } from "../lib/holiday";

const guide = holiday.food;
export const dynamic = "force-dynamic";
export const metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: "/" + guide.slug },
};

export default function Catering() {
  return (
    <HolidayPage guide={guide}>
      <section className="detail-box">
        <h2>Gdzie sprawdzić menu wigilijne</h2>
        <p>Hotel Leśny w Białymstoku publikuje ofertę cateringu wigilijnego. Aktualne menu, dostępność i termin odbioru potwierdź bezpośrednio u firmy.</p>
        <a className="text-link" href="https://www.lesny.bialystok.pl/catering">Zobacz ofertę Hotelu Leśnego ↗</a>
      </section>
      <section className="detail-box">
        <h2>Hokus Pokus przy Lipowej 37</h2>
        <p>Bar oferuje catering wigilijny z odbiorem lub dostawą. Cenę i termin przyjmowania zamówień potwierdź przed zakupem.</p>
        <a className="text-link" href="https://hokuspokus.pl/catering/">Sprawdź catering Hokus Pokus ↗</a>
      </section>
      <section className="detail-box">
        <h2>Jak porównać zamówienia</h2>
        <p>Jeśli potrzebujesz tylko uszek, pierogów lub barszczu, zapytaj o zakup na sztuki albo na wagę. Przy pełnym menu porównaj liczbę porcji, termin zamówienia oraz koszt dostawy lub miejsce odbioru.</p>
      </section>
    </HolidayPage>
  );
}
