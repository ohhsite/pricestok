import { HolidayPage } from "../components/Holiday";
import { holiday } from "../lib/holiday";

const guide = holiday.trees;
export const dynamic = "force-dynamic";
export const metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: "/" + guide.slug },
};

export default function Trees() {
  const shopUrl = process.env.CHRISTMAS_TREES_URL;
  return (
    <HolidayPage guide={guide}>
      <section className="detail-box">
        <div className="eyebrow">OFERTA WŁASNA</div>
        <h2>Nasze choinki przy Atrium Biała</h2>
        <p>W naszym punkcie w Białymstoku oferujemy jodły kaukaskie, świerki cięte i drzewka w donicach. Choinkę możesz odebrać osobiście lub zamówić z dostawą.</p>
        {shopUrl && /^https:\/\//.test(shopUrl) ? (
          <a className="button" href={shopUrl}>Sprawdź ceny i zamów choinkę ↗</a>
        ) : (
          <a className="button outline" href="https://www.google.com/maps/search/?api=1&query=Atrium+Bia%C5%82a+Bia%C5%82ystok">Zobacz okolice punktu na mapie ↗</a>
        )}
      </section>
      <section className="detail-box">
        <h2>Wybierz drzewko i sposób odbioru</h2>
        <p>Zmierz miejsce na choinkę razem ze stojakiem i ozdobą na czubku. Jeśli zamawiasz z dowozem, przed zakupem potwierdź termin, koszt dostawy i możliwość wniesienia.</p>
      </section>
    </HolidayPage>
  );
}
