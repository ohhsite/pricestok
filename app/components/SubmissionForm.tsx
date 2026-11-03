"use client";
import { useState, useEffect } from "react";
import { categories } from "../lib/data";
export default function SubmissionForm() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false);
  const [kind, setKind] = useState("offer");
  const [report, setReport] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setReport(params.get("zglos") || "");
    if (params.get("typ") === "firma") setKind("company");
    if (params.get("typ") === "reklama") setKind("ad");
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    setBusy(true);
    setMessage("");
    try {
      const d = Object.fromEntries(new FormData(f));
      const r = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...d,
          confirmed: d.confirmed === "on",
          report,
          kind,
        }),
      });
      const j: any = await r.json();
      if (!r.ok) throw new Error(j.error);
      setSuccess(true);
      f.reset();
    } catch (e: any) {
      setMessage(e.message || "Nie udało się wysłać zgłoszenia.");
    } finally {
      setBusy(false);
    }
  }
  return success ? (
    <div className="form-card">
      <div className="message">
        <strong>Dziękujemy! Zgłoszenie zapisane.</strong>
        <p>
          Zgłoszenie czeka na sprawdzenie przez redakcję. Samo zgłoszenie nie
          oznacza publikacji ani zamówienia płatnej usługi.
        </p>
      </div>
      <a className="button" href="/">
        Wróć do promocji
      </a>
    </div>
  ) : (
    <form className="form-card" onSubmit={submit}>
      {report && (
        <div className="message">Zgłaszasz zmianę w ofercie: {report}</div>
      )}
      <div className="form-grid">
        {!report && (
          <label className="field full">
            Co zgłaszasz?
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="offer">Promocję</option>
              <option value="company">Lokalną firmę</option>
              <option value="ad">Zapytanie o baner reklamowy</option>
            </select>
          </label>
        )}
        <label className="field">
          Nazwa firmy *
          <input
            name="company"
            required
            maxLength={120}
            placeholder="Np. Twoja Kawiarnia"
          />
        </label>
        <label className="field">
          Kategoria
          <select name="category">
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {kind === "offer" && (
          <label className="field full">
            Tytuł promocji lub zgłoszenia *
            <input
              name="title"
              required
              minLength={3}
              maxLength={200}
              placeholder="Np. Druga kawa za połowę ceny"
            />
          </label>
        )}
        <label className="field full">
          Link do oferty lub strony firmy *
          <input
            name="source"
            type="url"
            required
            maxLength={500}
            placeholder="https://…"
          />
        </label>
        <label className="field">
          Adres w Białymstoku
          <input name="address" maxLength={200} placeholder="Ulica i numer" />
        </label>
        {kind === "offer" && (
          <label className="field">
            Oferta ważna do
            <input type="date" name="end" />
          </label>
        )}
        {kind === "ad" && (
          <label className="field full">
            E-mail służbowy do kontaktu *
            <input name="contact" type="email" required maxLength={254} />
          </label>
        )}
        <label className="field full">
          {kind === "company"
            ? "Opis firmy"
            : kind === "ad"
              ? "Termin i szczegóły reklamy"
              : "Warunki i szczegóły"}
          <textarea
            name="conditions"
            maxLength={kind === "company" ? 2000 : 4000}
            placeholder={
              kind === "company"
                ? "Czym zajmuje się firma?"
                : kind === "ad"
                  ? "W jakim terminie chcesz wynająć baner? Jaką ofertę chcesz pokazać?"
                  : "Jaka jest korzyść i kiedy obowiązuje promocja?"
            }
          />
        </label>
        <label style={{ display: "none" }} aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} />
        </label>
        <label className="check-label field full">
          <span>
            <input name="confirmed" type="checkbox" required /> Potwierdzam
            zgodność zgłoszenia z publicznymi informacjami o firmie. Rozumiem,
            że redakcja sprawdzi treść przed publikacją.
          </span>
        </label>
      </div>
      <p className="form-note">
        Nie podawaj danych klientów.{" "}
        {kind === "ad"
          ? "E-mail wykorzystamy do kontaktu w sprawie banera."
          : "Kontakt do firmy sprawdzimy pod podanym linkiem."}{" "}
        Zgłoszenie jest bezpłatne.{" "}
        <a href="/zasady">Zasady publikacji i przetwarzania zgłoszeń →</a>
      </p>
      {message && (
        <div className="message error" role="alert">
          {message}
        </div>
      )}
      <button className="button" disabled={busy}>
        {busy ? "Wysyłanie…" : "Prześlij do sprawdzenia ↗"}
      </button>
    </form>
  );
}
