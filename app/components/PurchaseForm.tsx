"use client";
import { useState, useEffect } from "react";
import { categories } from "../lib/data";
import { plans, PlanId } from "../lib/plans";
const initial = {
  company: "",
  title: "",
  summary: "",
  conditions: "",
  address: "",
  area: "Centrum",
  source: "",
  end: "",
  category: "jedzenie",
  days: [0, 1, 2, 3, 4, 5, 6],
  badge: "",
  plan: "standard" as PlanId,
  confirmed: false,
};
export default function PurchaseForm({ enabled }: { enabled: boolean }) {
  const [form, setForm] = useState(initial),
    [requestId, setRequestId] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let saved: any;
    try {
      saved = JSON.parse(sessionStorage.getItem("bnp-purchase") || "null");
    } catch {}
    if (saved?.form) setForm({ ...initial, ...saved.form, confirmed: false });
    setRequestId(saved?.requestId || crypto.randomUUID());
    const p = new URLSearchParams(location.search).get("pakiet");
    if (p === "standard" || p === "featured")
      setForm((f) => ({ ...f, plan: p }));
    if (new URLSearchParams(location.search).has("anulowano"))
      setMessage(
        "Płatność została przerwana. Możesz sprawdzić formularz i wrócić do Stripe.",
      );
  }, []);
  function field(k: string, value: any) {
    setForm((f) => ({ ...f, [k]: value }));
    setRequestId(crypto.randomUUID());
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!enabled) return;
    setBusy(true);
    setMessage("");
    try {
      sessionStorage.setItem(
        "bnp-purchase",
        JSON.stringify({ form, requestId }),
      );
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requestId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const url = new URL(d.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw new Error("Nieprawidłowy adres płatności.");
      location.assign(url.toString());
    } catch (e: any) {
      setMessage(e.message || "Nie udało się otworzyć płatności.");
      setBusy(false);
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      {!enabled && (
        <div className="message">
          Płatności nie są jeszcze aktywne. Formularz jest gotowy; uruchomienie
          wymaga konfiguracji opisanej w README.
        </div>
      )}
      <div className="plan-picker">
        {Object.values(plans).map((p) => (
          <label
            key={p.id}
            className={"plan-option " + (form.plan === p.id ? "selected" : "")}
          >
            <input
              type="radio"
              name="plan"
              checked={form.plan === p.id}
              onChange={() => field("plan", p.id)}
            />
            <span>
              <strong>{p.name}</strong>
              <small>Do 30 dni od zatwierdzenia</small>
            </span>
            <b>{p.amount / 100} zł</b>
          </label>
        ))}
      </div>
      <div className="form-grid">
        <label className="field">
          Nazwa firmy *
          <input
            required
            maxLength={150}
            value={form.company}
            onChange={(e) => field("company", e.target.value)}
          />
        </label>
        <label className="field">
          Kategoria
          <select
            value={form.category}
            onChange={(e) => field("category", e.target.value)}
          >
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field full">
          Tytuł promocji *
          <input
            required
            minLength={3}
            maxLength={200}
            placeholder="Np. −20% na pierwszą wizytę"
            value={form.title}
            onChange={(e) => field("title", e.target.value)}
          />
        </label>
        <label className="field">
          Rabat / korzyść *
          <input
            required
            maxLength={30}
            placeholder="Np. −20%, 2 za 1, GRATIS"
            value={form.badge}
            onChange={(e) => field("badge", e.target.value)}
          />
        </label>
        <label className="field">
          Data końca promocji
          <input
            type="date"
            value={form.end}
            onChange={(e) => field("end", e.target.value)}
          />
          <small>
            Publikacja trwa do 30 dni, maksymalnie do końca promocji.
          </small>
        </label>
        <label className="field full">
          Krótki opis *
          <input
            required
            maxLength={300}
            value={form.summary}
            onChange={(e) => field("summary", e.target.value)}
          />
        </label>
        <label className="field full">
          Dokładne warunki *
          <textarea
            required
            maxLength={4000}
            value={form.conditions}
            onChange={(e) => field("conditions", e.target.value)}
            placeholder="Dla kogo jest oferta? Czy wymagany jest kod lub minimalny zakup?"
          />
        </label>
        <label className="field">
          Adres w Białymstoku *
          <input
            required
            maxLength={200}
            value={form.address}
            onChange={(e) => field("address", e.target.value)}
          />
        </label>
        <label className="field">
          Okolica
          <input
            maxLength={100}
            value={form.area}
            onChange={(e) => field("area", e.target.value)}
          />
        </label>
        <label className="field full">
          Publiczny link do promocji *
          <input
            type="url"
            required
            value={form.source}
            maxLength={1000}
            onChange={(e) => field("source", e.target.value)}
          />
        </label>
        <div className="field full">
          Dni obowiązywania
          <div className="day-picker">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <button
                type="button"
                key={d}
                className={form.days.includes(d) ? "active" : ""}
                onClick={() =>
                  field(
                    "days",
                    form.days.includes(d)
                      ? form.days.filter((x) => x !== d)
                      : [...form.days, d],
                  )
                }
              >
                {["Ndz", "Pn", "Wt", "Śr", "Czw", "Pt", "Sob"][d]}
              </button>
            ))}
          </div>
        </div>
        <label className="check-label field full">
          <span>
            <input
              type="checkbox"
              required
              checked={form.confirmed}
              onChange={(e) => field("confirmed", e.target.checked)}
            />{" "}
            Akceptuję{" "}
            <a
              href="/warunki-publikacji"
              target="_blank"
              rel="noopener noreferrer"
            >
              warunki płatnej publikacji
            </a>
            , potwierdzam prawo do zgłoszenia oferty i rozumiem, że publikacja
            wymaga akceptacji redakcji.
          </span>
        </label>
      </div>
      <p className="form-note">
        Płatność jednorazowa. Bez automatycznego odnawiania. Dane do płatności i
        dokumentu sprzedaży podasz w Stripe. Jeśli odrzucimy ofertę, zlecimy
        pełny zwrot wpłaty.
      </p>
      {message && (
        <div className="message" role="alert">
          {message}
        </div>
      )}
      <button className="button" disabled={!enabled || busy || !requestId}>
        {busy
          ? "Otwieramy Stripe…"
          : `Przejdź do płatności — ${plans[form.plan].amount / 100} zł ↗`}
      </button>
    </form>
  );
}
