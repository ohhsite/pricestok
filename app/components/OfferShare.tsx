"use client";
import {useState} from "react";
import type {Offer} from "../lib/data";
import {shareLink,sharePost} from "../lib/share";
import {trackEvent} from "../lib/analytics";
export default function OfferShare({offer,origin}:{offer:Offer;origin:string}){
 const [company,setCompany]=useState(false);const [status,setStatus]=useState("");
 const url=shareLink(origin,offer.slug,company);const text=sharePost(offer,url,company);
 const graphic="/api/share/"+encodeURIComponent(offer.slug);
 function track(event:string){trackEvent(event,{offer_id:offer.id,company_slug:offer.companySlug,material_audience:company?"company":"residents"});}
 async function copy(value:string,event:string){try{await navigator.clipboard.writeText(value);track(event);setStatus(event==="copy_link"?"Link skopiowany.":"Tekst skopiowany.");}catch{setStatus("Zaznacz i skopiuj tekst z pola poniżej.");}}
 return <section className="offer-share detail-long"><div className="eyebrow">PODAJ DALEJ LOKALNĄ OKAZJĘ</div><h2>Udostępnij tę ofertę</h2><p>Wyślij znajomym albo opublikuj na Facebooku.</p><div className="share-actions"><a className="button" href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url)} target="_blank" rel="noopener noreferrer" onClick={()=>track("share_facebook")}>Udostępnij na Facebooku ↗</a><button className="button secondary" onClick={()=>copy(url,"copy_link")}>Kopiuj link</button></div><details><summary>Gotowy tekst i grafika — również dla firmy</summary><div className="share-modes" role="group" aria-label="Wersja materiałów"><button aria-pressed={!company} onClick={()=>{setCompany(false);setStatus("");}}>Dla mieszkańców</button><button aria-pressed={company} onClick={()=>{setCompany(true);setStatus("");track("company_materials_open");}}>Dla firmy</button></div><label htmlFor="share-post">Tekst do publikacji</label><textarea id="share-post" value={text} readOnly rows={10}/><div className="share-actions"><button className="button" onClick={()=>copy(text,"copy_post")}>Kopiuj tekst posta</button><a className="button secondary" href={graphic+"?download=1"} download onClick={()=>track("download_image")}>Pobierz grafikę</a></div><img className="share-preview" src={graphic} alt={"Grafika do udostępnienia: "+offer.title} loading="lazy"/><p className="muted">Przed publikacją potwierdź aktualność oferty i jej warunki.</p></details><p role="status" aria-live="polite">{status}</p></section>;
}
