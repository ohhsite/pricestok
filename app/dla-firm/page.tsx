import { Header, Footer } from "../components/Shell";
import Billing from "../components/Billing";
import { billingReady, vatPercent } from "../lib/billing";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pakiety dla firm — promocje Białystok",
  description:
    "Promuj firmę: pakiety promocji od 50 zł netto i wizytówka lokalna za 199 zł netto za rok.",
  referrer: "no-referrer",
};
export default function Business() {
  return (
    <>
      <Header />
      <main className="container inner-main">
        <div className="eyebrow">PRICESTOK · DLA FIRM</div>
        <h1 className="page-title">Daj się odkryć mieszkańcom.</h1>
        <p className="lead">
          Regularna promocja Twojej firmy lub własna podstrona. Wybierz usługę
          dopasowaną do swojego biznesu.
        </p>
        <section className="detail-box" id="reklama">
          <div className="eyebrow">REKLAMA LOKALNA</div>
          <h2>Baner nad kategoriami</h2>
          <p>
            Pokaż swoją ofertę osobom, które szukają okazji w Białymstoku. Podaj
            interesujący Cię termin i link do firmy. Ustalimy dostępność, cenę i
            format reklamy.
          </p>
          <a className="button" href="/dodaj-promocje?typ=reklama">
            Zapytaj o wynajem
          </a>
        </section>
        <section className="detail-box">
          <h2>Pomóż mieszkańcom znaleźć Twoją firmę</h2>
          <p>
            Na wizytówce publikujemy opis usług, adres w Białymstoku i link do Twojej strony. Czytelna treść i dane strukturalne pomagają wyszukiwarkom oraz narzędziom AI zrozumieć, czym zajmuje się firma i gdzie działa.
          </p>
          <a className="text-link" href="/dodaj-promocje?typ=firma">
            Zgłoś firmę do katalogu ↗
          </a>
        </section>
        <Billing
          enabled={billingReady()}
          vat={vatPercent()}
          email={process.env.SELLER_CONTACT_EMAIL || ""}
        />
      </main>
      <Footer />
    </>
  );
}
