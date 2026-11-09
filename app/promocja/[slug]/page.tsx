import { siteUrl } from "../../lib/config";
import OfferVisual from "../../components/OfferVisual";
import { notFound } from "next/navigation";
import { Header, Footer } from "../../components/Shell";
import { listOffers } from "../../lib/repository";
import { categories, isActive, dateLabel, Offer } from "../../lib/data";
import { ArrowUpRight, MapPin, CalendarDays, Check } from "lucide-react";
import TrackView from "../../components/TrackView";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: any) {
  const { slug } = await params;
  const o = (await listOffers()).find((o) => o.slug === slug);
  return {
    title: o ? `${o.title} — ${o.company}, Białystok` : "Oferta niedostępna",
    description: o
      ? `${o.company}: ${o.summary} ${o.address}, Białystok. ${o.end ? "Do " + dateLabel(o.end) + "." : "Sprawdź dni i warunki."}`
      : undefined,
    alternates: { canonical: `/promocja/${slug}` },
    openGraph: { title: o ? `${o.title} — ${o.company}, Białystok` : "Oferta niedostępna", description: o?.summary, url: `/promocja/${slug}` },
    robots:
      o && isActive(o)
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}
export default async function Detail({ params }: any) {
  const { slug } = await params;
  const offers = await listOffers();
  const o = offers.find((o) => o.slug === slug);
  if (!o || o.status !== "published") notFound();
  const cat = categories.find((c) => c.id === o.category);
  const active = isActive(o);
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Promocje Białystok",
                item: siteUrl() + "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: cat?.name,
                item: siteUrl() + "/kategoria/" + o.category,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: o.title,
                item: siteUrl() + "/promocja/" + o.slug,
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <TrackView id={o.id} />
      <main className="container inner-main">
        <nav className="breadcrumbs">
          <a href="/">Strona główna</a> /{" "}
          <a href={"/kategoria/" + o.category}>{cat?.name}</a> /{" "}
          <span>{o.company}</span>
        </nav>
        <div className="detail-grid">
          <div className="detail-image">
            <OfferVisual offer={o} />
            <span className="discount">{o.badge}</span>
          </div>
          <div className="detail-content">
            <div className="eyebrow">
              {cat?.name} · BIAŁYSTOK{o.sponsored ? " · SPONSOROWANE" : ""}
            </div>
            <h1>{o.title}</h1>
            <a className="company" href={"/firma/" + o.companySlug}>
              {o.company} ↗
            </a>
            <p>{o.summary}</p>
            {o.price && <strong className="offer-price detail-price">{o.price}</strong>}
            {!active && (
              <div className="message error">
                Ta promocja już się zakończyła lub jeszcze nie wystartowała.
                Sprawdź inne aktualne okazje.
              </div>
            )}
            <div className="detail-box">
              <div>
                <MapPin size={15} />
                {o.address}
              </div>
              <div>
                <CalendarDays size={15} />
                {o.end ? "Do " + dateLabel(o.end) : "Bez podanej daty końcowej"}
              </div>
              <p>
                {o.days.length === 7
                  ? "Wszystkie dni tygodnia"
                  : o.days
                      .map(
                        (d) =>
                          [
                            "Niedziela",
                            "Poniedziałek",
                            "Wtorek",
                            "Środa",
                            "Czwartek",
                            "Piątek",
                            "Sobota",
                          ][d],
                      )
                      .join(", ")}{" "}
                · {o.area}
              </p>
            </div>
            {active ? (
              <a
                className="button"
                href={"/api/out?id=" + encodeURIComponent(o.id)}
                target="_blank"
                rel={
                  o.sponsored
                    ? "sponsored noopener noreferrer"
                    : "noopener noreferrer"
                }
              >
                Sprawdź ofertę u firmy <ArrowUpRight size={17} />
              </a>
            ) : (
              <a className="button" href="/#okazje">
                Zobacz aktualne promocje
              </a>
            )}
            <div className="detail-source">
              <Check size={12} style={{ display: "inline" }} /> Sprawdzono
              stronę źródłową: {dateLabel(o.verified)} {o.verified.slice(0, 4)}
              <br />
              <a
                href={o.source}
                target="_blank"
                rel={
                  o.sponsored
                    ? "sponsored noopener noreferrer"
                    : "noopener noreferrer"
                }
              >
                Źródło informacji o promocji ↗
              </a>
            </div>
          </div>
        </div>
        <section className="detail-long">
          <h2>Warunki promocji w {o.company}</h2>
          <p style={{ whiteSpace: "pre-line" }}>{o.conditions.replaceAll("\\n", "\n")}</p>
          <div className="detail-box">
            <strong>Przed skorzystaniem sprawdź dostępność</strong>
            <p>
              Podajemy informacje ze strony firmy lub organizatora. Warunki mogą
              się zmienić, a brak daty końcowej nie oznacza bezterminowej
              gwarancji. Ceny i dostępność potwierdź u organizatora.
            </p>
          </div>
          <a className="text-link" href={"/dodaj-promocje?zglos=" + o.slug}>
            Zgłoś zmianę lub nieaktualną ofertę →
          </a>
        </section>
        <section className="detail-long">
          <h2>Więcej lokalnych okazji</h2>
          {offers.filter((other) => other.id !== o.id && other.category === o.category && isActive(other)).slice(0, 3).map((other) => (
            <a key={other.id} className="detail-box" style={{ display: "block" }} href={"/promocja/" + other.slug}><strong>{other.title}</strong><p>{other.company} · {other.address}</p></a>
          ))}
          <a className="text-link" href={"/kategoria/" + o.category}>Wszystkie okazje: {cat?.name} →</a>
        </section>
      </main>
      <Footer />
    </>
  );
}

