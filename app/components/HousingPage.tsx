import type { Metadata } from "next";
import { Header, Footer } from "./Shell";
import HousingCatalog from "./HousingCatalog";
import { housingFaq, housingOffers, housingPages, housingPending, housingRoot, inBudget, type Budget } from "../lib/housing";
import { siteUrl } from "../lib/config";
import styles from "./Housing.module.css";

export function housingMetadata(budget: Budget): Metadata {
  const page = housingPages.find(p => p.id === budget)!;
  return { title: page.title + " — ceny i dodatki", description: page.intro, alternates: { canonical: page.path }, robots: { index: true, follow: true }, openGraph: { title: page.title, description: page.intro, url: page.path, type: "website", locale: "pl_PL" } };
}
function pendingForBudget(budget: Budget) {
  return housingPending.filter(o => budget === "all" || (budget !== "600-plus" && o.price <= Number(budget) * 1000));
}
export default function HousingPage({ budget }: { budget: Budget }) {
  const page = housingPages.find(p => p.id === budget)!;
  const offers = housingOffers.filter(o => inBudget(o, budget));
  const pending = pendingForBudget(budget);
  const listed = [...offers, ...pending];
  const base = siteUrl();
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": base + page.path, url: base + page.path, name: page.title, description: page.intro, inLanguage: "pl-PL", dateModified: "2026-11-22", mainEntity: { "@type": "ItemList", numberOfItems: listed.length, itemListElement: listed.map((o, i) => ({ "@type": "ListItem", position: i + 1, name: `${o.investment} · ${o.area} m²${o.basis === "incomplete" ? " · dopłaty do potwierdzenia" : ""}`, url: base + page.path + "#" + o.id })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "PriceStok", item: base }, { "@type": "ListItem", position: 2, name: "Mieszkania w Białymstoku", item: base + housingRoot }, ...(budget === "all" ? [] : [{ "@type": "ListItem", position: 3, name: page.label, item: base + page.path }])] },
    { "@type": "FAQPage", mainEntity: housingFaq.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
  ] };
  return <><Header /><main className={"container " + styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav className={styles.breadcrumbs} aria-label="Ścieżka nawigacji"><a href="/">PriceStok</a><span>/</span>{budget === "all" ? <span>Mieszkania</span> : <><a href={housingRoot}>Mieszkania</a><span>/</span><span>{page.label}</span></>}</nav>
    <header className={styles.hero}><div><p className={styles.kicker}>TWÓJ ADRES. TWÓJ BUDŻET.</p><h1>{page.title}</h1><p className={styles.lead}>{page.intro}</p><a className="button" href="#oferty">Porównaj oferty</a><p className={styles.checked}>Przegląd ofert z 22 listopada 2026 · rynek pierwotny</p></div><aside className={styles.heroAside}><span>Spójrz na całą cenę</span><p>Mieszkanie<br /><b>+ parking<br />+ komórka</b></p><span>Zakres wariantu zawsze przy ofercie.</span></aside></header>
    <nav className={styles.budgets} aria-label="Mieszkania według budżetu">{housingPages.map(p => <a key={p.id} href={p.path} aria-current={p.id === budget ? "page" : undefined}><span>{p.label}</span><small>{housingOffers.filter(o => inBudget(o, p.id)).length + pendingForBudget(p.id).length} ofert</small>{!!pendingForBudget(p.id).length && <small>{pendingForBudget(p.id).length} — dopłaty do sprawdzenia</small>}</a>)}</nav>
    <div className={styles.explainer}><strong>Jak liczymy budżet?</strong><p>Pokazujemy oferty z policzoną ceną porównawczą oraz osobno lokale, których dopłaty wymagają sprawdzenia. W tej drugiej grupie w budżecie mieści się cena samego mieszkania, a parking lub komórka mogą podnieść koszt ponad limit. Nie jest to pełny koszt zamieszkania: wykończenie, notariusz i finansowanie pozostają poza zestawieniem.</p></div>
    <HousingCatalog offers={offers} pending={pending} />
    <section className={styles.editorial}><h2>{budget === "all" ? "Jak porównywać mieszkania w Białymstoku?" : `Co sprawdzić, szukając mieszkania ${budget === "600-plus" ? "powyżej 600 tys. zł" : `do ${budget} tys. zł`}?`}</h2><p>{page.advice}</p><p>Przegląd obejmuje wybrane lokale, nie cały rynek. Kwoty to opublikowane ceny ofertowe, a nie ceny transakcyjne. Nie potwierdzaliśmy ich telefonicznie. Przed rezerwacją otwórz źródło oferty i ustal dostępność oraz obowiązkowy zakres zakupu.</p><h2>Pytania przed zakupem</h2>{housingFaq.map(f => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
    <aside className={styles.business}><div><p className={styles.kicker}>DLA DEWELOPERÓW I SPRZEDAWCÓW</p><h2>Masz ofertę z jasną ceną?</h2><p>Zgłoś mieszkanie, podaj cenę lokalu i wszystkich obowiązkowych dodatków. Pomóż kupującym porównać pełny wariant zakupu.</p></div><a className="button" href="/dla-firm">Sprawdź współpracę</a></aside>
  </main><Footer /></>;
}
