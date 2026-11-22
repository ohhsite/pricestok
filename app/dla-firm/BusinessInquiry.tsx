"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import styles from "./business.module.css";

const categories = [
  ["jedzenie", "Gastronomia"],
  ["beauty", "Beauty"],
  ["sport-i-relaks", "Sport i relaks"],
  ["rozrywka", "Rozrywka / wydarzenia"],
  ["zakupy", "Handel"],
  ["uslugi", "Usługi / pozostałe"],
  ["dla-dzieci", "Dla dzieci"],
] as const;

export default function BusinessInquiry() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "campaign",
          company: values.company,
          contact: values.contact,
          phone: values.phone,
          category: values.category,
          source: values.source,
          objective: values.objective,
          budget: values.budget,
          conditions: values.conditions,
          confirmed: values.confirmed === "on",
          website: values.website,
        }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Nie udało się wysłać zgłoszenia.");
      setDone(true);
      form.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Nie udało się wysłać zgłoszenia.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className={styles.inquiryForm} role="status">
        <CheckCircle2 size={36} className={styles.successIcon} aria-hidden="true" />
        <h3>Dziękujemy za wiadomość!</h3>
        <p>Otrzymaliśmy zapytanie. Skontaktujemy się w sprawie propozycji reklamy. Wysłanie formularza nie jest zamówieniem płatnej usługi.</p>
        <button className={styles.formSubmit} onClick={() => setDone(false)} type="button">
          Wyślij kolejne zapytanie <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form className={styles.inquiryForm} onSubmit={submit}>
      <h3>Zapytaj o reklamę</h3>
      <p className={styles.formIntro}>Zostaw krótki opis. Przygotujemy propozycję dopasowaną do Twojej firmy.</p>
      <div className={styles.formFields}>
        <label>
          Nazwa firmy <span aria-hidden="true">*</span>
          <input name="company" required minLength={2} maxLength={120} placeholder="Nazwa Twojej firmy" autoComplete="organization" />
        </label>
        <label>
          E-mail służbowy <span aria-hidden="true">*</span>
          <input name="contact" type="email" required maxLength={254} placeholder="kontakt@twojafirma.pl" autoComplete="email" />
        </label>
        <label>
          Telefon (opcjonalnie)
          <input name="phone" type="tel" maxLength={40} placeholder="+48 000 000 000" autoComplete="tel" />
        </label>
        <label>
          Branża <span aria-hidden="true">*</span>
          <select name="category" defaultValue="" required>
            <option value="" disabled>Wybierz branżę</option>
            {categories.map(([id, title]) => <option value={id} key={id}>{title}</option>)}
          </select>
        </label>
        <label className={styles.fieldWide}>
          Strona firmy (opcjonalnie)
          <input name="source" type="url" maxLength={500} placeholder="https://twojafirma.pl" />
        </label>
        <label>
          Co chcesz osiągnąć?
          <select name="objective" defaultValue="zapytania">
            <option value="zapytania">Więcej zapytań od klientów</option>
            <option value="ruch">Więcej wejść na stronę</option>
            <option value="oferta">Promocja konkretnej oferty</option>
            <option value="wizerunek">Rozpoznawalność marki</option>
            <option value="nie-wiem">Potrzebuję doradztwa</option>
          </select>
        </label>
        <label>
          Budżet reklamowy miesięcznie
          <select name="budget" defaultValue="nie-wiem">
            <option value="nie-wiem">Jeszcze nie wiem</option>
            <option value="do-500">Do 500 zł</option>
            <option value="500-1500">500–1500 zł</option>
            <option value="1500-3000">1500–3000 zł</option>
            <option value="powyzej-3000">Powyżej 3000 zł</option>
          </select>
        </label>
        <label className={styles.fieldWide}>
          Co chcesz reklamować?
          <textarea name="conditions" maxLength={2000} rows={4} placeholder="Np. otwarcie salonu, wyprzedaż, nowa usługa, konkretne mieszkanie lub samochód" />
        </label>
      </div>
      <div className={styles.formTrap} aria-hidden="true">
        <label>Nie wypełniaj tego pola<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className={styles.formConsent}>
        <input name="confirmed" type="checkbox" required />
        <span>Podaję dane służbowe i proszę o kontakt wyłącznie w sprawie tego zapytania. Zapoznałem(-am) się z <a href="/polityka-prywatnosci">informacjami o prywatności</a>. <b aria-hidden="true">*</b></span>
      </label>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button type="submit" className={styles.formSubmit} disabled={busy}>
        {busy ? <><LoaderCircle size={17} aria-hidden="true" /> Wysyłanie…</> : <>Wyślij zapytanie <ArrowRight size={17} aria-hidden="true" /></>}
      </button>
      <small className={styles.formFinePrint}>Bez opłat za wysłanie zapytania. Współpracę i budżet reklamowy uzgadniamy osobno.</small>
    </form>
  );
}
