import WeekendGuide from "../components/WeekendGuide";
import { weekendPath } from "../lib/weekend";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Weekend w Białymstoku 21–22 listopada 2026 — wydarzenia i atrakcje",
  description: "21 wydarzeń w 6 kategoriach: rodzinne atrakcje, warsztaty, koncerty, teatr, taniec, zwiedzanie i sport. Terminy, ceny i linki do organizatorów.",
  alternates: { canonical: weekendPath },
  openGraph: { title: "Weekend w Białymstoku: 21–22 listopada 2026", images: ["/weekend-2026-11-21/dzieci.webp"] },
};
export default function Weekend() { return <WeekendGuide />; }
