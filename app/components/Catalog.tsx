"use client";
import { useState, useEffect } from "react";
import OfferVisual from "./OfferVisual";
import "./home-discovery.css";
import {
  Search,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  Heart,
  Plus,
  SlidersHorizontal,
  Utensils,
  Sparkles,
  Dumbbell,
  Ticket,
  ShoppingBag,
  Wrench,
  Baby,
  Grid2X2,
  Check,
  Clock,
  X,
  Bookmark,
  CalendarDays,
  TreePine,
} from "lucide-react";
import {
  Offer,
  categories as defaultCategories,
  isActive,
  today,
  weekday,
  dateLabel,
} from "../lib/data";
import { Header, Footer } from "./Shell";
const icons: any = {
  Utensils,
  Sparkles,
  Dumbbell,
  Ticket,
  ShoppingBag,
  Wrench,
  Baby,
};
function countLabel(n: number) {
  return n === 1
    ? "oferta"
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
      ? "oferty"
      : "ofert";
}
import type { Category } from "../lib/categories";

const treeCampaignUrl =
  "https://choinki.bialystok.pl/?utm_source=pricestok&utm_medium=referral&utm_campaign=choinki_2026&utm_content=homepage_strip";

function eventOrder(a: Offer, b: Offer, date: string) {
  const aDate = a.start && a.start < date && a.end >= date ? date : a.start || a.end || "9999";
  const bDate = b.start && b.start < date && b.end >= date ? date : b.start || b.end || "9999";
  return aDate.localeCompare(bDate) || a.title.localeCompare(b.title, "pl");
}

function eventDateLabel(offer: Offer, date: string) {
  if (!offer.start) return offer.end ? "Do " + dateLabel(offer.end) : "Termin u organizatora";
  if (offer.end && offer.end !== offer.start) return dateLabel(offer.start) + " – " + dateLabel(offer.end);
  return offer.start === date ? "Dziś, " + dateLabel(date) : dateLabel(offer.start);
}

function homepageDeals(offers: Offer[], date: string) {
  const dayNumber = Date.parse(date + "T00:00:00Z") / 86400000;
  const sortGroups = new Map<number, Offer[]>();
  const currentWeekday = weekday(date);
  for (const offer of offers) {
    const age = dayNumber - Date.parse(offer.verified + "T00:00:00Z") / 86400000;
    const freshness = age <= 1 ? 0 : age <= 7 ? 1 : 2;
    const rank = (offer.days.includes(currentWeekday) ? 0 : 3) + freshness;
    if (!sortGroups.has(rank)) sortGroups.set(rank, []);
    sortGroups.get(rank)!.push(offer);
  }
  const ordered = [...sortGroups].sort(([a], [b]) => a - b).flatMap(([, group]) => {
    const categories = new Map<string, Offer[]>();
    group.sort((a, b) => a.id.localeCompare(b.id));
    for (const offer of group) {
      if (!categories.has(offer.category)) categories.set(offer.category, []);
      categories.get(offer.category)!.push(offer);
    }
    const rotate = (items: Offer[][]) => {
      const offset = dayNumber % items.length;
      return [...items.slice(offset), ...items.slice(0, offset)];
    };
    const queues = rotate([...categories.values()]).map((queue) => {
      const offset = dayNumber % queue.length;
      return [...queue.slice(offset), ...queue.slice(0, offset)];
    });
    return Array.from({ length: Math.max(...queues.map((queue) => queue.length)) },
      (_, index) => queues.flatMap((queue) => queue[index] ? [queue[index]] : []),
    ).flat();
  });
  const seen = new Set<string>();
  const first: Offer[] = [];
  const rest: Offer[] = [];
  for (const offer of ordered) {
    const company = offer.companySlug || offer.company;
    if (seen.has(company)) rest.push(offer);
    else {
      seen.add(company);
      first.push(offer);
    }
  }
  return [...first, ...rest];
}

export function OfferCard({
  o,
  saved,
  onSave,
  categories = defaultCategories,
}: {
  o: Offer;
  categories?: Category[];
  saved: boolean;
  onSave: () => void;
}) {
  const cat = categories.find((c) => c.id === o.category);
  return (
    <article className="offer-card">
      <div className="card-image">
        <a href={"/promocja/" + o.slug}>
          <OfferVisual offer={o} />
        </a>
        <span className="discount">{o.badge}</span>
        <button
          className={"heart " + (saved ? "is-saved" : "")}
          onClick={onSave}
          aria-pressed={saved}
          aria-label={saved ? "Cofnij serduszko" : "Daj serduszko"}
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
          <span>{o.hearts || 0}</span>
        </button>
        {o.sponsored && <span className="sponsored-label">Sponsorowane</span>}

      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{o.kind === "event" ? "Wydarzenie" : cat?.name}</span>
          <span>
            <MapPin size={12} />
            {o.area}
          </span>
        </div>
        <a className="card-title" href={"/promocja/" + o.slug}>
          <h3>{o.title}</h3>
        </a>
        <a className="company" href={"/firma/" + o.companySlug}>
          {o.company}
        </a>
        <p>{o.summary}</p>
        {o.price && <strong className="offer-price">{o.price}</strong>}
        <div className="offer-address"><MapPin size={13} />{o.address}</div>
        <div className="card-bottom">
          <span>
            <Clock size={13} />
            {o.kind === "event"
              ? eventDateLabel(o, today())
              : o.end
              ? "Do " + dateLabel(o.end)
              : o.days.length === 7
                ? "Bez daty końcowej"
                : o.days
                    .map(
                      (d) => ["Ndz", "Pn", "Wt", "Śr", "Czw", "Pt", "Sob"][d],
                    )
                    .join(", ")}
          </span>
          <a
            href={"/promocja/" + o.slug}
            aria-label={"Szczegóły: " + o.title}
          >
            Szczegóły <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
export default function Catalog({
  offers,
  initialCategory = "all",
  pageTitle,
  categoryContent,
  beforeCategories,
  categories = defaultCategories,
}: {
  offers: Offer[];
  initialCategory?: string;
  pageTitle?: string;
  categoryContent?: string;
  beforeCategories?: React.ReactNode;
  categories?: Category[];
}) {
  const [heartCounts, setHeartCounts] = useState<Record<string, number>>({});
  const [heartBusy, setHeartBusy] = useState(false);
  const [heartError, setHeartError] = useState("");
  const [category, setCategory] = useState(initialCategory),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("all"),
    [area, setArea] = useState("all"),
    [sort, setSort] = useState("recommended"),
    [expanded, setExpanded] = useState(false),
    [limit, setLimit] = useState(6),
    [saved, setSaved] = useState<string[]>([]),
    [savedOnly, setSavedOnly] = useState(false);
  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("bnp-saved") || "[]"));
    } catch {}
    setSavedOnly(new URLSearchParams(location.search).has("zapisane"));
  }, []);
  async function save(id: string) {
    if (heartBusy) return;
    setHeartBusy(true);
    setHeartError("");
    const enabled = !saved.includes(id);
    try {
      const response = await fetch("/api/hearts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
      if (!response.ok)
        throw new Error("Nie udało się zapisać serduszka. Spróbuj ponownie.");
      const result = await response.json();
      setHeartCounts((previous) => ({ ...previous, [id]: result.count }));
      const next = enabled
        ? [...saved, id]
        : saved.filter((item) => item !== id);
      setSaved(next);
      try {
        localStorage.setItem("bnp-saved", JSON.stringify(next));
      } catch {}
    } catch (error) {
      setHeartError((error as Error).message);
    } finally {
      setHeartBusy(false);
    }
  }
  const hearts = (offer: Offer) => heartCounts[offer.id] ?? offer.hearts ?? 0;
  const adUrl = process.env.NEXT_PUBLIC_PRICESTOK_AD_URL || "";
  const adTitle = process.env.NEXT_PUBLIC_PRICESTOK_AD_TITLE || "";
  const hasAd = /^https?:\/\/[^\s]+$/i.test(adUrl) && !!adTitle.trim();
  const calendarDay = today();
  const active = offers.filter((o) => isActive(o, calendarDay));
  const isHomepage = !pageTitle;
  const showDiscovery = isHomepage && category === "all" && !savedOnly;
  const upcomingEvents = active.filter((o) => o.kind === "event" && (o.start || o.end))
    .sort((a, b) => eventOrder(a, b, calendarDay));
  const matchesCategory = (o: Offer, id: string) =>
    o.category === id || categories.some((c) => c.id === o.category && c.parent === id);
  const areas = [...new Set(active.map((o) => o.area))].sort();
  const day = weekday(calendarDay);
  const nextSaturday = new Date(calendarDay + "T12:00:00Z");
  nextSaturday.setUTCDate(nextSaturday.getUTCDate() + (day === 0 ? -1 : 6 - day));
  const saturday = nextSaturday.toISOString().slice(0, 10);
  const sunday = new Date(nextSaturday.getTime() + 86400000).toISOString().slice(0, 10);
  const SectionTitle = category !== "all" || pageTitle || savedOnly ? "h1" : "h2";
  let filtered = active.filter(
    (o) =>
      (category === "all" || matchesCategory(o, category)) &&
      (area === "all" || o.area === area) &&
      (!savedOnly || saved.includes(o.id)) &&
      (tab !== "events" || o.kind === "event") &&
      (!showDiscovery || tab === "events" || !!query.trim() || o.kind !== "event") &&
      `${o.title} ${o.company} ${o.summary}`
        .toLocaleLowerCase("pl")
        .includes(query.toLocaleLowerCase("pl")) &&
      (tab !== "today" ||
        (o.kind === "event"
          ? (!o.start || o.start <= calendarDay) && o.days.includes(day)
          : o.days.includes(day))) &&
      (tab !== "weekend" ||
        (o.kind === "event"
          ? (!o.start || o.start <= sunday) && (!o.end || o.end >= saturday) &&
            o.days.some((d) => d === 0 || d === 6)
          : o.days.some((d) => d === 0 || d === 6))) &&
      (tab !== "ending" ||
        (!!o.end &&
          o.end <=
            new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))),
  );
  if (sort === "recommended" && showDiscovery && tab !== "events" && !query.trim()) {
    filtered = homepageDeals(filtered, calendarDay);
  } else filtered.sort((a, b) =>
    tab === "events" && sort === "recommended" ? eventOrder(a, b, calendarDay) :
    sort === "ending"
      ? (a.end || "9999").localeCompare(b.end || "9999")
      : sort === "newest"
        ? b.verified.localeCompare(a.verified)
        : Number(b.featured) - Number(a.featured) ||
          hearts(b) - hearts(a) ||
          b.verified.localeCompare(a.verified),
  );
  function choose(v: string) {
    if (pageTitle) { location.href = v === "all" ? "/#okazje" : "/kategoria/" + v; return; }
    setCategory(v);
    setTab("all");
    setLimit(6);
    requestAnimationFrame(() => document.querySelector(".category-section")?.scrollIntoView({ behavior: "instant", block: "start" }));
    if (typeof history !== "undefined")
      history.replaceState(null, "", v === "all" ? "/" : "/kategoria/" + v);
  }
  return (
    <>
      <Header />
      <main className={category !== "all" || pageTitle ? "category-mode" : undefined}>
        {showDiscovery && (
          <>
            <aside className="home-season" aria-label="Choinki">
              <a className="container" href={treeCampaignUrl} target="_blank" rel="noopener noreferrer sponsored">
                <TreePine size={18} aria-hidden="true" />
                <span>Gdzie kupić lokalne żywe choinki online?</span>
                <strong>choinki.bialystok.pl <ArrowUpRight size={15} aria-hidden="true" /></strong>
              </a>
            </aside>
            <section className="home-discovery container" aria-labelledby="home-title">
              <div className="home-intro">
                <div>
                  <h1 id="home-title">Co się dzieje w Białymstoku?</h1>
                  <p>Najbliższe wydarzenia i aktualne promocje lokalnych firm.</p>
                </div>
                <form className="search-box" role="search" onSubmit={(e) => {
                  e.preventDefault();
                  setTab("all");
                  document.getElementById("okazje")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  <Search size={19} aria-hidden="true" />
                  <input value={query} onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(6);
                  }} placeholder="Szukaj w Białymstoku" aria-label="Szukaj wydarzeń i promocji" />
                  <button className="button">Szukaj</button>
                </form>
              </div>
              {upcomingEvents.length > 0 && (
                <section className="home-events" aria-labelledby="home-events-title">
                  <div className="home-events-heading">
                    <h2 id="home-events-title">Najbliższe wydarzenia</h2>
                    <a className="text-link" href="#okazje" onClick={() => {
                      setQuery("");
                      setTab("events");
                      setArea("all");
                      setSort("recommended");
                      setLimit(6);
                    }}>Wszystkie wydarzenia <ArrowRight size={17} aria-hidden="true" /></a>
                  </div>
                  <div className="home-event-grid">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <a className="home-event" key={event.id} href={"/promocja/" + event.slug}>
                        <span className="home-event-date"><CalendarDays size={17} aria-hidden="true" /> {eventDateLabel(event, calendarDay)}</span>
                        <h3>{event.title}</h3>
                        {event.address && <span className="home-event-address"><MapPin size={15} aria-hidden="true" />{event.address}</span>}
                        <span className="home-event-footer">
                          <span>{event.price || "Zobacz szczegóły"}</span>
                          <ArrowUpRight size={19} aria-hidden="true" />
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </section>
          </>
        )}
        <section className="category-section container" aria-label="Kategorie">
          <div className="section-mini">
            <span>Przeglądaj kategorie</span>
          </div>
          <div className="categories">
            <a
              href="/"
              className={"category " + (category === "all" ? "selected" : "")}
              onClick={(e) => {
                if (pageTitle) return;
                e.preventDefault();
                choose("all");
              }}
            >
              <span className="category-icon all">
                <Grid2X2 size={24} />
              </span>
              <strong>Wszystkie</strong>
              <small>{active.length} {countLabel(active.length)}</small>
            </a>
            {categories.filter((c) => !c.parent).map((c) => {
              const Icon = icons[c.icon] || Ticket;
              return (
                <a
                  key={c.id}
                  href={"/kategoria/" + c.id}
                  className={
                    "category " + (category === c.id ? "selected" : "")
                  }
                  onClick={(e) => {
                    if (pageTitle) return;
                    e.preventDefault();
                    choose(c.id);
                  }}
                >
                  <span
                    className="category-icon"
                    style={{ background: c.color }}
                  >
                    <Icon size={24} />
                  </span>
                  <strong>{c.name}</strong>
                  <small>
                    {active.filter((o) => matchesCategory(o, c.id)).length}{" "}
                    {countLabel(
                      active.filter((o) => matchesCategory(o, c.id)).length,
                    )}
                  </small>
                </a>
              );
            })}
          </div>
        </section>
        {categories.some((c) => c.parent === category) && (
          <nav className="container admin-tools" aria-label="Podkategorie">
            {categories.filter((c) => c.parent === category).map((c) => (
              <a className="filter-button" key={c.id} href={"/kategoria/" + c.id}>{c.name}</a>
            ))}
          </nav>
        )}
        <section className="offers-section container" id="okazje">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ODKRYWAJ LOKALNIE</div>
              <SectionTitle>
                {savedOnly
                  ? "Twoje zapisane okazje"
                  : tab === "events"
                    ? "Wydarzenia w Białymstoku"
                  : category === "all"
                    ? "Lokalne promocje"
                    : categories.find((c) => c.id === category)?.name +
                      " w Białymstoku"}
              </SectionTitle>
              <p>
                {savedOnly
                  ? "Ulubione promocje zapisane w tej przeglądarce."
                  : tab === "events" ? "Terminy, miejsca i informacje o zapisach." : "Sprawdź warunki i terminy u lokalnych firm."}
              </p>
            </div>
            <a
              className="text-link"
              href="/#okazje"
              onClick={(e) => {
                e.preventDefault();
                choose("all");
                setQuery("");
                setTab("all");
                setSavedOnly(false);
                setLimit(1000);
              }}
            >
              {tab === "events" ? "Przejdź do promocji" : "Wszystkie promocje"} <ArrowRight size={17} />
            </a>
          </div>
          <div className="filters">
            <div className="tabs">
              {[
                ["all", "Wszystkie"],
                ...(isHomepage ? [["events", "Wydarzenia"]] : []),
                ["today", "Dzisiaj"],
                ["weekend", "Na weekend"],
                ["ending", "Kończą się wkrótce"],
              ].map(([v, t]) => (
                <button
                  key={v}
                  className={tab === v ? "active" : ""}
                  aria-pressed={tab === v}
                  onClick={() => {
                    setTab(v);
                    setLimit(6);
                  }}
                >
                  {v === "today" && <span className="live-dot" />}
                  {t}
                </button>
              ))}
            </div>
            <button
              className={"filter-button " + (expanded ? "active" : "")}
              onClick={() => setExpanded(!expanded)}
            >
              <SlidersHorizontal size={16} /> Filtruj{" "}
              {(area !== "all" || savedOnly) && <span className="filter-dot" />}
            </button>
          </div>
          {expanded && (
            <div className="expanded-filters">
              <label>
                Okolica
                <select
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    setLimit(6);
                  }}
                >
                  <option value="all">Cały Białystok</option>
                  {areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label>
                Kolejność
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recommended">{tab === "events" ? "Według daty wydarzenia" : showDiscovery ? "Polecane dziś" : "Polecane"}</option>
                  <option value="newest">Ostatnio sprawdzone</option>
                  <option value="ending">Najbliższy koniec</option>
                </select>
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                />{" "}
                Tylko zapisane
              </label>
              <button
                className="text-link"
                onClick={() => {
                  setArea("all");
                  setQuery("");
                  setSavedOnly(false);
                  setTab("all");
                }}
              >
                Wyczyść filtry <X size={14} />
              </button>
            </div>
          )}
          <div className="results-line">
            <span>
              {filtered.length} {countLabel(filtered.length)}
              {query ? " dla „" + query + "”" : ""}
            </span>
            <span>
              <Check size={13} /> Źródła i warunki przy każdej ofercie
            </span>
          </div>
          {heartError && (
            <p className="message error" role="alert">
              {heartError}
            </p>
          )}
          {filtered.length ? (
            <>
              <div className="offer-grid">
                {filtered.slice(0, limit).map((o) => (
                  <OfferCard
                    key={o.id}
                    o={{ ...o, hearts: hearts(o) }}
                    categories={categories}
                    saved={saved.includes(o.id)}
                    onSave={() => save(o.id)}
                  />
                ))}
              </div>
              {filtered.length > limit && (
                <div className="load-more">
                  <button
                    className="button outline"
                    onClick={() => setLimit(limit + 6)}
                  >
                    Pokaż kolejne okazje <Plus size={17} />
                  </button>
                  <span>
                    Pokazujemy {Math.min(limit, filtered.length)} z{" "}
                    {filtered.length} ofert
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <Search size={32} />
              <h3>Tu jeszcze szukamy dobrych okazji</h3>
              <p>Zmień filtry lub zaproponuj promocję, którą warto tu dodać.</p>
              <button
                className="button outline"
                onClick={() => {
                  choose("all");
                  setArea("all");
                  setTab("all");
                  setQuery("");
                  setSavedOnly(false);
                }}
              >
                Pokaż wszystkie promocje
              </button>
            </div>
          )}
        </section>
        {showDiscovery && beforeCategories && <div className="container">{beforeCategories}</div>}
        {showDiscovery && hasAd && (
          <aside className="container" aria-label="Miejsce reklamowe">
            <div className="local-ad">
              <div>
                <span className="eyebrow">REKLAMA</span>
                <h2>{adTitle}</h2>
                <p>{process.env.NEXT_PUBLIC_PRICESTOK_AD_TEXT}</p>
              </div>
              <a className="button" href={adUrl} target="_blank" rel="sponsored noopener noreferrer">
                Zobacz ofertę ↗
              </a>
            </div>
          </aside>
        )}
        <section className="business-banner container">
          <div className="banner-art">
            <span>
              +<br />%
            </span>
            <span className="mini-ticket">
              TWOJA FIRMA
              <br />
              <b>PRICESTOK</b>
            </span>
          </div>
          <div>
            <div className="eyebrow">PROWADZISZ FIRMĘ W BIAŁYMSTOKU?</div>
            <h2>
              Dobra oferta zasługuje
              <br />
              na dobry zasięg.
            </h2>
            <p>
              Pokaż swoją promocję mieszkańcom, którzy szukają
              <br className="desktop" /> powodu, żeby odwiedzić właśnie Ciebie.
            </p>
          </div>
          <div className="business-actions">
            <a className="button" href="/dodaj-promocje">Zgłoś okazję bezpłatnie</a>
            <a className="button outline" href="/dla-firm">Zobacz płatne pakiety <ArrowUpRight size={16} /></a>
          </div>
        </section>
        <div className="container trust-strip">
          <span>
            <MapPin /> Tylko lokalne miejsca
          </span>
          <span>
            <Check /> Konkretne korzyści i jasne warunki
          </span>
          <span>
            <Heart /> Z myślą o Białymstoku
          </span>
        </div>
        {categoryContent && (
          <section className="container detail-long">
            <h2>Więcej o kategorii</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{categoryContent}</p>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

