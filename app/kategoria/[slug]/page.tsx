import { listOffers } from "../../lib/repository";
import { listCategories } from "../../lib/categories";
import { isActive } from "../../lib/data";
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
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();
  const topic = topics[slug] || category.name;
  const active = (await listOffers()).some((offer) =>
    isActive(offer) && (offer.category === slug ||
      categories.some((c) => c.id === offer.category && c.parent === slug)),
  );
  return {
    title: category.title || topic + " w Białymstoku",
    description: category.description || topic + " w Białymstoku. Sprawdź lokalne oferty na PriceStok.",
    alternates: { canonical: `/kategoria/${slug}` },
    robots: { index: active || !!category.content?.trim(), follow: true },
  };
}

export default async function Category({ params }: Props) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();
  return (
    <Catalog
      offers={await listOffers()}
      categories={categories}
      initialCategory={slug}
      pageTitle={(topics[slug] || category.name) + " w Białymstoku"}
      categoryContent={category.content}
    />
  );
}
