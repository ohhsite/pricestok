"use client";
import { useEffect, useState } from "react";
import { packages, type PackageId } from "../lib/packages";
import { categories as defaultCategories } from "../lib/data";
import type { Category } from "../lib/categories";
const money = (c: number) =>
  (c / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
const states: Record<string, string> = {
  active: "Opłacony",
  awaiting_payment: "Oczekuje na wpłatę",
  past_due: "Zaległa płatność",
  payment_failed: "Płatność nieudana",
  canceled: "Zakończony",
  incomplete: "Płatność nieukończona",
  incomplete_expired: "Płatność wygasła",
  unpaid: "Nieopłacony",
  paused: "Wstrzymany",
  expired: "Sesja wygasła",
  refund_pending: "Zwrot w trakcie",
  refunded: "Zwrócono wpłatę",
  disputed: "Spór płatniczy",
  fraud_review: "Weryfikacja bezpieczeństwa",
  rejected: "Odrzucony",
};
async function post(data: unknown) {
  const r = await fetch("/api/abonament", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Operacja nie powiodła się.");
  return d;
}
export default function Billing({
  enabled,
  vat,
  email,
  categories = defaultCategories,
}: {
  enabled: boolean;
  vat: number;
  email: string;
  categories?: Category[];
}) {
  const [plan, setPlan] = useState<PackageId>("oneoff"),
    [requestId, setRequestId] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState<any>(null),
    [credentials, setCredentials] = useState({ id: "", token: "" });
  useEffect(() => {
    setRequestId(crypto.randomUUID());
    const id = new URLSearchParams(location.search).get("order") || "";
    const token =
      new URLSearchParams(location.hash.slice(1)).get("token") ||
      sessionStorage.getItem("bnp-billing-" + id) ||
      "";
    if (id && token) {
      sessionStorage.setItem("bnp-billing-" + id, token);
      setCredentials({ id, token });
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (new URLSearchParams(location.search).has("anulowano"))
      setMessage("Zakup został przerwany. Nie aktywowano nowej usługi.");
  }, []);
  async function refresh() {
    if (!credentials.id) return;
    try {
      const r = await fetch(
        "/api/abonament?id=" +
          encodeURIComponent(credentials.id) +
          "&token=" +
          encodeURIComponent(credentials.token),
        { cache: "no-store" },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOrder(d);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  useEffect(() => {
    if (!credentials.id) return;
    refresh();
    const timer = setInterval(refresh, 5000),
      stop = setTimeout(() => clearInterval(timer), 60000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [credentials.id, credentials.token]);
  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const d = await post({
        ...fields,
        action: "buy",
        plan,
        requestId,
        confirmed: fields.confirmed === "on",
      });
      location.assign(d.url);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function portal() {
    setBusy(true);
    try {
      const d = await post({ action: "portal", ...credentials });
      location.assign(d.url);
    } catch (e) {
      setMessage((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}
      {credentials.id && (
        <section className="form-card">
          <h2>Twoje zamówienie</h2>
          <p>
            Zachowaj link do zarządzania:{" "}
            <a
              href={
                "/dla-firm?order=" +
                credentials.id +
                "#token=" +
                credentials.token
              }
            >
              otwórz lub skopiuj ten link
            </a>
            . Nie udostępniaj go innym osobom.
          </p>
          {order ? (
            <>
              <p>
                <strong>{states[order.state] || order.state}</strong> ·{" "}
                {order.approved
                  ? "Publikacja zatwierdzona"
                  : "Publikacja czeka na akceptację redakcji"}
              </p>
              {order.paidUntil && (
                <p>
                  Koniec okresu:{" "}
                  {new Date(order.paidUntil).toLocaleString("pl-PL")}.{" "}
                  {order.plan !== "monthly"
                    ? "Zakup jednorazowy — bez odnowienia."
                    : order.cancelAtEnd
                      ? "Odnowienie zostało wyłączone."
                      : "Abonament odnawia się co miesiąc."}
                </p>
              )}
              {order.approved && order.state === "active" && (
                <a
                  className="button outline"
                  href={
                    order.plan === "company"
                      ? "/wizytowka/" + order.id
                      : "/promocja/abonament-" + order.id
                  }
                >
                  Zobacz publikację ↗
                </a>
              )}
              {order.hasCustomer && (
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={portal}
                >
                  Płatności, faktury i anulowanie ↗
                </button>
              )}
            </>
          ) : (
            <p>Sprawdzamy status płatności…</p>
          )}
          <button type="button" className="button outline" onClick={refresh}>
            Odśwież status
          </button>
        </section>
      )}
      <div
        className="pricing-grid"
        style={{
          maxWidth: "none",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        }}
      >
        {Object.entries(packages).map(([id, p]) => {
          const features = id === "company"
            ? ["Osobny adres i link do Twojej strony", "Opis usług, adres i dane LocalBusiness", "Metadane i mapa witryny dla wyszukiwarek", "Aktualizacje opisu i danych przez redakcję"]
            : ["Jedna wyróżniona promocja z własną podstroną", "Korekty treści w cenie", id === "oneoff" ? "30 dni od akceptacji" : "Jedna wymiana promocji co 30 dni"];
          return (
          <button
            type="button"
            key={id}
            className="pricing-card"
            aria-pressed={plan === id}
            onClick={() => setPlan(id as PackageId)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              border: plan === id ? "2px solid #46623b" : "2px solid #deded4",
              background: plan === id ? "#eaf0db" : "#fff",
            }}
          >
            <h2>{p.name}</h2>
            <div className="price">
              {p.net / 100} zł{" "}
              <small style={{ fontSize: 15 }}>netto / {p.period}</small>
            </div>
            <p>
              {money(Math.round(p.net * (1 + vat / 100)))} do zapłaty
              {vat ? " (VAT 23%)" : " (sprzedawca zwolniony z VAT)"}
            </p>
            <ul>
              {features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <strong>{plan === id ? "✓ Wybrano" : "Wybierz pakiet ↗"}</strong>
          </button>
          );
        })}
      </div>
      <section className="form-card" id="zakup">
        <h2>Zamów usługę · {packages[plan].name}</h2>
        <p>Jedna płatność za cały okres, liczony od akceptacji redakcji. Korekty zgłosisz redakcji, podając numer zamówienia.</p>
        {!enabled && (
          <p className="message">
            Sprzedaż online nie jest jeszcze uruchomiona.{" "}
            {email && (
              <>
                Kontakt: <a href={"mailto:" + email}>{email}</a>.
              </>
            )}
          </p>
        )}
        <form onSubmit={buy}>
          <fieldset
            disabled={!enabled || busy}
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            <div className="form-grid">
              <label className="field">
                Nazwa firmy *<input name="company" required maxLength={120} />
              </label>
              <label className="field">
                Polski NIP *
                <input
                  name="nip"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </label>
              <label className="field">
                E-mail do kontaktu *
                <input name="email" type="email" required maxLength={254} />
              </label>
              <label className="field">
                Kategoria *
                <select name="category">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field full">
                {plan !== "company" ? "Tytuł promocji" : "Nagłówek podstrony"} *
                <input name="title" required maxLength={140} />
              </label>
              <label className="field full">
                Krótki opis *<input name="summary" required maxLength={300} />
              </label>
              <label className="field full">
                {plan !== "company"
                  ? "Warunki promocji i korzyść dla klienta"
                  : "Opis działalności, usług i oferty firmy"}{" "}
                *<textarea name="conditions" required maxLength={4000} />
              </label>
              <label className="field">
                Adres w Białymstoku *
                <input name="address" required maxLength={200} />
              </label>
              <label className="field">
                Link do strony lub rezerwacji *
                <input name="source" type="url" required maxLength={1000} />
              </label>
              {plan !== "company" && <label className="field">
                Koniec promocji (opcjonalnie)
                <input name="end" type="date" />
              </label>}
              <label className="check-label full">
                <span>
                  <input name="confirmed" type="checkbox" required /> Kupuję
                  jako firma i akceptuję{" "}
                  <a
                    href="/warunki-publikacji"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    warunki publikacji
                  </a>
                  .{" "}
                  {packages[plan].name} · {packages[plan].net / 100} zł netto · płatność jednorazowa bez automatycznego odnowienia.

                </span>
              </label>
            </div>
            <button className="button" disabled={busy || !requestId}>
              {busy ? "Przekierowanie…" : "Zamawiam i płacę ↗"}
            </button>
          </fieldset>
        </form>
        <p className="form-note">
          Bezpieczna płatność przez Stripe. Przy odrzuceniu publikacji zwracamy
          wpłatę. Widoczność w Google i odpowiedziach AI zależy od tych usług.
        </p>
      </section>
    </>
  );
}
export function BillingAdmin({ categories = defaultCategories }: { categories?: Category[] }) {
  const [orders, setOrders] = useState<any[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch("/api/abonament?admin=1", { cache: "no-store" });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d)
        throw new Error(
          d?.error ||
            (r.status === 403
              ? "Sesja wygasła. Zaloguj się ponownie."
              : "Nie udało się odczytać zamówień."),
        );
      setOrders(d.orders || []);
      setMessage("");
    } catch (error) {
      setMessage((error as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function action(id: string, action: string) {
    if (
      action === "reject" &&
      !confirm(
        "Odrzucić publikację i zwrócić ostatnią wpłatę?",
      )
    )
      return;
    setBusy(true);
    try {
      await post({ id, action });
      setMessage("Zapisano.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="detail-long">
      <h2>Zamówienia, płatności i publikacje</h2>
      <button className="button outline" onClick={load}>
        Odśwież
      </button>
      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}
      {!message && orders.length === 0 && <p>Brak zamówień w nowym cenniku.</p>}
      {orders.map((o) => (
        <article className="detail-box" key={o.id}>
          <h3>
            {o.payload.company} ·{" "}
            {o.plan === "monthly" ? "Abonament archiwalny" : packages[o.plan as PackageId]?.name}
          </h3>
          <p>
            {money(o.net)} netto / {money(o.amount)} brutto ·{" "}
            {states[o.state] || o.state} ·{" "}
            {o.approved ? "Zatwierdzono" : "Do weryfikacji"}
          </p>
          <p>
            {o.payload.title} — {o.payload.summary}
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{o.payload.conditions}</p>
          <p>
            {o.payload.address} · NIP {o.payload.nip} ·{" "}
            <a href={"mailto:" + o.payload.email}>{o.payload.email}</a> ·{" "}
            <a
              href={o.payload.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Źródło ↗
            </a>
          </p>
          {o.paid_until && (
            <p>
              Opłacony do: {new Date(o.paid_until).toLocaleString("pl-PL")}
              {o.cancel_at_end ? " · Odnowienie wyłączone" : ""}
            </p>
          )}
          <button
            className="button outline"
            disabled={busy}
            onClick={() => action(o.id, "refresh")}
          >
            Sprawdź w Stripe
          </button>
          {!o.approved && o.state === "active" && (
            <button
              className="button"
              disabled={busy}
              onClick={() => action(o.id, "approve")}
            >
              Zatwierdź publikację
            </button>
          )}
          {!o.approved && ["active", "refund_pending"].includes(o.state) && (
            <button
              className="button outline"
              disabled={busy}
              onClick={() => action(o.id, "reject")}
            >
              Odrzuć i zwróć wpłatę
            </button>
          )}
          {o.approved && !o.blocked && o.state === "active" && o.plan !== "monthly" &&
            (Date.parse(o.paid_until) > Date.now() || (o.plan === "company" && o.net === 20000)) && (
            <details>
              <summary>Edytuj treść publikacji</summary>
              <form onSubmit={async (event) => {
                event.preventDefault();
                const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
                const fields = Object.fromEntries(new FormData(event.currentTarget));
                setBusy(true);
                try {
                  await post({ ...fields, id: o.id, action: submitter?.value || "edit" });
                  await load();
                } catch (error) {
                  setMessage((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}>
                <div className="form-grid">
                  {([["company", "Firma", 120], ["title", "Tytuł", 140], ["summary", "Krótki opis", 300],
                    ["address", "Adres", 200], ["source", "Link", 1000]] as const).map(([key, label, max]) => (
                    <label className="field" key={key}>{label}
                      <input name={key} type={key === "source" ? "url" : "text"} defaultValue={o.payload[key]} required maxLength={max} />
                    </label>
                  ))}
                  <label className="field">Kategoria
                    <select name="category" defaultValue={o.payload.category}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </label>
                  <label className="field full">Pełny opis
                    <textarea name="conditions" defaultValue={o.payload.conditions} required maxLength={4000} />
                  </label>
                  {o.plan !== "company" && <label className="field">Koniec promocji
                    <input name="end" type="date" defaultValue={o.payload.end} />
                  </label>}
                </div>
                <button className="button outline" disabled={busy} value="edit">Zapisz korektę</button>
                {["quarter", "halfyear", "year"].includes(o.plan) &&
                  <button className="button" disabled={busy} value="replace">Wymień promocję</button>}
              </form>
            </details>
          )}
          {o.approved && (
            <a
              className="button outline"
              href={
                o.plan === "company"
                  ? "/wizytowka/" + o.id
                  : "/promocja/abonament-" + o.id
              }
            >
              Publikacja ↗
            </a>
          )}
        </article>
      ))}
    </section>
  );
}
