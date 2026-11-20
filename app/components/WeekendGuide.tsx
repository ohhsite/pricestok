import { Header, Footer } from "./Shell";
import { weekendGroups, weekendPath } from "../lib/weekend";
import { today } from "../lib/data";
import styles from "./WeekendGuide.module.css";
export default function WeekendGuide({ category }: { category?: string }) {
  const selected = category ? weekendGroups.find((group) => group.id === category) : undefined;
  const archived = today() > "2026-11-22";
  return <><Header /><main className={"container inner-main " + styles.guide}>
    <nav className="breadcrumbs"><a href="/">PriceStok</a> / {selected ? <><a href={weekendPath}>Weekend 21–22 listopada</a> / {selected.name}</> : "Weekend w Białymstoku"}</nav>
    <header className={styles.hero}>
      <p className="eyebrow">BIAŁYSTOK I OKOLICE · 21–22 LISTOPADA 2026</p>
      <h1>{selected ? selected.name + " w Białymstoku" : "Co robić w Białymstoku w weekend?"}</h1>
      <p>{selected ? selected.intro : "Koncerty, rodzinne atrakcje, warsztaty i mniej oczywiste wyjścia. Wybierz kategorię i sprawdź terminy, ceny oraz zapisy."}</p>
      <p className={styles.checked}>Sprawdzono 20 listopada 2026. Dostępność miejsc i aktualne ceny potwierdzisz na stronach organizatorów.</p>
      {archived && <p className={styles.notice}>To archiwalny przewodnik. Dotyczy weekendu 21–22 listopada 2026. <a href="/">Zobacz aktualne wydarzenia.</a></p>}
    </header>
    <nav className={styles.tabs} aria-label="Kategorie wydarzeń">{weekendGroups.map((group) => <a key={group.id} href={group.path} aria-current={selected?.id === group.id ? "page" : undefined}>{group.name}</a>)}</nav>
    {selected ? <section className={styles.selected}>
      <figure className={styles.poster}><img src={selected.image} width={1254} height={1254} alt={selected.name + " — grafika PriceStok na weekend 21–22 listopada 2026"} /><figcaption>Grafika poglądowa PriceStok; nie przedstawia konkretnych miejsc ani występujących artystów.</figcaption></figure>
      <div className={styles.events}>{selected.events.map((event) => <article className={styles.event} key={event.title}>
        <h2>{event.title}</h2><p className={styles.when}>{event.when}</p><p>{event.description}</p>
        <dl><div><dt>Miejsce</dt><dd>{event.address}</dd></div><div><dt>Wstęp</dt><dd>{event.price}</dd></div></dl>
        {event.note && <p className={styles.note}>{event.note}</p>}
        <a href={event.source} target="_blank" rel="noopener noreferrer" className="text-link">Szczegóły i źródło informacji</a>
      </article>)}</div>
    </section> : <section className={styles.grid} aria-label="Przewodniki według kategorii">{weekendGroups.map((group) => <article className={styles.card} key={group.id}>
      <a href={group.path}><img src={group.image} width={1254} height={1254} alt={group.name + " — weekend w Białymstoku"} loading="lazy" /></a>
      <div><h2><a href={group.path}>{group.name}</a></h2><p>{group.intro}</p><ul>{group.events.slice(0, 3).map((event) => <li key={event.title}>{event.title}</li>)}</ul><a className="button" href={group.path}>Zobacz wydarzenia ({group.events.length})</a></div>
    </article>)}</section>}
    <aside className={styles.notice}><strong>Sprawdź zapisy przed wyjściem.</strong> Wstęp wolny nie obejmuje zakupów na stoiskach. Warsztaty „Domowe archiwum” i genealogii w Muzeum Pamięci Sybiru mają komplet uczestników. <a href="https://sybir.bialystok.pl/warsztaty-miedzypokoleniowe-domowe-archiwum-jak-chronic-i-uporzadkowac-rodzinne-pamiatki/" target="_blank" rel="noopener noreferrer">Komunikat organizatora</a>.</aside>
    <p><a href={selected ? weekendPath : "/"}>{selected ? "Wszystkie kategorie weekendu" : "Zobacz pozostałe wydarzenia i promocje"}</a></p>
  </main><Footer /></>;
}
