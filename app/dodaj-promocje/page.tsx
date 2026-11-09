import { listCategories } from "../lib/categories";
import { Header, Footer } from "../components/Shell";
import SubmissionForm from "../components/SubmissionForm";
export const metadata = {
  title: "Dodaj promocję swojej firmy",
  robots: { index: false, follow: true },
};
export default async function Add() {
  return (
    <>
      <Header />
      <main className="container inner-main">
        <div className="eyebrow">PRICESTOK · ZGŁOŚ PROMOCJĘ</div>
        <h1 className="page-title">Zgłoś promocję lub lokalną firmę.</h1>
        <p className="lead">
          Znasz lokalną firmę albo ofertę, o której warto wiedzieć? Prześlij
          szczegóły. Sprawdzimy warunki i zdecydujemy o publikacji.
        </p>
        <SubmissionForm categories={await listCategories()} />
      </main>
      <Footer />
    </>
  );
}
