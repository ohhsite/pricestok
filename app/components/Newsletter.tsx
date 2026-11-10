"use client";
import { useState } from "react";
import { newsletterConsent } from "../lib/newsletter";
export default function Newsletter() {
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form=e.currentTarget, fields=new FormData(form);setBusy(true);setError("");
    try {const r=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fields.get('email'),consent:fields.get('consent')==='on',website:fields.get('website')})});const d=await r.json();if(!r.ok)throw Error(d.error);setDone(true);form.reset();}catch(e){setError((e as Error).message || 'Spróbuj ponownie.');}finally{setBusy(false);}
  }
  return <section className="newsletter container" id="newsletter" aria-labelledby="newsletter-title"><div><p className="eyebrow">CO SŁYCHAĆ W BIAŁYMSTOKU?</p><h2 id="newsletter-title">Nie przegap kolejnej fajnej imprezy.</h2><p>Wydarzenia, pomysły na wyjście i lokalne okazje prosto na Twój e-mail.</p></div><div>{done?<div className="newsletter-success" role="status"><strong>Dziękujemy za zapis!</strong><p>Jeśli adres jest już na liście, nie dodamy go drugi raz.</p><a href="mailto:kontakt@pricestok.pl?subject=Rezygnacja%20z%20newslettera">Chcesz zrezygnować? Napisz do nas.</a></div>:<form onSubmit={submit}><label className="newsletter-email-label" htmlFor="newsletter-email">Twój adres e-mail</label><div className="newsletter-fields"><input id="newsletter-email" type="email" name="email" autoComplete="email" required maxLength={254} placeholder="twoj@email.pl"/><button className="button" disabled={busy}>{busy?'Zapisuję…':'Zapisz mnie'}</button></div><div className="newsletter-trap" aria-hidden="true"><label>Strona internetowa<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="newsletter-consent"><input name="consent" type="checkbox" required/><span>{newsletterConsent} <a href="/polityka-prywatnosci">Polityka prywatności</a>.</span></label>{error&&<p className="message" role="alert">{error}</p>}</form>}</div></section>;
}
