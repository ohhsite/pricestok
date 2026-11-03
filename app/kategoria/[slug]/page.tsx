import { listOffers } from "../../lib/repository";
import { categories, isActive } from "../../lib/data";
import Catalog from "../../components/Catalog";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
const topics: Record<string, string> = {
  jedzenie: "Promocje na jedzenie i restauracje",
  beauty: "Promocje beauty, fryzjer i kosmetyka",
  "sport-i-relaks": "Promocje na sport, fitness i relaks",
  rozrywka: "Promocje na rozrywkę i atrakcje",
  zakupy: "Promocje na zakupy i rabaty w sklepach",
  uslugi: "Promocje na usługi lokalne",
  "dla-dzieci": "Promocje i atrakcje dla dzieci",
};
export async function generateMetadata({ params }: any) {
  const { slug } = await params;
  if (!categories.some((category) => category.id === slug)) notFound();
  const active = (await listOffers()).some(
    (offer) => offer.category === slug && isActive(offer),
  );
  return {
    title: topics[slug] + " w Białymstoku",
    description:
      topics[slug] +
      " w Białymstoku. Zobacz lokalne oferty, warunki, adresy i daty ważności na PriceStok.",
    alternates: { canonical: `/kategoria/${slug}` },
    robots: { index: active, follow: true },
  };
}
export default async function Category({ params }: any) {
  const { slug } = await params;
  if (!categories.some((c) => c.id === slug)) notFound();
  return (
    <Catalog
      offers={await listOffers()}
      initialCategory={slug}
      pageTitle={topics[slug] + " w Białymstoku"}
    />
  );
}
