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
        <h1 className="page-title">Kim jesteśmy?</h1>
        <p className="lead">
          PriceStok powstał, żeby mieszkańcy Białegostoku mogli łatwiej odkrywać
          lokalne miejsca, a małe firmy mogły dotrzeć do osób z okolicy.
        </p>
        <section className="detail-box">
          <h2>Okazje z miasta, z jasnymi warunkami</h2>
          <p>
            Zbieramy promocje, podajemy ich źródła i sprawdzamy zgłoszenia przed
            publikacją. Jeśli zauważysz nieaktualną ofertę, możesz dać nam znać.
          </p>
          <p>
            Serduszka pomagają innym znaleźć ciekawe okazje. W domyślnym widoku
            wyżej pokazujemy oferty wyróżnione przez redakcję, a następnie te z
            większą liczbą serduszek.
          </p>
        </section>
        <section className="detail-box">
          <h2>Widoczność dla lokalnych firm</h2>
          <p>
            Wizytówka z nazwą, kategorią, adresem i linkiem do strony ułatwia
            mieszkańcom znalezienie firmy. Osobna podstrona daje też
            wyszukiwarce dodatkową stronę z informacjami o firmie, którą może
            zindeksować. Pozycja w Google zależy od wielu czynników.
          </p>
          <div className="admin-tools">
            <a className="button" href="/dodaj-promocje?typ=firma">
              Zgłoś firmę
            </a>
            <a className="button outline" href="/dla-firm#reklama">
              Zapytaj o reklamę
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
