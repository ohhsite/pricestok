import { Header, Footer } from "../components/Shell";
export const metadata = { title: "Warunki płatnej publikacji" };
export default function Terms() {
  const seller = process.env.SELLER_NAME;
  return (
    <>
      <Header />
      <main className="container inner-main prose">
        <h1 className="page-title">Warunki płatnej publikacji</h1>
        {!seller && (
          <div className="message">
            Przed uruchomieniem sprzedaży właściciel serwisu musi uzupełnić dane
            sprzedawcy i zatwierdzić warunki usługi.
          </div>
        )}
        <h2>Usługodawca</h2>
        <p>
          {seller || "Dane wymagają uzupełnienia"}
          <br />
          {process.env.SELLER_ADDRESS}
          <br />
          {process.env.SELLER_TAX_ID ? "NIP: " + process.env.SELLER_TAX_ID : ""}
          <br />
          Kontakt: {process.env.SELLER_CONTACT_EMAIL || "do uzupełnienia"}
        </p>
        <h2>Przedmiot zamówienia</h2>
        <p>
          Pakiety dla firm kosztują 50 zł netto za 30 dni, 139 zł netto za 3 miesiące, 249 zł netto za 6 miesięcy lub 449 zł netto za 12 miesięcy. Wizytówka firmy kosztuje 199 zł netto za 12 miesięcy. Kwotę do zapłaty pokazujemy przed zakupem. Nowe zamówienia są opłacane jednorazowo.
        </p>
        <h2>Weryfikacja i okres publikacji</h2>
        <p>
          Okres zaczyna się w dniu akceptacji redakcji. Pakiet obejmuje jedną wyróżnioną promocję. Korekty treści są w cenie. W pakietach od 3 miesięcy redakcja może wymienić promocję raz na 30 dni od rozpoczęcia pakietu lub ostatniej wymiany. Wymiana zachowuje termin końca pakietu. Promocja może wygasnąć wcześniej, zgodnie z jej warunkami.
        </p>
        <p>
          Wizytówka obejmuje osobną stronę firmy, opis usług, adres, link i aktualizacje danych przez redakcję. Płatne publikacje oznaczamy jako sponsorowane. Widoczność w wyszukiwarkach i odpowiedziach AI zależy od ich algorytmów.
        </p>
        <h2>Odrzucenie i zwroty</h2>
        <p>
          Nie publikujemy ofert niezgodnych z opisem serwisu, niejasnych,
          nieaktualnych lub bez konkretnej korzyści dla użytkownika. Przy
          odrzuceniu opłaconej oferty zlecamy zwrot ostatniej wpłaty przez
          Stripe i kończymy abonament. Jeśli pobrano kilka wpłat przed decyzją,
          pozostałe zwroty redakcja rozlicza w Stripe. Termin zaksięgowania
          zwrotu zależy od metody płatności i banku.
        </p>
        <h2>Reklamacje i kontakt</h2>
        <p>
          Odnowienie wcześniej zakupionego abonamentu można anulować w panelu Stripe z linku do
          zarządzania zakupem. Publikacja trwa do końca opłaconego okresu.
          Anulowanie nie zwraca automatycznie opłaty za rozpoczęty okres. Przy
          nieudanej płatności, sporze lub pełnym zwrocie publikacja zostaje
          wstrzymana. Faktury i zmiana metody płatności są dostępne w panelu
          Stripe. Dokumenty wymagają poprawnych danych sprzedawcy i konfiguracji
          podatkowej; rozliczenia księgowe oraz ewentualną obsługę KSeF zapewnia
          usługodawca.
        </p>
        <p>
          Uwagi do publikacji, prośby o korektę oraz reklamacje kieruj na podany
          wyżej adres kontaktowy, wskazując nazwę firmy i numer zamówienia.
          Przed rozpoczęciem sprzedaży usługodawca powinien uzupełnić procedurę
          reklamacji, zasady rezygnacji oraz politykę prywatności odpowiednie do
          swojej działalności.
        </p>
      </main>
      <Footer />
    </>
  );
}
