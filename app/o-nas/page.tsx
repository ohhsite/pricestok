import { Header, Footer } from "../components/Shell";

export const metadata = {
  title: "Kim jesteśmy | Lokalne promocje w Białymstoku",
  description:
    "Poznaj PriceStok. Zbieramy okazje z Białegostoku i pomagamy lokalnym firmom dotrzeć do mieszkańców.",
  alternates: { canonical: "/o-nas" },
};

export default function About() {
  return (
    <>
      <Header />
      <main className="container inner-main">
        <div className="eyebrow">PRICESTOK · BIAŁYSTOK</div>
        <h1 className="page-title">Z Białegostoku. Dla ludzi i firm z Białegostoku.</h1>
        <p className="lead">
          Jesteśmy stąd. Stworzyliśmy PriceStok, żeby mieszkańcy mogli odkrywać
          ciekawe miejsca w swoim mieście, a lokalne firmy miały gdzie pokazać
          swoją ofertę osobom, które mogą do nich rzeczywiście zajrzeć.
        </p>
        <section className="detail-box">
          <h2>Od pomysłu na wyjście do wizyty w Twojej firmie</h2>
          <p>
            Ktoś szuka miejsca na kolację, zabiegu beauty albo pomysłu na weekend.
            Na PriceStok może przeglądać okazje według kategorii, sprawdzić adres
            i warunki, a potem przejść na stronę firmy lub do rezerwacji.
            Zgłoszenia sprawdzamy przed publikacją, a serduszka pomagają mieszkańcom
            odkrywać oferty polecane przez innych.
          </p>
        </section>
        <section className="detail-box">
          <h2>Wybierz, jak chcesz pokazać swoją firmę</h2>
          <ul>
            <li><strong>Bezpłatne zgłoszenie firmy lub promocji.</strong> Daj nam znać, co robisz i co warto u Ciebie odkryć. Zgłoszenie trafia do redakcji.</li>
            <li><strong>Pakiet wyróżnienia od 50 zł netto.</strong> Pokaż ofertę wyżej w domyślnym widoku katalogu. Promocja ma osobny adres, który możesz udostępnić w swoich kanałach. Korekty treści są w cenie, a w dłuższych pakietach można wymienić ofertę.</li>
            <li><strong>Wizytówka firmy za 199 zł netto na rok.</strong> Zyskujesz osobną stronę z opisem usług, adresem i linkiem do własnej witryny. Dane strukturalne i metadane pomagają wyszukiwarkom oraz narzędziom AI odczytać informacje o Twojej firmie.</li>
            <li><strong>Baner nad kategoriami.</strong> Wyeksponuj otwarcie, sezonową akcję lub wydarzenie w miejscu widocznym podczas przeglądania okazji.</li>
          </ul>
          <p>
            Cennik pokazujemy przed zakupem. Pakiety są opłacane jednorazowo,
            a płatne publikacje oznaczamy jako sponsorowane.
          </p>
          <div className="admin-tools">
            <a className="button" href="/dla-firm#zakup">Zobacz pakiety i ceny</a>
            <a className="button outline" href="/dodaj-promocje?typ=firma">Zgłoś firmę bezpłatnie</a>
            <a className="button outline" href="/dla-firm#reklama">Zapytaj o baner</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
