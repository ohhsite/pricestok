import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  MapPin,
  Megaphone,
  MousePointerClick,
  Send,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Header, Footer } from "../components/Shell";
import { packages } from "../lib/packages";
import BusinessInquiry from "./BusinessInquiry";
import styles from "./business.module.css";

export const metadata: Metadata = {
  title: "Reklama firmy w Białymstoku — promocje, wizytówki i kampanie",
  description:
    "Promuj lokalny biznes z PriceStok. Zgłoś promocję bezpłatnie, wybierz wyróżnienie lub zapytaj o kampanię Meta Ads dla firmy w Białymstoku.",
  alternates: { canonical: "/dla-firm" },
};

const mail = "mailto:kontakt@pricestok.pl";
const inquiryMail = (subject: string) =>
  mail + "?subject=" + encodeURIComponent("PriceStok — " + subject);

const steps = [
  {
    no: "01",
    title: "Pokaż, co oferujesz",
    description:
      "Zgłoś konkretną promocję lub opowiedz nam, jaki cel ma Twoja firma. Nie potrzebujesz gotowego materiału reklamowego.",
  },
  {
    no: "02",
    title: "Dobierz sposób promocji",
    description:
      "Możesz zacząć od bezpłatnego zgłoszenia, zamówić wyróżnienie lub poprosić o przygotowanie kampanii reklamowej.",
  },
  {
    no: "03",
    title: "Kieruj klientów do siebie",
    description:
      "Publikacja prowadzi do Twojej strony lub oferty. W kampanii płatnej ustalamy również sposób mierzenia kliknięć i zapytań.",
  },
];

const audiences = [
  { icon: UtensilsCrossed, title: "Gastronomia", description: "Lunch, menu, nowe lokale i oferty specjalne." },
  { icon: Store, title: "Sklepy i usługi", description: "Promocje, premiery i akcje sezonowe." },
  { icon: CalendarDays, title: "Wydarzenia", description: "Warsztaty, atrakcje i wydarzenia lokalne." },
  { icon: Building2, title: "Większe kampanie", description: "Nieruchomości, motoryzacja i usługi o wyższej wartości." },
];

export default function Business() {
  return (
    <>
      <Header />
      <main className={`container inner-main ${styles.page}`}>
        <section className={styles.hero} aria-labelledby="business-title">
          <div className={styles.heroCopy}>
            <span className={styles.kicker}><span className={styles.kickerDot} /> PRICESTOK DLA FIRM · BIAŁYSTOK</span>
            <h1 id="business-title">Lokalni klienci szukają okazji. <span>Pokaż im swoją firmę.</span></h1>
            <p>
              Promocje, wizytówki firm i reklamy skierowane do mieszkańców Białegostoku.
              Zacznij od bezpłatnego zgłoszenia albo zapytaj o kampanię przygotowaną dla Twojego biznesu.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primary} href="/dodaj-promocje">
                Dodaj promocję bezpłatnie <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a className={styles.secondary} href="#zapytanie">
                Zapytaj o reklamę <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.heroNote}>
              <Check size={16} aria-hidden="true" />
              Samo zgłoszenie jest bezpłatne i nie zobowiązuje do zakupu.
            </div>
          </div>
          <aside className={styles.heroAside} aria-label="Sposoby promocji na PriceStok">
            <div className={styles.visualTop}>
              <div className={styles.visualIcon}><MapPin size={24} aria-hidden="true" /></div>
              <span>LOKALNIE MA ZNACZENIE</span>
              <strong>Twoja oferta.<br />Twoje miasto.</strong>
              <p>Jedno miejsce na promocję, odkrywanie i reklamę lokalnego biznesu.</p>
            </div>
            <div className={styles.visualRows}>
              <div><span className={styles.dot} /><span>Dodaj aktualną promocję</span><BadgeCheck size={18} aria-hidden="true" /></div>
              <div><span className={styles.dot} /><span>Wyróżnij ofertę w serwisie</span><ChevronRight size={18} aria-hidden="true" /></div>
              <div><span className={styles.dot} /><span>Uruchom reklamę lokalną</span><ChevronRight size={18} aria-hidden="true" /></div>
            </div>
            <div className={styles.visualFoot}>Dla restauracji, sklepów, usług i organizatorów wydarzeń</div>
          </aside>
        </section>

        <section className={styles.introStrip} aria-label="Najważniejsze informacje">
          <div><MapPin size={20} aria-hidden="true" /><span><strong>Białystok i okolice</strong><small>Oferta dla lokalnych przedsiębiorców</small></span></div>
          <div><MousePointerClick size={20} aria-hidden="true" /><span><strong>Prosty kontakt</strong><small>Bez skomplikowanych formularzy</small></span></div>
          <div><Megaphone size={20} aria-hidden="true" /><span><strong>Od publikacji do kampanii</strong><small>Wybierz zakres pasujący do celu</small></span></div>
        </section>

        <section className={styles.section} id="mozliwosci" aria-labelledby="possibilities-title">
          <div className={styles.sectionHead}>
            <div><p className={styles.label}>DLA TWOJEJ FIRMY</p><h2 id="possibilities-title">Ty prowadzisz biznes. My pomagamy go pokazać.</h2></div>
            <p>Bez względu na to, czy masz jedną promocję na weekend, czy potrzebujesz stałej reklamy — wybierz odpowiednią formę współpracy.</p>
          </div>
          <div className={styles.options}>
            <article className={styles.option}>
              <div className={styles.iconBox}><Store size={23} aria-hidden="true" /></div>
              <p className={styles.optionIndex}>01 / BEZPŁATNE ZGŁOSZENIE</p>
              <h3>Dodaj promocję</h3>
              <p>Prześlij aktualną ofertę z warunkami i linkiem. Redakcja ją sprawdzi i zdecyduje o publikacji.</p>
              <a href="/dodaj-promocje">Zgłoś ofertę <ArrowUpRight size={16} aria-hidden="true" /></a>
            </article>
            <article className={styles.option}>
              <div className={styles.iconBox}><BadgeCheck size={23} aria-hidden="true" /></div>
              <p className={styles.optionIndex}>02 / OBECNOŚĆ W SERWISIE</p>
              <h3>Wyróżnij swoją firmę</h3>
              <p>Wybierz wyróżnioną promocję lub wizytówkę z informacjami, adresem i kontaktem.</p>
              <a href="#cennik">Zobacz pakiety <ArrowUpRight size={16} aria-hidden="true" /></a>
            </article>
            <article className={styles.option}>
              <div className={styles.iconBox}><BarChart3 size={23} aria-hidden="true" /></div>
              <p className={styles.optionIndex}>03 / REKLAMA NA ZAMÓWIENIE</p>
              <h3>Uruchom kampanię lokalną</h3>
              <p>Przygotujemy propozycję reklamy Meta Ads z kierowaniem do mieszkańców, kreacjami i ustalonym pomiarem wyników.</p>
              <a href="#zapytanie">Zapytaj o kampanię <ArrowUpRight size={16} aria-hidden="true" /></a>
            </article>
          </div>
        </section>

        <section className={styles.accentBand} aria-labelledby="accent-title">
          <div>
            <p className={styles.label}>BEZ DUŻEGO BUDŻETU NA START</p>
            <h2 id="accent-title">Masz dobrą ofertę? <span>Nie chowaj jej przed miastem.</span></h2>
          </div>
          <a className={styles.lightButton} href="/dodaj-promocje">Zgłoś ją za darmo <ArrowUpRight size={17} aria-hidden="true" /></a>
        </section>

        <section className={styles.section} id="cennik" aria-labelledby="pricing-title">
          <div className={styles.sectionHead}>
            <div><p className={styles.label}>CENNIK</p><h2 id="pricing-title">Zacznij od tego, czego potrzebujesz.</h2></div>
            <p>Przejrzyste opcje dla małych firm. Przy większych działaniach przygotujemy indywidualną propozycję.</p>
          </div>
          <div className={styles.prices}>
            <article className={styles.priceCard}>
              <div className={styles.priceCaption}>NA POCZĄTEK</div>
              <h3>Zgłoszenie promocji</h3>
              <div className={styles.price}>0 zł</div>
              <p className={styles.priceDescription}>Przekaż nam promocję do weryfikacji redakcyjnej.</p>
              <ul><li><Check size={16} /> Formularz zgłoszeniowy</li><li><Check size={16} /> Weryfikacja warunków</li><li><Check size={16} /> Bez obowiązku zakupu reklamy</li></ul>
              <p className={styles.priceDisclaimer}>Zgłoszenie nie gwarantuje publikacji.</p>
              <a className={styles.priceLink} href="/dodaj-promocje">Dodaj ofertę <ArrowRight size={17} /></a>
            </article>
            <article className={`${styles.priceCard} ${styles.featured}`}>
              <div className={styles.priceCaption}>POPULARNY START</div>
              <h3>Wyróżniona promocja</h3>
              <div className={styles.price}>{packages.oneoff.net / 100} zł <small>netto / {packages.oneoff.period}</small></div>
              <p className={styles.priceDescription}>Promuj wybraną ofertę w lokalnym serwisie.</p>
              <ul><li><Check size={16} /> Dedykowana publikacja oferty</li><li><Check size={16} /> Wyróżnienie w katalogu</li><li><Check size={16} /> Link do Twojej strony</li></ul>
              <p className={styles.priceDisclaimer}>Dłużej: {packages.quarter.net / 100} zł / 3 mies., {packages.halfyear.net / 100} zł / 6 mies. lub {packages.year.net / 100} zł / rok (netto).</p>
              <a className={styles.priceLink} href={inquiryMail("Wyróżniona promocja")}>Zamów wyróżnienie <ArrowRight size={17} /></a>
            </article>
            <article className={styles.priceCard}>
              <div className={styles.priceCaption}>TWOJE MIEJSCE W INTERNECIE</div>
              <h3>Wizytówka firmy</h3>
              <div className={styles.price}>{packages.company.net / 100} zł <small>netto / 12 miesięcy</small></div>
              <p className={styles.priceDescription}>Własna podstrona z ważnymi informacjami o firmie.</p>
              <ul><li><Check size={16} /> Opis działalności i lokalizacja</li><li><Check size={16} /> Dane kontaktowe i link</li><li><Check size={16} /> Czytelna struktura pod SEO</li></ul>
              <p className={styles.priceDisclaimer}>Nie gwarantuje pozycji w Google ani określonej liczby wejść.</p>
              <a className={styles.priceLink} href={inquiryMail("Wizytówka firmy")}>Zapytaj o wizytówkę <ArrowRight size={17} /></a>
            </article>
          </div>
          <p className={styles.pricesFoot}>Ceny netto. Zakres i kwotę płatnych publikacji potwierdzamy przed zamówieniem. Płatności za publikacje odbywają się przelewem.</p>
        </section>

        <section className={styles.campaign} id="reklama" aria-labelledby="campaign-title">
          <div>
            <p className={styles.label}>WIĘKSZY ZASIĘG DLA TWOJEJ OFERTY</p>
            <h2 id="campaign-title">Potrzebujesz reklamy, a nie tylko wpisu?</h2>
            <p>Możemy zaproponować przygotowanie kreacji i kampanii na Facebooku oraz Instagramie kierowanej do lokalnych odbiorców. Działania dobieramy do celu: ruch na stronie, zapytania lub zainteresowanie konkretną ofertą.</p>
            <a className={styles.primary} href="#zapytanie">Poproś o propozycję <ArrowUpRight size={17} /></a>
          </div>
          <div className={styles.campaignChecklist}>
            <p><Check size={18} /> Ustalenie celu i grupy odbiorców</p>
            <p><Check size={18} /> Kreacje i konfiguracja kampanii</p>
            <p><Check size={18} /> Ustalenie sposobu pomiaru efektów</p>
            <p><Check size={18} /> Budżet Meta Ads rozliczany osobno</p>
            <small>Zakres, wynagrodzenie i budżet reklamowy ustalamy indywidualnie. Nie obiecujemy konkretnej liczby klientów.</small>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sectors-title">
          <div className={styles.sectionHead}>
            <div><p className={styles.label}>BRANŻE</p><h2 id="sectors-title">Lokalna reklama dla różnych biznesów.</h2></div>
            <p>Możemy dopasować format publikacji do oferty, terminu promocji i sposobu, w jaki klient podejmuje decyzję.</p>
          </div>
          <div className={styles.sectors}>{audiences.map((a) => <article key={a.title}><a.icon size={25} aria-hidden="true" /><h3>{a.title}</h3><p>{a.description}</p></article>)}</div>
        </section>

        <section className={styles.section} aria-labelledby="how-title">
          <div className={styles.sectionHead}><div><p className={styles.label}>WSPÓŁPRACA</p><h2 id="how-title">Trzy proste kroki.</h2></div></div>
          <div className={styles.steps}>{steps.map((s) => <article key={s.no}><span>{s.no}</span><h3>{s.title}</h3><p>{s.description}</p></article>)}</div>
        </section>

        <section className={styles.contactSection} id="zapytanie" aria-labelledby="inquiry-title">
          <div className={styles.contactText}>
            <p className={styles.label}>POROZMAWIAJMY O REKLAMIE</p>
            <h2 id="inquiry-title">Powiedz nam, co chcesz promować.</h2>
            <p>Opisz firmę i cel. Odpowiemy z propozycją formy współpracy — bez zobowiązania do zakupu.</p>
            <div className={styles.contactNote}><Send size={20} aria-hidden="true" /><div><strong>Wolisz napisać bezpośrednio?</strong><a href={mail}>kontakt@pricestok.pl</a></div></div>
          </div>
          <BusinessInquiry />
        </section>

        <section className={styles.faqSection} aria-labelledby="faq-title">
          <div className={styles.faqHeading}><CircleHelp size={23} aria-hidden="true" /><h2 id="faq-title">Najczęstsze pytania</h2></div>
          <div className={styles.faqs}>
            <details><summary>Czy mogę zgłosić promocję bez opłat?</summary><p>Tak. Przesłanie oferty do redakcji jest bezpłatne. Sprawdzamy informacje i decydujemy o publikacji. Wyróżnienie lub kampania reklamowa są płatne.</p></details>
            <details><summary>Czy reklama Meta Ads jest w cenie pakietu 50 zł?</summary><p>Nie. Pakiet 50 zł netto dotyczy wyróżnienia promocji w serwisie PriceStok przez 30 dni. Kampanie Facebook i Instagram wyceniamy osobno; budżet reklamowy Meta jest dodatkowy.</p></details>
            <details><summary>Czy muszę mieć własną stronę internetową?</summary><p>Do zgłoszenia promocji potrzebny jest publiczny link do oferty lub strony firmy. Przy zapytaniu o indywidualną reklamę strona internetowa jest opcjonalna.</p></details>
            <details><summary>Czy gwarantujecie klientów albo wysoką pozycję w Google?</summary><p>Nie. Publikacja i reklama mogą zwiększyć widoczność, ale ich wynik zależy od oferty, konkurencji, budżetu i wielu innych czynników.</p></details>
          </div>
        </section>
        <div className={styles.bottomCta}><div><strong>Masz promocję gotową do pokazania?</strong><span>Dodaj ją dziś do weryfikacji redakcyjnej.</span></div><a className={styles.primary} href="/dodaj-promocje">Dodaj promocję <ArrowRight size={17} /></a></div>
      </main>
      <Footer />
    </>
  );
}
