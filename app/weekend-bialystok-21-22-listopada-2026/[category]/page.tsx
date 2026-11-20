import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WeekendGuide from "../../components/WeekendGuide";
import { weekendGroups } from "../../lib/weekend";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ category: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const group = weekendGroups.find((group) => group.id === category);
  if (!group) return { title: "Nie znaleziono kategorii", robots: { index: false } };
  const title = group.name + " — weekend w Białymstoku 21–22 listopada 2026";
  return { title, description: group.intro, alternates: { canonical: group.path }, openGraph: { title, description: group.intro, url: group.path, images: [{ url: group.image, width: 1254, height: 1254, alt: title }] }, twitter: { card: "summary_large_image", title, description: group.intro, images: [group.image] } };
}
export default async function WeekendCategory({ params }: Props) {
  const { category } = await params;
  if (!weekendGroups.some((group) => group.id === category)) notFound();
  return <WeekendGuide category={category} />;
}
