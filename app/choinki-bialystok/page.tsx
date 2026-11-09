import { HolidayPage } from "../components/Holiday";
import HolidayBrand from "../components/HolidayBrand";
import { holiday } from "../lib/holiday";
const guide = holiday.trees;
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Gdzie kupić choinkę w Białymstoku 2026? Punkty i dostawa",
  description: "Żywe choinki w Białymstoku: punkt przy Galerii Biała, odbiór i dostawa. Sprawdź również lokalizacje sprzedaży w mieście i okolicach.",
  alternates: { canonical: "/" + guide.slug },
};
export default function Trees() {
  const shopUrl = process.env.CHRISTMAS_TREES_URL;
  const href = shopUrl && /^https:\/\//.test(shopUrl) ? shopUrl : "https://choinki.bialystok.pl/";
  return <HolidayPage guide={guide}>
    <section className="tree-feature">
      <div className="tree-feature-photo"><img src="/brands/choinki-biala-photo.webp" alt="Choinka świąteczna — oferta przy Galerii Biała" /><span>BIAŁYSTOK · GALERIA BIAŁA</span></div>
      <div className="tree-feature-body"><HolidayBrand slug="choinki-biala" name="Choinki Białystok" />
        <h2>Choinki przy Galerii Biała — wybierz na miejscu lub zamów z dowozem</h2>
        <p>Jodły kaukaskie, świerki cięte i drzewka w donicach. Punkt przy Atrium / Galerii Biała pozwala połączyć wybór choinki z zakupami w mieście; opcję dostawy sprawdzisz w sklepie.</p>
        <p><strong>Gdzie:</strong> ul. Czesława Miłosza 2, Białystok — przy Galerii Biała.</p>
        <p>Na stronie sprawdzisz dostępne wysokości, ceny, warunki dostawy i informacje o otwarciu punktu w sezonie.</p>
        <a className="button" href={href} target="_blank" rel="noopener noreferrer">Sprawdź choinki, ceny i dostawę ↗</a>
      </div>
    </section>
    <section className="holiday-editorial-intro"><h2>Gdzie jeszcze szukać choinek w Białymstoku i okolicach?</h2>
      <p>Poniżej zestawiamy lokalizacje wskazywane w publicznych informacjach sprzedawców. Część komunikatów dotyczy sezonu 2025 — potwierdź tegoroczny termin sprzedaży przed wyjazdem. Nie przenosimy zeszłorocznych cen ani godzin na grudzień 2026.</p>
      <div className="holiday-table-scroll"><table className="holiday-table"><thead><tr><th>Miejsce</th><th>Lokalizacja</th><th>Status informacji</th></tr></thead><tbody>
        <tr><td>Nadleśnictwo Dojlidy</td><td>Białystok, al. Tysiąclecia Państwa Polskiego 75</td><td>Odnaleziony komunikat dotyczy 2025; terminy 2026 do potwierdzenia.</td></tr>
        <tr><td>Skibiccy — punkty sezonowe</td><td>m.in. ul. 42 Pułku Piechoty, Mieszka I i Hugona Kołłątaja</td><td>Lokalizacje podane na stronie szkółki; cennik świąteczny opisany jako 2025.</td></tr>
        <tr><td>Szkółka Skibiccy</td><td>Kuriany 127, okolice Białegostoku</td><td>Stała lokalizacja; dostępność drzewek świątecznych i aktualne ceny do sprawdzenia.</td></tr>
        <tr><td>Nadleśnictwo Żednia</td><td>Żednia 5; w poprzednim sezonie również Zabłudów, ul. Mickiewicza 25</td><td>Opublikowany harmonogram dotyczy zimy 2025/2026, a nie grudnia 2026.</td></tr>
      </tbody></table></div>
      <p className="holiday-source-list">Źródła lokalizacji: <a href="https://dojlidy.bialystok.lasy.gov.pl/sprzedaz-choinek" rel="nofollow noopener noreferrer" target="_blank">Dojlidy</a> · <a href="https://skibiccy.pl/choinki-bialystok/" rel="nofollow noopener noreferrer" target="_blank">Skibiccy</a> · <a href="https://zednia.bialystok.lasy.gov.pl/sprzedaz-drewna-choinek-i-sadzonek" rel="nofollow noopener noreferrer" target="_blank">Żednia</a>. Weryfikacja: 9 listopada 2026.</p>
    </section>
    <section className="holiday-editorial-intro"><h2>Choinka cięta czy w donicy?</h2><p>Cięte drzewko dobierz do wysokości pokoju, zostawiając miejsce na stojak i czubek. Jeśli planujesz późniejsze sadzenie, zapytaj, czy choinka rosła w pojemniku i ma zachowaną bryłę korzeniową. Sama doniczka nie oznacza, że drzewko przyjmie się w ogrodzie.</p><h2>Odbiór czy dostawa?</h2><p>Przy dostawie sprawdź obszar dowozu, opłatę, dostępne terminy i możliwość wniesienia. Przy odbiorze osobistym upewnij się, że wybrany rozmiar zmieści się w samochodzie i czy punkt zapewnia pakowanie.</p></section>
  </HolidayPage>;
}
