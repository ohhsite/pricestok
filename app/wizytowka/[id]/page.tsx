import { notFound } from "next/navigation";
import { Header, Footer } from "../../components/Shell";
import { publicCompany } from "../../lib/billing";
import { siteUrl } from "../../lib/config";
export const dynamic = "force-dynamic";
async function profile(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  return publicCompany(id);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await profile(id);
  return {
    title: p ? `${p.company} — Białystok` : "Firma",
    description: p?.summary,
    alternates: { canonical: "/wizytowka/" + id },
    robots: { index: !!p, follow: true },
  };
}
export default async function Company({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    p = await profile(id);
  if (!p) notFound();
  return (
    <>
      <Header />
      <main className="container inner-main">
        <div className="breadcrumbs">
          <a href="/">Strona główna</a> / Firmy / {p.company}
        </div>
        <div className="eyebrow">LOKALNA FIRMA · MATERIAŁ SPONSOROWANY</div>
        <h1 className="page-title">{p.company}</h1>
        <p className="lead">{p.summary}</p>
        <section className="detail-long">
          <h2>{p.title}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{p.conditions}</p>
          <p>{p.address} · Białystok</p>
          <a
            className="button"
            href={p.source}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            Odwiedź stronę firmy ↗
          </a>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: p.company,
              description: p.summary,
              url: siteUrl() + "/wizytowka/" + id,
              address: {
                "@type": "PostalAddress",
                streetAddress: p.address,
                addressLocality: "Białystok",
                addressCountry: "PL",
              },
            }).replace(/</g, "\\u003c"),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
