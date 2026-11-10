"use client";
import OfferShare from "./OfferShare";
import NewsletterAdmin from "./NewsletterAdmin";
import { useState, useEffect } from "react";
import { Plus, X, RefreshCw, Search, Grid2X2, Utensils, Sparkles, Dumbbell, Ticket, ShoppingBag, Wrench, Baby } from "lucide-react";
import { Offer, categories as defaultCategories, today, isActive } from "../lib/data";
import { holiday } from "../lib/holiday";
import CategoryAdmin from "./CategoryAdmin";
import type { Category } from "../lib/categories";
import { BillingAdmin } from "./Billing";
import { offerPhoto, photoName } from "../lib/photos";
import type { Company } from "../lib/companies";
const categoryIcons: Record<string, typeof Grid2X2> = {Utensils, Sparkles, Dumbbell, Ticket, ShoppingBag, Wrench, Baby};
const blank = (): Offer => ({
  id: "oferta-" + Date.now(),
  slug: "oferta-" + Date.now(),
  title: "",
  company: "",
  companySlug: "",
  category: "jedzenie",
  badge: "",
  summary: "",
  conditions: "",
  address: "",
  area: "Centrum",
  source: "",
  image: "pizza",
  days: [0, 1, 2, 3, 4, 5, 6],
  start: "",
  end: "",
  verified: today(),
  status: "draft",
  featured: false,
  price: "",
  oldPrice: "",
});
function slugify(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}
export default function AdminPanel() {
  const [shareOffer, setShareOffer] = useState<Offer | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [tab, setTab] = useState("oferty");
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyError, setCompanyError] = useState("");
  const [companyDraft, setCompanyDraft] = useState<{
    name: string;
    category: string;
    address: string;
    website: string;
    description: string;
  } | null>(null);
  const [companyBusy, setCompanyBusy] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("category");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [archive, setArchive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]),
    [offers, setOffers] = useState<Offer[]>([]),
    [subs, setSubs] = useState<any[]>([]),
    [metrics, setMetrics] = useState<any[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [edit, setEdit] = useState<Offer | null>(null),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false);
  async function reload() {
    try {
      const r = await fetch("/api/admin");
      const d = await r.json().catch(() => null);
      if (!r.ok || !d)
        throw new Error(
          d?.error ||
            (r.status === 403
              ? "Sesja wygasła. Zaloguj się ponownie."
              : "Nie udało się pobrać danych."),
        );
      setOffers(d.offers);
      setCategories(d.categories || defaultCategories);
      setOrders(d.orders || []);
      setSubs(d.submissions);
      setMetrics(d.metrics);
      setLoaded(true);
      return true;
    } catch (e: any) {
      setMessage(e.message);
      return false;
    }
  }
  useEffect(() => {
    const saved = Number(localStorage.getItem("pricestok-admin-page-size"));
    if ([10, 20, 50, 100].includes(saved)) setPageSize(saved);
    reload();
    loadCompanies();
  }, []);
  async function loadCompanies() {
    try {
      const response = await fetch("/api/admin/companies");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCompanies(data);
      setCompanyError("");
    } catch (error) {
      setCompanyError((error as Error).message);
    }
  }
  async function addCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCompanyBusy(true);
    setCompanyError("");
    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      form.reset();
      setCompanyDraft(null);
      await loadCompanies();
    } catch (error) {
      setCompanyError((error as Error).message);
    } finally {
      setCompanyBusy(false);
    }
  }
  async function uploadPhoto(file: File, offerId: string) {
    if (file.size > 3145728) {
      setMessage("Zdjęcie może mieć najwyżej 3 MB.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("photo", file);
      const response = await fetch("/api/admin/photos", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEdit((current) =>
        current?.id === offerId ? { ...current, image: data.image } : current,
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function action(data: any) {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const j: any = await r.json().catch(() => ({}));
        throw new Error(j.error || "Zapis nie powiódł się.");
      }
      const refreshed = await reload();
      setSelected([]);
      if (refreshed) setMessage(data.action === "verifyOffer" ? "Oferta sprawdzona · " + today() : "Zmiany zostały zapisane.");
      return true;
    } catch (e: any) {
      setMessage(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || id;
  const isArchived = (o: Offer) => o.status === "archived" || (o.status === "published" && !!o.end && o.end < today());
  const matchesCategory = (o: Offer, id: string) => !id || o.category === id || categories.some(c => c.id === o.category && c.parent === id);
  const categoryOffers = offers.filter(o => tab === "archiwum" ? isArchived(o) : !isArchived(o));
  function chooseCategory(id: string) {setCategory(id);setPage(1);setSelected([]);}
  const results = offers.filter(
    (o) =>
      matchesCategory(o, category) &&
      (tab === "archiwum" ? isArchived(o) : !isArchived(o) && (status === "all" || o.status === status)) &&
      `${o.title} ${o.company}`.toLowerCase().includes(query.toLowerCase()),
  );
  results.sort((a, b) => {
    const byTitle = a.title.localeCompare(b.title, "pl");
    if (sort === "title") return byTitle;
    if (sort === "end")
      return (a.end || "9999").localeCompare(b.end || "9999") || byTitle;
    if (sort === "verified")
      return b.verified.localeCompare(a.verified) || byTitle;
    return (
      categoryName(a.category).localeCompare(categoryName(b.category), "pl") ||
      byTitle
    );
  });
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, pages);
  const offset = (currentPage - 1) * pageSize;
  const visible = results.slice(offset, offset + pageSize);
  const pageSelected =
    visible.length > 0 && visible.every((offer) => selected.includes(offer.id));
  function selectPage(checked: boolean) {
    const ids = visible.map((offer) => offer.id);
    setSelected((previous) =>
      checked
        ? [...new Set([...previous, ...ids])].slice(0, 100)
        : previous.filter((id) => !ids.includes(id)),
    );
  }
  const pending = offers.filter(
    (o) =>
      isActive(o) &&
      new Date(today()).getTime() - new Date(o.verified).getTime() >
        14 * 86400000,
  ).length;
  function field(k: keyof Offer, v: any) {
    setEdit((e) => (e ? { ...e, [k]: v } : e));
  }
  function duplicate(o: Offer) {
    const id = o.id + "-" + Date.now().toString(36);
    setEdit({
      ...o,
      id,
      slug: id,
      title: o.title + " — kopia",
      status: "draft",
    });
  }
  function selectOffer(o: Offer) {
    return (
      <input
        type="checkbox"
        aria-label={"Zaznacz " + o.title}
        checked={selected.includes(o.id)}
        disabled={selected.length >= 100 && !selected.includes(o.id)}
        onChange={(event) =>
          setSelected((previous) =>
            event.target.checked
              ? [...previous, o.id].slice(0, 100)
              : previous.filter((id) => id !== o.id),
          )
        }
      />
    );
  }
  function offerState(o: Offer) {
    return (
      <div>
        <span className={"status " + o.status}>
          {o.status === "published"
            ? isActive(o)
              ? "Aktualna"
              : o.start > today()
                ? "Zaplanowana"
                : "Po terminie"
            : o.status === "draft"
              ? "Szkic"
              : "Archiwum"}
        </span>
        <small className="admin-offer-dates">
          {o.start && "Od " + o.start + " · "}
          {o.end ? "Do " + o.end : "Bez daty końcowej"}
        </small>
      </div>
    );
  }
  function offerActions(o: Offer) {
    return (
      <div className="admin-offer-actions">
        <button className="table-action" onClick={() => setEdit({ ...o })}>
          Edytuj
        </button>
        <button className="table-action" onClick={() => duplicate(o)}>
          Duplikuj
        </button>
        {isActive(o) && <button className="table-action" onClick={() => setShareOffer(o)}>Facebook · tekst i grafika</button>}
        {isActive(o) && (
          <a
            className="table-action"
            href={"/promocja/" + o.slug}
            target="_blank"
            rel="noopener noreferrer"
          >
            Podgląd ↗
          </a>
        )}
        <button
          className="table-action"
          disabled={busy}
          onClick={() =>
            action({ action: "verifyOffer", id: o.id })
          }
        >
          {o.verified === today() ? "✓ Sprawdzona dziś" : "Oznacz jako sprawdzoną"}
        </button>
        <button className="table-action" disabled={busy} onClick={() => {
          if (!confirm(o.sponsored ? "Zarchiwizować płatną ofertę?" : "Usunąć tę ofertę z panelu i strony?")) return;
          void action(o.sponsored
            ? { action: "bulk", ids: [o.id], status: "archived" }
            : { action: "deleteOffer", id: o.id });
        }}>{o.sponsored ? "Archiwizuj" : "Usuń"}</button>
      </div>
    );
  }
  const metricsById = new Map(metrics.map((metric) => [metric.id, metric]));
  return (
    <>
      <div className="panel-top">
        <div>
          <div className="eyebrow">PRICESTOK · REDAKCJA</div>
          <h1 className="page-title">Twoje promocje</h1>
          <p className="lead">
            Dodawaj, aktualizuj i porządkuj oferty w jednym miejscu.
          </p>
        </div>
        <button
          className="button outline"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            location.reload();
          }}
        >
          Wyloguj
        </button>
        <button className="button" onClick={() => { setTab("oferty"); setEdit(blank()); }}>
          <Plus size={17} /> Nowa promocja
        </button>
      </div>
      <nav className="admin-tools" aria-label="Sekcje panelu">
        {Object.entries({ oferty: "Oferty", archiwum: "Archiwum ofert", zgloszenia: "Zgłoszenia", firmy: "Firmy", platnosci: "Płatności", kategorie: "Kategorie", newsletter: "Newsletter" }).map(([id, name]) => (
          <button key={id} className="filter-button" aria-pressed={tab === id} onClick={() => { setTab(id); setPage(1); setSelected([]); }}>{name}</button>
        ))}
      </nav>
      {message && <p className="message" role="status">{message}</p>}
      {tab === "newsletter" && <NewsletterAdmin />}
      {tab === "kategorie" && <CategoryAdmin categories={categories} reload={reload} />}
      {(tab === "oferty" || tab === "archiwum") && <>
      <div className="panel-stats">
        <div className="stat">
          Aktualne oferty
          <strong>{offers.filter((o) => isActive(o)).length}</strong>
        </div>
        <div className="stat">
          Zgłoszenia do przejrzenia
          <strong>{subs.filter((s) => !s.archived_at).length}</strong>
        </div>
        <div className="stat">
          Do ponownego sprawdzenia (14 dni)<strong>{pending}</strong>
        </div>
        <div className="stat">
          Przejścia do firm
          <strong>{metrics.reduce((s, r) => s + r.clicks, 0)}</strong>
        </div>
      </div>
      <nav className="admin-category-picker" aria-label="Kategorie ofert">
        <div className="categories">
          <button type="button" className={"category " + (!category ? "selected" : "")} aria-pressed={!category} onClick={() => chooseCategory("")}>
            <span className="category-icon all"><Grid2X2 size={24}/></span><strong>Wszystkie</strong><small>{categoryOffers.length} ofert</small>
          </button>
          {categories.filter(c => !c.parent).map(c => {
            const Icon = categoryIcons[c.icon] || ShoppingBag;
            const selectedCategory = category === c.id || categories.some(child => child.id === category && child.parent === c.id);
            return <button type="button" key={c.id} className={"category " + (selectedCategory ? "selected" : "")} aria-pressed={selectedCategory} onClick={() => chooseCategory(c.id)}>
              <span className="category-icon" style={{background:c.color}}><Icon size={24}/></span><strong>{c.name}</strong><small>{categoryOffers.filter(o => matchesCategory(o,c.id)).length} ofert</small>
            </button>;
          })}
        </div>
        {categories.some(c => c.parent === category || c.id === category && c.parent) && <div className="admin-tools" aria-label="Podkategorie ofert">
          {categories.filter(c => c.parent === category || c.parent && c.parent === categories.find(parent => parent.id === category)?.parent).map(c => <button className="filter-button" key={c.id} aria-pressed={category === c.id} onClick={() => chooseCategory(c.id)}>{c.name}</button>)}
        </div>}
      </nav>
      <div className="admin-tools" id="panel-oferty">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Szukaj firmy lub promocji"
          aria-label="Szukaj w panelu"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Status ogłoszenia"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="published">Opublikowane</option>
          <option value="draft">Szkice</option>
        </select>
        <select
          value={sort}
          aria-label="Sortowanie ofert"
          onChange={(event) => {
            setSort(event.target.value);
            setPage(1);
          }}
        >
          <option value="category">Sortuj według kategorii</option>
          <option value="title">Tytuł A–Z</option>
          <option value="end">Termin zakończenia</option>
          <option value="verified">Ostatnio sprawdzone</option>
        </select>
        <button className="filter-button" onClick={reload}>
          <RefreshCw size={14} /> Odśwież
        </button>
        {selected.length > 0 && (
          <>
            <select aria-label="Kategoria docelowa" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
              <option value="">Kategoria docelowa</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.parent ? categoryName(c.parent) + " / " : ""}{c.name}</option>)}
            </select>
            <button className="table-action" disabled={busy || !moveTo}
              onClick={() => action({ action: "moveOffers", ids: selected, category: moveTo })}>Przenieś zaznaczone</button>
            <span>{selected.length} zaznaczonych (maks. 100)</span>
            <button className="table-action" onClick={() => setSelected([])}>
              Wyczyść zaznaczenie
            </button>
            {[
              ["published", "Publikuj"],
              ["draft", "Ukryj"],
              ["archived", "Archiwizuj"],
            ].map(([s, t]) => (
              <button
                key={s}
                disabled={busy}
                className="table-action"
                onClick={() =>
                  action({ action: "bulk", ids: selected, status: s })
                }
              >
                {t}
              </button>
            ))}
          </>
        )}
      </div>
      <div className="admin-tools admin-offer-view">
        <button
          className="filter-button"
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
        >
          Lista
        </button>
        <button
          className="filter-button"
          aria-pressed={view === "grid"}
          onClick={() => setView("grid")}
        >
          Kafelki
        </button>
        <label>
          Na stronie{" "}
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              localStorage.setItem("pricestok-admin-page-size", event.target.value);
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={pageSelected}
            disabled={!visible.length}
            onChange={(event) => selectPage(event.target.checked)}
          />{" "}
          Zaznacz stronę
        </label>
      </div>
      {!loaded && (
        <p>{message ? "Dane nie zostały wczytane." : "Wczytujemy oferty…"}</p>
      )}
      {loaded && !results.length && <p>Brak ofert spełniających filtry.</p>}
      {view === "list" && visible.length > 0 && (
        <div className="table-wrap admin-offers-table">
          <table>
            <thead>
              <tr>
                <th aria-label="Wybór" />
                <th>Promocja / Firma</th>
                <th>Kategoria</th>
                <th>Status / Ważność</th>
                <th>Sprawdzono</th>
                <th>Odsłony / Kliknięcia</th>
                <th>Działania</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const metric = metricsById.get(o.id);
                return (
                  <tr key={o.id}>
                    <td>{selectOffer(o)}</td>
                    <td>
                      <div className="admin-offer-title">
                        <img
                          className="admin-offer-thumb"
                          src={offerPhoto(o.image)}
                          alt=""
                          width={64}
                          height={46}
                          loading="lazy"
                        />
                        <div>
                          <strong>{o.title}</strong>
                          <small>
                            {o.company} · {o.badge}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{categoryName(o.category)}</td>
                    <td>{offerState(o)}</td>
                    <td>{o.verified || "—"}</td>
                    <td>
                      {metric?.views || 0} / {metric?.clicks || 0}
                    </td>
                    <td>{offerActions(o)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {view === "grid" && (
        <div className="admin-offers-grid">
          {visible.map((o) => {
            const metric = metricsById.get(o.id);
            return (
              <article key={o.id} className="admin-offer-card">
                <img
                  className="admin-card-photo"
                  src={offerPhoto(o.image)}
                  alt=""
                  loading="lazy"
                />
                <div className="admin-card-body">
                  <div className="admin-card-heading">
                    {selectOffer(o)} <strong>{o.title}</strong>
                  </div>
                  <p>
                    {o.company} · {categoryName(o.category)} · {o.badge}
                  </p>
                  {offerState(o)}
                  <small>
                    Sprawdzono: {o.verified || "—"} · Odsłony:{" "}
                    {metric?.views || 0} · Kliknięcia: {metric?.clicks || 0}
                  </small>
                  {offerActions(o)}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {loaded && results.length > 0 && (
        <nav className="admin-tools admin-pagination" aria-label="Strony ofert">
          <span aria-live="polite">
            {offset + 1}–{offset + visible.length} z {results.length} ofert ·
            strona {currentPage} z {pages}
          </span>
          <button
            className="filter-button"
            disabled={currentPage === 1}
            onClick={() => setPage(1)}
          >
            Pierwsza
          </button>
          <button
            className="filter-button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Poprzednia
          </button>
          <button
            className="filter-button"
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Następna
          </button>
          <button
            className="filter-button"
            disabled={currentPage === pages}
            onClick={() => setPage(pages)}
          >
            Ostatnia
          </button>
        </nav>
      )}
      <p className="form-note">
        Liczniki mierzą otwarcia i przejścia, nie unikalnych użytkowników.
        Weryfikację oznaczaj dopiero po sprawdzeniu aktualnych warunków.
      </p>
      </>}
      {tab === "platnosci" && <section className="submissions" id="panel-platnosci">
        <BillingAdmin categories={categories} />
        <h2>Płatne zamówienia ({orders.length})</h2>
        {!orders.length && (
          <p className="lead">
            Zamówienia pojawią się po rozpoczęciu płatności przez firmę.
          </p>
        )}
        {orders.map((o) => (
          <article className="submission paid-order" key={o.id}>
            <strong>{o.offer.title}</strong>
            <p>
              {o.offer.company} ·{" "}
              {o.plan === "featured" ? "Wyróżnienie" : "Standard"} ·{" "}
              {o.amount / 100} zł
            </p>
            <p className="order-status">
              {(
                {
                  awaiting_payment: "Oczekuje na wpłatę",
                  paid_review: "Opłacona — do sprawdzenia",
                  published: "Opublikowana",
                  expired: "Płatność wygasła",
                  payment_failed: "Płatność nieudana",
                  refund_pending: "Zwrot w toku",
                  refunded: "Zwrócono wpłatę",
                  disputed: "Spór płatniczy",
                } as Record<string, string>
              )[o.status] || o.status}{" "}
              · {o.created_at.slice(0, 10)}
            </p>
            <p>{o.offer.summary}</p>
            <p>{o.offer.conditions}</p>
            <p>
              {o.offer.address} · koniec promocji: {o.offer.end || "nie podano"}
            </p>
            <a
              className="text-link"
              href={o.offer.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Sprawdź źródło ↗
            </a>
            <div className="admin-tools">
              {o.status === "paid_review" && (
                <>
                  <button
                    className="button small"
                    disabled={busy}
                    onClick={() => action({ action: "approveOrder", id: o.id })}
                  >
                    Zatwierdź i publikuj na 30 dni
                  </button>
                  <button
                    className="button outline small"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "Odrzucić ofertę i zlecić pełny zwrot " +
                            o.amount / 100 +
                            " zł?",
                        )
                      )
                        action({ action: "refundOrder", id: o.id });
                    }}
                  >
                    Odrzuć i zwróć wpłatę
                  </button>
                </>
              )}
              {o.status === "published" && o.offer_id && (
                <a
                  className="text-link"
                  href={"/promocja/" + o.offer_id}
                  target="_blank"
                >
                  Zobacz publikację ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </section>}
      {tab === "zgloszenia" && <section className="submissions" id="panel-zgloszenia">
        <h2>Zgłoszenia od firm</h2>
        <div className="admin-tools">
          <button
            className="filter-button"
            aria-pressed={!archive}
            onClick={() => setArchive(false)}
          >
            Nowe ({subs.filter((s) => !s.archived_at).length})
          </button>
          <button
            className="filter-button"
            aria-pressed={archive}
            onClick={() => setArchive(true)}
          >
            Archiwum ({subs.filter((s) => s.archived_at).length})
          </button>
        </div>
        {!subs.some((s) => Boolean(s.archived_at) === archive) && (
          <p className="lead">
            {archive
              ? "Brak zgłoszeń w archiwum."
              : "Nowe zgłoszenia z formularza pojawią się tutaj."}
          </p>
        )}
        {subs
          .filter((s) => Boolean(s.archived_at) === archive)
          .map((s) => {
            let d: any;
            try {
              d = JSON.parse(s.data);
            } catch {
              return null;
            }
            return (
              <article className="submission" key={s.id}>
                <strong>{d.title}</strong>
                {d.kind === "ad" && d.contact && <p>Kontakt: {d.contact}</p>}
                <p>
                  {d.company} · {d.category} · {s.created.slice(0, 10)}
                </p>
                <p>{d.conditions}</p>
                <a
                  className="text-link"
                  href={d.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sprawdź źródło ↗
                </a>
                <div className="admin-tools">
                  {d.kind === "company" && (
                    <button
                      className="table-action"
                      onClick={() => {
                        setCompanyDraft({
                          name: d.company,
                          category: d.category,
                          address: d.address || "",
                          website: d.source,
                          description: d.conditions || "",
                        });
                        setTab("firmy");
                      }}
                    >
                      Przygotuj wizytówkę firmy
                    </button>
                  )}
                  {d.kind !== "company" && d.kind !== "ad" && (
                    <button
                      className="table-action"
                      onClick={() => {
                        const linked = offers.find((o) => o.id === "zgloszenie-" + s.id);
                        setTab("oferty");
                        if (linked) {
                          setEdit({ ...linked });
                          return;
                        }
                        const b = blank();
                        setEdit({
                          ...b,
                          title: d.title,
                          company: d.company,
                          companySlug: slugify(d.company),
                          category: d.category || "jedzenie",
                          source: d.source,
                          address: d.address || "",
                          conditions: d.conditions || "",
                          summary: (d.conditions || "").slice(0, 220),
                          end: d.end || "",
                        });
                      }}
                    >
                      Przygotuj promocję
                    </button>
                  )}
                  <button
                    className="table-action"
                    onClick={() =>
                      action({
                        action: archive
                          ? "restoreSubmission"
                          : "archiveSubmission",
                        id: s.id,
                      })
                    }
                  >
                    {archive ? "Przywróć zgłoszenie" : "Przenieś do archiwum"}
                  </button>
                </div>
              </article>
            );
          })}
      </section>}
      {tab === "firmy" && <section className="submissions" id="panel-firmy">
        <h2>Lokalne firmy ({companies.length})</h2>
        <form
          key={companyDraft ? JSON.stringify(companyDraft) : "new"}
          className="form-card"
          onSubmit={addCompany}
        >
          <div className="form-grid">
            <label className="field">
              Nazwa firmy
              <input
                name="name"
                required
                maxLength={120}
                defaultValue={companyDraft?.name}
              />
            </label>
            <label className="field">
              Kategoria
              <select name="category" defaultValue={companyDraft?.category}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Adres
              <input
                name="address"
                maxLength={200}
                defaultValue={companyDraft?.address}
              />
            </label>
            <label className="field">
              Strona WWW
              <input
                name="website"
                type="url"
                maxLength={500}
                defaultValue={companyDraft?.website}
              />
            </label>
            <label className="field full">
              Opis
              <textarea
                name="description"
                maxLength={2000}
                defaultValue={companyDraft?.description}
              />
            </label>
          </div>
          <button className="button" disabled={companyBusy}>
            Dodaj firmę do katalogu
          </button>
          {companyError && <p role="alert">{companyError}</p>}
        </form>
        <ul>
          {companies.map((c) => (
            <li key={c.slug}>
              <a href={"/firma/" + c.slug}>{c.name}</a> ·{" "}
              {categories.find((item) => item.id === c.category)?.name}
            </li>
          ))}
        </ul>
      </section>}
      {shareOffer && <div className="modal-backdrop" onClick={event => {if(event.target === event.currentTarget)setShareOffer(null);}} onKeyDown={event => {if(event.key === "Escape")setShareOffer(null);}}>
        <section className="modal admin-share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="modal-heading"><h2 id="share-title">Materiały do publikacji</h2><button type="button" autoFocus onClick={() => setShareOffer(null)} aria-label="Zamknij materiały"><X/></button></div>
          <OfferShare key={shareOffer.id} offer={shareOffer} expanded origin={window.location.origin}/>
        </section>
      </div>}
      {edit && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEdit(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
          >
            <div className="modal-heading">
              <h2 id="edit-title">Edytuj promocję</h2>
              <button onClick={() => setEdit(null)} aria-label="Zamknij edycję">
                <X />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await action({
                    action: "save",
                    offer: {
                      ...edit,
                      companySlug: edit.companySlug || slugify(edit.company),
                    },
                  })
                )
                  setEdit(null);
              }}
            >
              <div className="form-grid">
                <label className="field full">Meta title (opcjonalnie)
                  <input maxLength={120} value={edit.metaTitle || ""} onChange={(e) => field("metaTitle", e.target.value)} />
                </label>
                <label className="field full">Meta description (opcjonalnie)
                  <textarea maxLength={320} value={edit.metaDescription || ""} onChange={(e) => field("metaDescription", e.target.value)} />
                </label>
                <fieldset className="field full">
                  <legend>Pokaż w przewodniku</legend>
                  {Object.values(holiday).map((guide) => (
                    <label key={guide.slug}>
                      <input type="checkbox" checked={edit.guides?.includes(guide.slug) ?? false}
                        onChange={(event) => field("guides", event.target.checked
                          ? [...(edit.guides || []), guide.slug]
                          : (edit.guides || []).filter((slug) => slug !== guide.slug))} />
                      {" "}{guide.label}
                    </label>
                  ))}
                </fieldset>
                <label className="field">Typ wpisu
                  <select value={edit.guideKind || "offer"} onChange={(event) => field("guideKind", event.target.value)}>
                    <option value="offer">Promocja</option>
                    <option value="idea">Propozycja w regularnej cenie</option>
                  </select>
                </label>
                <label className="field">Zakup lub odbiór
                  <input maxLength={250} value={edit.fulfillment || ""} onChange={(event) => field("fulfillment", event.target.value)}
                    placeholder="Np. voucher PDF, odbiór do 23 grudnia" />
                </label>
                <label className="field full">
                  Tytuł *
                  <input
                    value={edit.title}
                    required
                    onChange={(e) => field("title", e.target.value)}
                  />
                </label>
                <label className="field">
                  Firma *
                  <input
                    list="local-companies"
                    required
                    value={edit.company}
                    onChange={(e) => {
                      const name = e.target.value;
                      const company = companies.find((c) => c.name === name);
                      setEdit((current) =>
                        current
                          ? {
                              ...current,
                              company: name,
                              companySlug: company?.slug || "",
                              ...(company
                                ? {
                                    category: company.category,
                                    address: company.address || current.address,
                                    source: company.website || current.source,
                                  }
                                : {}),
                            }
                          : current,
                      );
                    }}
                  />
                  <datalist id="local-companies">
                    {companies.map((c) => (
                      <option key={c.slug} value={c.name} />
                    ))}
                  </datalist>
                </label>
                <label className="field">
                  Rabat / korzyść *
                  <input
                    required
                    value={edit.badge}
                    onChange={(e) => field("badge", e.target.value)}
                    placeholder="−20%, GRATIS, od 49 zł"
                  />
                </label>
                <label className="field">
                  Kategoria
                  <select
                    value={edit.category}
                    onChange={(e) => field("category", e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field full">
                  Logo firmy — bezpośredni link HTTPS do oficjalnego logo
                  <input type="text" placeholder="https://strona-firmy.pl/logo.png" value={edit.logo || ""} onChange={(e) => field("logo", e.target.value)} />
                  <small>Bez własnego zdjęcia pokażemy logo. Jeśli go brakuje, pojawi się nazwa firmy.</small>
                </label>
                <label className="field">
                  Zdjęcie oferty (opcjonalne)
                  <select
                    value={photoName.test(edit.image) ? "custom" : edit.image}
                    onChange={(e) => field("image", e.target.value)}
                  >
                    {photoName.test(edit.image) && (
                      <option value="custom">Własne zdjęcie</option>
                    )}
                    {Object.entries({
                      pizza: "Pizza",
                      coffee: "Kawa",
                      pancakes: "Naleśniki",
                      beauty: "Beauty",
                      spa: "SPA",
                      gym: "Sport",
                      shopping: "Zakupy",
                      cinema: "Rozrywka",
                    }).map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="field full">
                  <img
                    src={offerPhoto(edit.image)}
                    alt="Podgląd zdjęcia oferty"
                    width={150}
                    height={100}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                  <label className="field">
                    {uploading
                      ? "Wysyłanie zdjęcia…"
                      : "Dodaj zdjęcie (JPG, PNG, WebP, do 3 MB)"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void uploadPhoto(file, edit.id);
                      }}
                    />
                  </label>
                </div>
                <label className="field full">
                  Krótki opis *
                  <input
                    required
                    value={edit.summary}
                    onChange={(e) => field("summary", e.target.value)}
                  />
                </label>
                <label className="field full">
                  Warunki *
                  <textarea
                    required
                    value={edit.conditions}
                    onChange={(e) => field("conditions", e.target.value)}
                  />
                </label>
                <label className="field">
                  Adres
                  <input
                    value={edit.address}
                    onChange={(e) => field("address", e.target.value)}
                  />
                </label>
                <label className="field">
                  Okolica
                  <input
                    value={edit.area}
                    onChange={(e) => field("area", e.target.value)}
                  />
                </label>
                <label className="field">
                  Data startu
                  <input
                    type="date"
                    value={edit.start}
                    onChange={(e) => field("start", e.target.value)}
                  />
                </label>
                <label className="field">
                  Data końca
                  <input
                    type="date"
                    value={edit.end}
                    min={edit.start || undefined}
                    onChange={(e) => field("end", e.target.value)}
                  />
                </label>
                <div className="field full">
                  Dni obowiązywania
                  <div className="day-picker">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={edit.days.includes(d) ? "active" : ""}
                        onClick={() =>
                          field(
                            "days",
                            edit.days.includes(d)
                              ? edit.days.filter((x) => x !== d)
                              : [...edit.days, d],
                          )
                        }
                      >
                        {["Ndz", "Pn", "Wt", "Śr", "Czw", "Pt", "Sob"][d]}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="field full">
                  Źródło *
                  <input
                    type="url"
                    required
                    value={edit.source}
                    onChange={(e) => field("source", e.target.value)}
                  />
                </label>
                <label className="field">
                  Adres podstrony
                  <input
                    value={edit.slug}
                    required
                    pattern="[a-z0-9-]+"
                    onChange={(e) => field("slug", slugify(e.target.value))}
                  />
                </label>
                <label className="field">
                  Ostatnie sprawdzenie
                  <input
                    type="date"
                    required
                    value={edit.verified}
                    onChange={(e) => field("verified", e.target.value)}
                  />
                </label>
                <label className="field">
                  Status
                  <select
                    value={edit.status}
                    onChange={(e) => field("status", e.target.value)}
                  >
                    <option value="draft">Szkic</option>
                    <option value="published">Opublikowana</option>
                    <option value="archived">Archiwum</option>
                  </select>
                </label>
                <label className="check-label" style={{ alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={edit.featured}
                    onChange={(e) => field("featured", e.target.checked)}
                  />{" "}
                  Wybór redakcji
                </label>
              </div>
              {message && (
                <div className="message" role="status">
                  {message}
                </div>
              )}
              <button className="button" disabled={busy || uploading}>
                {busy ? "Zapisywanie…" : "Zapisz promocję"}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

