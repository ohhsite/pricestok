import HolidayBrand from "../components/HolidayBrand";
import { HolidayPage } from "../components/Holiday";
import { holiday } from "../lib/holiday";

const guide = holiday.gifts;
export const dynamic = "force-dynamic";
export const metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: "/" + guide.slug },
};

export default function Gifts() {
  return (
    <HolidayPage guide={guide}>
      <section className="detail-box">
        <HolidayBrand slug="bali-organic-spa" name="Bali Organic Spa" />
        <h2>Voucher na masaż lub wspólne wyjście</h2>
        <p>Na prezent dla kogoś, kto woli przeżycia, sprawdź voucher na masaż, kolację albo warsztaty. Przed zakupem sprawdź ważność i sposób rezerwacji.</p>
        <a className="text-link" href="https://www.baliorganicspa.pl/vouchery">Sprawdź vouchery Bali Organic Spa ↗</a>
      </section>
      <section className="detail-box">
        <HolidayBrand slug="workshop-art" name="Workshop Art" dark />
        <h2>Voucher na ceramikę lub malarstwo</h2>
        <p>Workshop Art w Białymstoku oferuje voucher od 100 zł, w formie PDF lub papierowej. Można go wykorzystać na warsztaty lub zakup prac w pracowni. Ważność to 6 miesięcy.</p>
        <a className="text-link" href="https://workshopart.pl/produkt/voucher/">Sprawdź kartę podarunkową Workshop Art ↗</a>
      </section>
      <section className="detail-box">
        <h2>Prezent na ostatnią chwilę</h2>
        <p>Przy zakupie vouchera sprawdź, czy firma wysyła go e-mailem. Jeśli wolisz odebrać prezent osobiście, zapytaj o dostępność i godziny odbioru przed wyjściem z domu.</p>
        <a className="text-link" href="/firmy">Przejrzyj lokalne firmy ↗</a>
      </section>
    </HolidayPage>
  );
}
