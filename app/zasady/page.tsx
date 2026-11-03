import { Header, Footer } from "../components/Shell";
export const metadata = { title: "Jak sprawdzamy oferty i zasady zgłoszeń" };
export default function Rules() {
  return (
    <>
      <Header />
      <main className="container inner-main prose">
        <div className="eyebrow">PRZEJRZYŚCIE I PO SĄSIEDZKU</div>
        <h1 className="page-title">Jak działają nasze promocje?</h1>
        <h2>Źródła i aktualność</h2>
        <p>
          Promocje opracowujemy na podstawie publicznych stron firm, galerii
          handlowych i organizatorów programów rabatowych. Każda oferta ma link
          do źródła i datę sprawdzenia strony. Nie oznacza to telefonicznego
          potwierdzenia dostępności ani współpracy z firmą.
        </p>
        <h2>Warunki mają znaczenie</h2>
        <p>
          Zniżka może wymagać minimalnej wartości zakupu, kodu, karty programu,
          pierwszej wizyty lub wizyty w konkretnym dniu. Zapoznaj się z
          warunkami u organizatora przed rezerwacją lub zapłatą. Oferty z datą
          końcową automatycznie znikają z katalogu po jej upływie. Brak daty
          końcowej nie gwarantuje stałej dostępności.
        </p>
        <h2>Zdjęcia</h2>
        <p>
          Zdjęcia ilustracyjne nie przedstawiają produktów, usług ani wnętrz
          konkretnej firmy. Zdjęcia poglądowe: Unsplash. Nie sugerują współpracy
          reklamowej.
        </p>
        <h2>Zgłoszenia</h2>
        <p>
          Formularz służy zgłaszaniu publicznych promocji i korekt. Zgłoszenia
          przechowujemy do czasu ich rozpatrzenia lub usunięcia przez redakcję.
          Nie podawaj prywatnych danych ani informacji o klientach. Zgłoszenie
          nie jest zamówieniem płatnej reklamy. Płatne pakiety zamawia się
          osobno przez formularz zakupu i Stripe. Szczegóły opisano w warunkach
          płatnej publikacji.
        </p>
        <h2>Statystyki i zapisane oferty</h2>
        <p>
          Zliczamy otwarcia podstron promocji i przejścia do źródeł w postaci
          zbiorczych liczników. Nie zapisujemy w tych licznikach adresów IP ani
          identyfikatorów odwiedzających. Zapisane serduszkiem oferty są
          przechowywane tylko w pamięci tej przeglądarki. Możesz usunąć je,
          klikając serce ponownie lub czyszcząc dane witryny.
        </p>
        <h2>Płatności i dane zamówień</h2>
        <p>
          Płatności obsługuje Stripe. W bazie serwisu przechowywane są treść
          zgłoszenia, pakiet, kwota, status oraz identyfikatory płatności. Dane
          karty nie trafiają do serwisu. Szczegółową politykę prywatności i
          okresy przechowywania dokumentacji uzupełnia usługodawca przed
          rozpoczęciem sprzedaży.
        </p>
        <h2>Zauważona pomyłka?</h2>
        <p>
          Skorzystaj z linku „Zgłoś zmianę” na stronie oferty. Link otwiera
          formularz ze wskazaniem zgłaszanej promocji.
        </p>
      </main>
      <Footer />
    </>
  );
}
