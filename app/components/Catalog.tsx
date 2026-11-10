"use client";
import { useState, useEffect } from "react";
import OfferVisual from "./OfferVisual";
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
          <span>{cat?.name}</span>
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
            {o.end
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
            aria-label={"Szczegóły promocji: " + o.title}
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
  const active = offers.filter((o) => isActive(o));
  const matchesCategory = (o: Offer, id: string) =>
    o.category === id || categories.some((c) => c.id === o.category && c.parent === id);
  const heroOffer = active.find((o) => o.category === "jedzenie") || active[0];
  const areas = [...new Set(active.map((o) => o.area))].sort();
  const day = weekday();
  const SectionTitle = category !== "all" || pageTitle || savedOnly ? "h1" : "h2";
  let filtered = active.filter(
    (o) =>
      (category === "all" || matchesCategory(o, category)) &&
      (area === "all" || o.area === area) &&
      (!savedOnly || saved.includes(o.id)) &&
      `${o.title} ${o.company} ${o.summary}`
        .toLocaleLowerCase("pl")
        .includes(query.toLocaleLowerCase("pl")) &&
      (tab !== "today" || o.days.includes(day)) &&
      (tab !== "weekend" || o.days.some((d) => d === 0 || d === 6)) &&
      (tab !== "ending" ||
        (!!o.end &&
          o.end <=
            new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))),
  );
  filtered.sort((a, b) =>
    sort === "ending"
      ? (a.end || "9999").localeCompare(b.end || "9999")
      : sort === "newest"
        ? b.verified.localeCompare(a.verified)
        : Number(b.featured) - Number(a.featured) ||
          hearts(b) - hearts(a) ||
          b.verified.localeCompare(a.verified),
  );
  function choose(v: string) {
    setCategory(v);
    setLimit(6);
    if (typeof history !== "undefined")
      history.replaceState(null, "", v === "all" ? "/" : "/kategoria/" + v);
  }
  return (
    <>
      <Header />
      <main className={category !== "all" || pageTitle ? "category-mode" : undefined}>
        {category === "all" && !pageTitle && !savedOnly && <>
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> PRICESTOK · OKAZJE Z BIAŁEGOSTOKU
            </div>
            <h1>
              {pageTitle || (
                <>
                  Twoje miasto.
                  <br />
                  Więcej{" "}
                  <span>
                    dobrych okazji
                    <svg viewBox="0 0 500 18" preserveAspectRatio="none">
                      <path d="M3 13Q230 -2 495 9" />
                    </svg>
                  </span>
                  .
                </>
              )}
            </h1>
            <p>
              Szukasz rabatu na obiad, trening albo zakupy? W PriceStok
              znajdziesz promocje białostockich firm, ich warunki i adresy.
            </p>
            <form
              className="search-box"
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .getElementById("okazje")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Search size={21} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(6);
                }}
                placeholder="Na co masz dziś ochotę?"
                aria-label="Szukaj promocji"
              />
              <button className="button">
                Szukaj <ArrowRight size={17} />
              </button>
            </form>
            <div className="hero-proof">
              <span>
                <Check size={15} /> Prawdziwe lokalne oferty
              </span>
              <span>
                <Check size={15} /> Bez zakładania konta
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-picture">
              {heroOffer && <OfferVisual offer={heroOffer} />}
              <div className="hero-picture-overlay" />
              <div className="visual-caption">
                <span>LOKALNA OKAZJA</span>
                <strong>{heroOffer?.title || "Odkryj lokalne okazje"}</strong>
                <a
                  href={heroOffer ? "/promocja/" + heroOffer.slug : "/#okazje"}
                >
                  Odkryj tę okazję <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
            <div className="floating-discount">
              <span>{heroOffer?.company || "Białystok"}</span>
              <strong>{heroOffer?.badge || "PLUS"}</strong>
              <span>Sprawdź warunki promocji</span>
            </div>
            <div className="floating-location">
              <MapPin size={16} /> Białystok, po sąsiedzku <span>♡</span>
            </div>
            <span className="hero-deco">✳</span>
          </div>
        </section>
        <aside className="container" aria-label="Miejsce reklamowe">
          <div className="local-ad">
            <div>
              <span className="eyebrow">
                {hasAd ? "REKLAMA" : "MIEJSCE REKLAMOWE"}
              </span>
              <h2>{hasAd ? adTitle : "Twoja firma w centrum uwagi"}</h2>
              <p>
                {hasAd
                  ? process.env.NEXT_PUBLIC_PRICESTOK_AD_TEXT
                  : "Zaprezentuj ofertę mieszkańcom Białegostoku."}
              </p>
            </div>
            {hasAd ? (
              <a
                className="button"
                href={adUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                Zobacz ofertę ↗
              </a>
            ) : (
              <a className="button" href="/dla-firm#reklama">
                Zapytaj o wynajem ↗
              </a>
            )}
          </div>
        </aside>
        </>}
        <section className="category-section container" aria-label="Kategorie">
          {category === "all" && !pageTitle && !savedOnly && beforeCategories}
          <div className="section-mini">
            <span>Znajdź coś dla siebie</span>
            <span>Małe oszczędności, wielka przyjemność.</span>
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
              <small>{active.length} okazji</small>
            </a>
            {categories.filter((c) => !c.parent).map((c) => {
              const Icon = icons[c.icon];
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
                  : category === "all"
                    ? "Dobre okazje są blisko"
                    : categories.find((c) => c.id === category)?.name +
                      " w Białymstoku"}
                <span className="heading-dot">.</span>
              </SectionTitle>
              <p>
                {savedOnly
                  ? "Ulubione promocje zapisane w tej przeglądarce."
                  : "Wybierz coś dla siebie. Resztę zostaw na kolejny raz."}
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
              Wszystkie promocje <ArrowRight size={17} />
            </a>
          </div>
          <div className="filters">
            <div className="tabs">
              {[
                ["all", "Wszystkie"],
                ["today", "Dzisiaj"],
                ["weekend", "Na weekend"],
                ["ending", "Kończą się wkrótce"],
              ].map(([v, t]) => (
                <button
                  key={v}
                  className={tab === v ? "active" : ""}
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
                  <option value="recommended">Wybrane przez redakcję</option>
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

