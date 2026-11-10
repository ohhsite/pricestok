import { Header, Footer } from "../components/Shell";
import HolidayBrand from "../components/HolidayBrand";
import { HolidayLinks } from "../components/Holiday";
import { siteUrl } from "../lib/config";
import { checkedOn, comparisonPath } from "../lib/christmas-catering";
export const dynamic = "force-dynamic";
const title = "Catering wigilijny Białystok 2026 — porównanie cen";
const description = "Ile kosztuje catering na Wigilię 2026 w Białymstoku? Zestawy rodzinne, finger food i ceny potraw z przeliczeniem na osobę, sztukę i litr.";
export const metadata = { title, description, alternates: { canonical: comparisonPath }, openGraph: { title, description, type: "article", url: comparisonPath, publishedTime: "2026-11-09T20:00:00+01:00", modifiedTime: "2026-11-09T20:00:00+01:00" } };
const traugutta = "https://butik.hoteltraugutta3.pl/pl/p/Zestaw-12-dan-wigilijnych-dla-4-5-osob/269";
const box = "https://butik.hoteltraugutta3.pl/pl/p/Swiateczny-BOX-FINGERFOOD-/395";
const dwor = "https://www.dworczarneckiego.pl/aktualnosci/wigilia-firmowa-bialystok-2026-w-dworze-czarneckiego";
const faqs = [
  { q: "Ile kosztuje catering wigilijny w Białymstoku w 2026 roku?", a: "W opublikowanych ofertach zestaw Traugutta3 dla 4–5 osób kosztuje 690 zł. Osobno dostępne są przekąski finger food: box Traugutta3 za 249 zł oraz warianty Dworu Czarneckiego po 69 lub 85 zł na osobę. To różne rodzaje zamówień, dlatego nie tworzą jednego przedziału cen pełnej Wigilii." },
  { q: "Do kiedy można zamówić catering Traugutta3 na święta 2026?", a: "Hotel podaje termin zamówień do 20 grudnia 2026. Odbiór osobisty odbywa się 23 grudnia w godzinach 14:00–20:00, a dowóz 24 grudnia w godzinach 8:00–12:00. Dostępność i koszt dostawy sprawdź przed zakupem." },
  { q: "Czy catering świąteczny można zamówić z dostawą?", a: "Traugutta3 oferuje dowóz 24 grudnia w godzinach 8:00–12:00. Koszt i dostępność dostawy pod swój adres sprawdź przed zakupem. W pozostałych firmach warunki dowozu ustal przy zamówieniu." },
];
export default function Comparison() {
  const base = siteUrl();
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: title, description, datePublished: "2026-11-09T20:00:00+01:00", dateModified: "2026-11-09T20:00:00+01:00", mainEntityOfPage: base + comparisonPath, author: { "@type": "Organization", name: "Redakcja PriceStok", url: base + "/o-nas" }, publisher: { "@type": "Organization", name: "PriceStok", url: base, logo: { "@type": "ImageObject", url: base + "/pricestok-logo.svg" } } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "PriceStok", item: base }, { "@type": "ListItem", position: 2, name: "Catering wigilijny", item: base + "/catering-wigilijny-bialystok" }, { "@type": "ListItem", position: 3, name: "Porównanie cen 2026", item: base + comparisonPath }] },
  ];
  return <><Header /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <main className="container inner-main holiday-article">
      <nav className="breadcrumbs"><a href="/">PriceStok</a> / <a href="/catering-wigilijny-bialystok">Catering wigilijny</a> / Porównanie cen 2026</nav>
      <header className="article-header"><p className="eyebrow">CENY · BIAŁYSTOK I OKOLICE · BOŻE NARODZENIE 2026</p><h1>{title}</h1><p className="lead">Gotowy zestaw na rodzinny stół, kilka potraw na wagę czy przekąski do biura? Zebraliśmy ceny i przeliczyliśmy koszt porcji, żeby łatwiej zaplanować świąteczny budżet.</p><p className="article-byline">Redakcja PriceStok · aktualizacja: {checkedOn}</p></header>
      <nav className="article-toc" aria-label="Spis treści"><a href="#ceny">Ceny zestawów</a><a href="#potrawy">Pojedyncze potrawy</a><a href="#koszty">Dodatkowe koszty</a><a href="#terminy">Terminy</a><a href="#pytania">Pytania i odpowiedzi</a></nav>
      <article>
        <section id="ceny"><h2>Ile kosztuje catering na Wigilię 2026?</h2><p>Zestaw Traugutta3 dla 4–5 osób kosztuje 690 zł. Na firmowe spotkanie możesz wybrać box przekąsek lub finger food z Dworu Czarneckiego. Więcej restauracji znajdziesz w <a href="/catering-wigilijny-bialystok">katalogu cateringu wigilijnego w Białymstoku</a>.</p>
          <p><strong>Pełne menu i finger food porównuj osobno.</strong> Zestaw rodzinny składa się z wielu potraw; pudełko przekąsek może służyć jako poczęstunek podczas spotkania. Różnica w cenie nie oznacza automatycznie różnicy w opłacalności tej samej kolacji.</p>
          <div className="holiday-table-scroll"><table className="holiday-table price-comparison"><caption>Ceny na {checkedOn}. Dostawa płatna osobno, zależnie od oferty.</caption><thead><tr><th>Firma i zamówienie</th><th>Cena</th><th>Zakres</th><th>Przeliczenie</th></tr></thead><tbody>
            <tr><td data-label="Firma i zamówienie"><HolidayBrand slug="traugutta3" name="Traugutta3" /><a href={traugutta} target="_blank" rel="noopener noreferrer">Traugutta3: zestaw wigilijny ↗</a></td><td data-label="Cena"><strong>690 zł</strong> / zestaw</td><td data-label="Zakres">Rekomendowany dla 4–5 osób</td><td data-label="Przeliczenie">138–172,50 zł / osobę</td></tr>
            <tr><td data-label="Firma i zamówienie"><HolidayBrand slug="traugutta3" name="Traugutta3" /><a href={box} target="_blank" rel="noopener noreferrer">Traugutta3: box finger food ↗</a></td><td data-label="Cena"><strong>249 zł</strong> / box</td><td data-label="Zakres">36 przekąsek, rekomendacja dla 5–6 osób</td><td data-label="Przeliczenie">41,50–49,80 zł / osobę; ok. 6,92 zł / szt.</td></tr>
            <tr><td data-label="Firma i zamówienie"><HolidayBrand slug="dwor-czarneckiego" name="Dwór Czarneckiego" /><a href={dwor} target="_blank" rel="noopener noreferrer">Dwór Czarneckiego: finger food ↗</a></td><td data-label="Cena"><strong>69 zł</strong> / osobę</td><td data-label="Zakres">6 przekąsek / osobę</td><td data-label="Przeliczenie">11,50 zł / przekąskę</td></tr>
            <tr><td data-label="Firma i zamówienie"><a href={dwor} target="_blank" rel="noopener noreferrer">Dwór Czarneckiego: większy wariant ↗</a></td><td data-label="Cena"><strong>85 zł</strong> / osobę</td><td data-label="Zakres">8 przekąsek / osobę</td><td data-label="Przeliczenie">ok. 10,63 zł / przekąskę</td></tr>
          </tbody></table></div>
          <p>Przeliczenia nie uwzględniają dostawy, ewentualnych dopłat i różnic w wielkości poszczególnych przekąsek. Przy zamówieniu dla większej grupy potwierdź z firmą, ile porcji potrzebujesz.</p>
        </section>
        <section><h2>Zestaw dla czterech czy pięciu osób — skąd różnica w koszcie?</h2><p>Przy cenie 690 zł dzielenie przez cztery osoby daje 172,50 zł na osobę, a przez pięć — 138 zł. Całkowity koszt i ilość jedzenia pozostają takie same. Dlatego sama etykieta „od 138 zł na osobę” nie powinna decydować o wyborze. Sprawdź gramaturę, liczbę pierogów i uszek oraz to, które dania rzeczywiście zjecie.</p><p>Gdy część potraw przygotowujesz w domu, porównaj koszyk pojedynczych produktów z ceną całego zestawu. Do planu wpisz liczbę gości, potrawy domowe i pozycje do zamówienia. Łatwiej wtedy uniknąć dublowania dań.</p></section>
        <section id="potrawy"><h2>Barszcz i pierogi na zamówienie: porównuj te same jednostki</h2><p>Małe opakowanie może wyglądać taniej niż większe, choć koszt litra lub sztuki będzie wyższy. Przykłady z tegorocznej oferty sklepu Traugutta3:</p>
          <div className="holiday-table-scroll"><table className="holiday-table"><thead><tr><th>Potrawa</th><th>Opakowanie</th><th>Cena opakowania</th><th>Cena jednostkowa</th></tr></thead><tbody>
            <tr><td data-label="Potrawa"><a href="https://butik.hoteltraugutta3.pl/pl/p/Barszcz-czerwony-na-jesiotrze-wedzonym/166" target="_blank" rel="noopener noreferrer">Barszcz czerwony na jesiotrze ↗</a></td><td data-label="Opakowanie">900 ml</td><td data-label="Cena opakowania">49 zł</td><td data-label="Cena jednostkowa">ok. 54,44 zł / litr</td></tr>
            <tr><td data-label="Potrawa"><a href="https://butik.hoteltraugutta3.pl/cateringwigilijny/3" target="_blank" rel="noopener noreferrer">Pierogi z kapustą i grzybami ↗</a></td><td data-label="Opakowanie">10 sztuk</td><td data-label="Cena opakowania">45 zł</td><td data-label="Cena jednostkowa">4,50 zł / szt.</td></tr>
          </tbody></table></div><p>Przy pierogach cena za sztukę nie zastępuje informacji o gramaturze. Przy zupach sprawdź, czy dodatki są w cenie. Barszcz z tego przykładu powstaje na wywarze rybnym — nie jest odpowiednikiem barszczu roślinnego.</p>
        </section>
        <section id="koszty"><h2>Co doliczyć do ceny cateringu?</h2><p>Przed opłaceniem zamówienia poproś o pełną kwotę obejmującą potrawy, opakowania i dowóz pod konkretny adres. Dopytaj o minimalną wartość koszyka, minimalną liczbę porcji oraz ewentualną kaucję za naczynia. Jeśli odbierasz jedzenie samodzielnie, sprawdź miejsce i przedział godzinowy odbioru.</p><p>Ustal też sposób wydawania posiłków: schłodzone, do podgrzania czy gotowe do podania. Instrukcja przechowywania i podgrzewania pomoże zaplanować miejsce w lodówce oraz czas przed kolacją.</p></section>
        <section id="terminy"><h2>Do kiedy zamawiać catering wigilijny w Białymstoku?</h2><p>Traugutta3 przyjmuje zamówienia do <strong>20 grudnia 2026</strong>. Hotel wskazuje odbiór 23 grudnia, 14:00–20:00, oraz dowóz 24 grudnia, 8:00–12:00. <a href="https://www.hoteltraugutta3.pl/szczegoly-aktualnosci?NewsID=101755" target="_blank" rel="noopener noreferrer">Sprawdź terminy ↗</a></p><p>W Dworze Czarneckiego termin i dostawę ustalisz z działem organizacji wydarzeń. W pozostałych restauracjach zapytaj o dostępne terminy przy składaniu zamówienia.</p></section>
        <p><a className="text-link" href="/catering-wigilijny-bialystok">Zobacz restauracje i menu świąteczne →</a></p>
        <section id="pytania"><h2>Catering świąteczny — pytania i odpowiedzi</h2>{faqs.map(({ q, a }) => <details className="holiday-faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
      </article>
      <HolidayLinks current="catering-wigilijny-bialystok" />
    </main><Footer /></>;
}
