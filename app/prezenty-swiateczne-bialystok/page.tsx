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
      <section className="detail-box seasonal-gift">
        <div className="holiday-brand"><img src="/brands/gastro-strefa.webp" alt="Studio Kulinarne Gastro Strefa — voucher" loading="lazy" /></div>
        <p className="eyebrow">STUDIO KULINARNE · LIPOWA 37</p><h2>Voucher na wspólne gotowanie</h2><strong className="catering-price">250 zł</strong>
        <p>Prezent dla osoby, która lubi poznawać nowe smaki. Voucher Gastro Strefy obniża koszt wybranych warsztatów o 250 zł i jest ważny przez 6 miesięcy. Kod otrzymasz e-mailem po zaksięgowaniu wpłaty.</p>
        <a className="text-link" href="https://studio.gastrostrefa.pl/produkt/voucher-na-warsztaty-kulinarne/" target="_blank" rel="noopener noreferrer">Sprawdź voucher ↗</a>
      </section>
      <section className="detail-box seasonal-gift">
        <div className="holiday-brand"><img src="/brands/gastro-strefa.webp" alt="Studio Kulinarne Gastro Strefa" loading="lazy" /></div>
        <p className="eyebrow">9 GRUDNIA 2026 · GODZ. 17:30</p><h2>Świąteczne wypieki z Panią K</h2><strong className="catering-price">330 zł / osobę</strong>
        <p>Około czterech godzin wspólnego pieczenia w Studiu Kulinarnym Gastro Strefa przy Lipowej 37. Warsztaty prowadzi Katarzyna Korolczuk. Pomysł na grudniowe wyjście lub prezent dla miłośnika wypieków.</p>
        <a className="text-link" href="https://studio.gastrostrefa.pl/produkt/slodki-grudzien-warsztaty-z-pania-k-09-12-2026-godz-1730/" target="_blank" rel="noopener noreferrer">Zobacz program i dostępne miejsca ↗</a>
      </section>
      <section className="detail-box">
        <h2>Prezent na ostatnią chwilę</h2>
        <p>Przy zakupie vouchera sprawdź, czy firma wysyła go e-mailem. Jeśli wolisz odebrać prezent osobiście, zapytaj o dostępność i godziny odbioru przed wyjściem z domu.</p>
        <a className="text-link" href="/firmy">Przejrzyj lokalne firmy ↗</a>
      </section>
    </HolidayPage>
  );
}
