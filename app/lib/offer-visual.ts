import { brands } from "./brands";
import type { Offer } from "./data";
import { offerPhoto, photoName } from "./photos";

const companyPhotos: Record<string, string> = {
  "boska-studio-urody": "boska-studio-urody.jpeg",
  "nail-concept": "nail-concept.jpeg",
  "salon-pieknosci-ds": "salon-pieknosci-ds.jpeg",
};

export function offerVisualAssets(offer: Offer) {
  const companyPhoto = companyPhotos[offer.companySlug];
  const brand = brands[offer.companySlug];
  const artwork = offer.kind === "event" && offer.companySlug !== "polish-champs" ? offer.logo || "" : "";
  return {
    artwork,
    photo: photoName.test(offer.image) ? offerPhoto(offer.image) : companyPhoto ? "/brands/" + companyPhoto : "",
    logo: offer.logo === "https://a.storyblok.com/f/291574107277460/162x48/ec2a983fa8/logo-dark.png"
      ? "/brands/jumper-park.png"
      : offer.logo || (brand ? "/brands/" + brand : ""),
  };
}
