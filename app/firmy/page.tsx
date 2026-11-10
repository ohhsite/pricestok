import { Header, Footer } from "../components/Shell";
import { listCompanies } from "../lib/companies";
import { listCategories } from "../lib/categories";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Lokalne firmy w Białymstoku",
  alternates: { canonical: "/firmy" },
};

export default async function Companies({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>;
}) {
  const { kategoria } = await searchParams;
  const companies = await listCompanies().catch(() => null);
  const categories = await listCategories();
  const selected = categories.find((c) => c.id === kategoria);
  const visible = companies?.filter(
    (c) => !selected || c.category === selected.id,
  );
  return (
    <>
      <Header />
      <main className="container inner-main">
        <h1 className="page-title">Lokalne firmy w Białymstoku</h1>
        <nav className="admin-tools" aria-label="Kategorie firm">
          <a
            className="filter-button"
            href="/firmy"
            aria-current={!selected ? "page" : undefined}
          >
            Wszystkie
          </a>
          {categories.map((c) => (
            <a
              className="filter-button"
              key={c.id}
              href={"/firmy?kategoria=" + c.id}
              aria-current={selected?.id === c.id ? "page" : undefined}
            >
              {c.name}
            </a>
          ))}
        </nav>
        {visible === undefined ? (
          <p>Katalog jest chwilowo niedostępny.</p>
        ) : !visible.length ? (
          <p>Brak firm w tej kategorii.</p>
        ) : (
          visible.map((c) => {
            const website = /^https?:\/\/[^\s]+$/i.test(c.website) ? c.website : "";
            return (
            <article className="detail-box" key={c.slug}>
              <h2>
                <a href={website || "/firma/" + c.slug} target={website ? "_blank" : undefined} rel={website ? "noopener noreferrer" : undefined}>{c.name} ↗</a>
              </h2>
              <p>
                {categories.find((item) => item.id === c.category)?.name}
                {c.address && " · " + c.address}
              </p>
              {c.description && <p>{c.description}</p>}
              <div className="admin-tools">
                {website && <a className="button" href={website} target="_blank" rel="noopener noreferrer" aria-label={"Przejdź na stronę firmy " + c.name}>Przejdź na stronę firmy ↗</a>}
                <a className="text-link" href={"/firma/" + c.slug}>Profil i promocje w PriceStok →</a>
              </div>
            </article>
          );})
        )}
      </main>
      <Footer />
    </>
  );
}
