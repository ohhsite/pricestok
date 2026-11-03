import { notFound } from "next/navigation";
import { Header, Footer } from "../../components/Shell";
import { listOffers } from "../../lib/repository";
import { isActive } from "../../lib/data";
import { listCompanies } from "../../lib/companies";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: any) {
  const { slug } = await params;
  const o = (await listOffers()).find((o) => o.companySlug === slug);
  const company = (await listCompanies().catch(() => [])).find(
    (c) => c.slug === slug,
  );
  return {
    title: `${company?.name || o?.company || "Firma"} — Białystok`,
    alternates: { canonical: `/firma/${slug}` },
  };
}
export default async function Company({ params }: any) {
  const { slug } = await params;
  const offers = (await listOffers()).filter(
    (o) => o.companySlug === slug && isActive(o),
  );
  const company = (await listCompanies().catch(() => [])).find(
    (c) => c.slug === slug,
  );
  if (!offers.length && !company) notFound();
  const name = company?.name || offers[0].company;
  return (
    <>
      <Header />
      <main className="container inner-main">
        <div className="breadcrumbs">
          <a href="/">Strona główna</a> / <a href="/firmy">Firmy</a> / {name}
        </div>
        <div className="eyebrow">LOKALNE MIEJSCA</div>
        <h1 className="page-title">{name}</h1>
        <p className="lead">
          {company?.address || offers[0]?.address || ""} · Białystok
        </p>
        {company?.description && <p>{company.description}</p>}
        {company?.website && (
          <a
            className="text-link"
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            Strona firmy ↗
          </a>
        )}
        <div className="detail-long">
          <h2>Aktualne promocje</h2>
          {!offers.length && <p>Firma nie ma obecnie aktywnych promocji.</p>}
          {offers.map((o) => (
            <a
              className="detail-box"
              style={{ display: "block" }}
              href={"/promocja/" + o.slug}
              key={o.id}
            >
              <strong>
                {o.badge} · {o.title} ↗
              </strong>
              <p>{o.summary}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
