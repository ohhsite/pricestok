"use client";
import { useState } from "react";
import type { Offer } from "../lib/data";
import { offerPhoto, photoName } from "../lib/photos";

import { brands } from "../lib/brands";
export default function OfferVisual({ offer }: { offer: Offer }) {
  const [failed, setFailed] = useState<string[]>([]);
  const companyPhotos: Record<string, string> = { "boska-studio-urody": "boska-studio-urody.jpeg", "nail-concept": "nail-concept.jpeg", "salon-pieknosci-ds": "salon-pieknosci-ds.jpeg" };
  const photo = photoName.test(offer.image) ? offerPhoto(offer.image) : companyPhotos[offer.companySlug] ? "/brands/" + companyPhotos[offer.companySlug] : "";
  const logo = offer.logo || (brands[offer.companySlug] ? "/brands/" + brands[offer.companySlug] : "");
  if (photo && !failed.includes(photo)) return <img src={photo} alt={photoName.test(offer.image) ? offer.title + " — " + offer.company : "Zdjęcie firmy: " + offer.company} loading="lazy" onError={() => setFailed([...failed, photo])} />;
  return <div className={"offer-brand brand-" + offer.companySlug}>
    <span className="brand-location">BIAŁYSTOK · LOKALNA OKAZJA</span>
    {logo && !failed.includes(logo)
      ? <img className="brand-logo" src={logo} alt={"Logo " + offer.company} loading="lazy" onError={() => setFailed([...failed, logo])} />
      : <strong className="brand-name">{offer.company}</strong>}
    <span className="brand-caption">{offer.area}</span>
  </div>;
}
