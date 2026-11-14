"use client";

import { useId, useState } from "react";
import type { Offer } from "../lib/data";
import { shareGraphic, shareLink, sharePost } from "../lib/share";
import { trackEvent } from "../lib/analytics";

export default function OfferShare({ offer, origin, expanded = false }: {
  offer: Offer;
  origin: string;
  expanded?: boolean;
}) {
  const [company, setCompany] = useState(false);
  const [status, setStatus] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const postId = useId();
  const linkId = useId();
  const url = shareLink(origin, offer.slug, company);
  const sharer = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(new URL(new URL(url).pathname, origin).href);
  const graphic = shareGraphic(offer.slug);
  const downloadUrl = graphic + "&download=1";
  const post = sharePost(offer, url, company);

  function track(event: string, companyVersion = company) {
    trackEvent(event, { offer_id: offer.id, company_slug: offer.companySlug, material_audience: companyVersion ? "company" : "residents" });
  }

  async function copy(value: string, event: "copy_link" | "copy_post", downloading = false) {
    const field = document.getElementById(event === "copy_link" ? linkId : postId) as HTMLInputElement | HTMLTextAreaElement | null;
    try {
      await navigator.clipboard.writeText(value);
      track(event);
      setStatus(downloading
        ? "Tekst skopiowany. Po pobraniu PNG otwórz kreator, wklej tekst i dodaj zdjęcie."
        : event === "copy_link" ? "Link skopiowany." : "Tekst skopiowany. Wklej go w treści posta na Facebooku.");
    } catch {
      if (field) {
        if (field.closest("details")) field.closest("details")!.open = true;
        field.focus();
        field.select();
      }
      setStatus("Skopiuj zaznaczony tekst ręcznie.");
    }
  }

  return (
    <section className="offer-share detail-long">
      <h2>{expanded ? "Przygotuj post na Facebooka" : offer.kind === "event" ? "Udostępnij wydarzenie" : "Udostępnij okazję"}</h2>
      {!expanded && <div className="share-actions">
        <a className="button" href={sharer} target="_blank" rel="noopener noreferrer" onClick={() => track("share_facebook")}>Udostępnij link na Facebooku ↗</a>
        <button type="button" className="button secondary" onClick={() => copy(url, "copy_link")}>Kopiuj link</button>
      </div>}
      {expanded && <div className="share-actions">
        <a className="button" href={downloadUrl} download onClick={() => {
          void copy(post, "copy_post", true);
          track("download_image");
        }}>Kopiuj tekst i pobierz PNG</a>
        <a className="button secondary" href="https://business.facebook.com/latest/composer/" target="_blank" rel="noopener noreferrer">Otwórz kreator w Meta ↗</a>
      </div>}
      <details open={expanded || undefined}>
        <summary>Tekst i grafika do własnego posta</summary>
        <p>Skopiuj tekst i pobierz grafikę. Na Facebooku utwórz post, wklej tekst i dodaj pobrany obraz jako zdjęcie.</p>
        <div className="share-modes" role="group" aria-label="Wersja materiałów">
          <button type="button" aria-pressed={!company} onClick={() => { setCompany(false); setStatus(""); }}>Dla mieszkańców</button>
          <button type="button" aria-pressed={company} onClick={() => { setCompany(true); setStatus(""); track("company_materials_open", true); }}>Dla firmy</button>
        </div>
        <label htmlFor={postId}>Tekst do publikacji</label>
        <textarea id={postId} value={post} readOnly rows={7} />
        <div className="share-actions">
          <button type="button" className="button" onClick={() => copy(post, "copy_post")}>Kopiuj tekst</button>
          <a className="button secondary" href={downloadUrl} download onClick={() => track("download_image")}>Pobierz PNG</a>
        </div>
        {imageFailed
          ? <p role="alert">Podgląd grafiki jest chwilowo niedostępny. <button type="button" onClick={() => setImageFailed(false)}>Spróbuj ponownie</button></p>
          : <img className="share-preview" src={graphic} alt={"Grafika do udostępnienia: " + offer.title} width={1200} height={630} loading="lazy" onError={() => setImageFailed(true)} />}
        <label htmlFor={linkId}>Link do oferty</label>
        <input id={linkId} className="share-link" value={url} readOnly />
      </details>
      <p role="status" aria-live="polite">{status}</p>
    </section>
  );
}
