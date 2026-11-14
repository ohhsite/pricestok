"use client";
import { useState } from "react";
import type { Offer } from "../lib/data";
import { photoName } from "../lib/photos";
import { offerVisualAssets } from "../lib/offer-visual";
export default function OfferVisual({ offer }: { offer: Offer }) {
  const [failed, setFailed] = useState<string[]>([]);
  const { photo, logo } = offerVisualAssets(offer);
  if (photo && !failed.includes(photo)) return <img src={photo} alt={photoName.test(offer.image) ? offer.title + " — " + offer.company : "Zdjęcie firmy: " + offer.company} loading="lazy" onError={() => setFailed([...failed, photo])} />;
  return <div className={"offer-brand brand-" + offer.companySlug}>
    <span className="brand-location">BIAŁYSTOK · LOKALNA OKAZJA</span>
    {logo && !failed.includes(logo)
      ? <img className="brand-logo" src={logo} alt={"Logo " + offer.company} loading="lazy" onError={() => setFailed([...failed, logo])} />
      : <strong className="brand-name">{offer.company}</strong>}
    <span className="brand-caption">{offer.area}</span>
  </div>;
}
