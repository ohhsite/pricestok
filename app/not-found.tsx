import { Header, Footer } from "./components/Shell";
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container inner-main">
        <h1 className="page-title">Nie ma już tej okazji.</h1>
        <p className="lead">
          Oferta mogła wygasnąć lub zmienić adres. Zobacz aktualne promocje.
        </p>
        <a className="button" href="/" style={{ marginTop: 25 }}>
          Wróć do promocji
        </a>
      </main>
      <Footer />
    </>
  );
}
