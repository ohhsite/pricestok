import { ArrowUpRight, ChefHat } from "lucide-react";
import { HolidayPage } from "../components/Holiday";
import { holiday } from "../lib/holiday";
import "./gifts.css";

const guide = holiday.gifts;
export const dynamic = "force-dynamic";
export const metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: "/" + guide.slug },
};

const gifts = [
  {
    label: "Bali Organic Spa · Pogodna 4C",
    title: "Voucher na masaż balijski",
    description: "Wybierz papierową kartę podarunkową lub voucher wirtualny, który salon wysyła SMS-em lub e-mailem.",
    image: "bali-organic-spa-voucher.webp",
    href: "https://www.baliorganicspa.pl/vouchery",
    action: "Sprawdź vouchery",
  },
  {
    label: "Workshop Art",
    title: "Voucher na ceramikę lub malarstwo",
    price: "Od 100 zł",
    description: "Voucher w formie PDF lub papierowej. Przez 6 miesięcy można go wykorzystać na warsztaty lub zakup prac w pracowni.",
    image: "workshop-art.webp",
    imageStyle: "logo",
    href: "https://workshopart.pl/produkt/voucher/",
    action: "Sprawdź kartę podarunkową",
  },
  {
    label: "Gastro Strefa · Lipowa 37",
    title: "Voucher na wspólne gotowanie",
    price: "250 zł",
    description: "Do wykorzystania na wybrane warsztaty w ciągu 6 miesięcy. Kod otrzymasz e-mailem po zaksięgowaniu wpłaty.",
    image: "gastro-strefa.webp",
    imageStyle: "voucher",
    href: "https://studio.gastrostrefa.pl/produkt/voucher-na-warsztaty-kulinarne/",
    action: "Sprawdź voucher",
  },
  {
    label: "9 grudnia 2026 · godz. 17:30",
    title: "Świąteczne wypieki z Panią K",
    price: "330 zł / osobę",
    description: "Około czterech godzin wspólnego pieczenia z Katarzyną Korolczuk w Studiu Kulinarnym Gastro Strefa przy Lipowej 37.",
    imageStyle: "workshop",
    href: "https://studio.gastrostrefa.pl/produkt/slodki-grudzien-warsztaty-z-pania-k-09-12-2026-godz-1730/",
    action: "Zobacz program i dostępność",
  },
];

export default function Gifts() {
  return (
    <HolidayPage guide={guide}>
      <div className="gift-guide-grid">
        {gifts.map((gift) => (
          <article className="gift-guide-card" key={gift.title}>
            <div className={["gift-guide-media", gift.imageStyle].filter(Boolean).join(" ")}>
              {gift.image ? (
                <img src={"/brands/" + gift.image} alt="" loading="lazy" />
              ) : (
                <ChefHat size={64} strokeWidth={1.35} aria-hidden="true" />
              )}
            </div>
            <div className="gift-guide-content">
              <p className="gift-guide-label">{gift.label}</p>
              <h2>{gift.title}</h2>
              {gift.price && <strong className="gift-guide-price">{gift.price}</strong>}
              <p className="gift-guide-description">{gift.description}</p>
              <a className="gift-guide-action" href={gift.href}>
                {gift.action} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
      <section className="detail-box">
        <h2>Prezent na ostatnią chwilę</h2>
        <p>Przy zakupie vouchera sprawdź, czy firma wysyła go e-mailem. Jeśli wolisz odebrać prezent osobiście, zapytaj o dostępność i godziny odbioru przed wyjściem z domu.</p>
        <a className="text-link" href="/firmy">Przejrzyj lokalne firmy ↗</a>
      </section>
    </HolidayPage>
  );
}
