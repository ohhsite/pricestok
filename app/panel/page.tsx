import { adminAllowed } from "../lib/admin";
import { Header, Footer } from "../components/Shell";
import AdminPanel from "../components/AdminPanel";
import AdminLogin from "../components/AdminLogin";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Panel redakcji",
  robots: { index: false, follow: false },
};
export default async function Panel() {
  return (
    <>
      <Header />
      <main className="container inner-main">
        {(await adminAllowed()) ? (
          <AdminPanel />
        ) : (
          <>
            <h1 className="page-title">Panel redakcji</h1>
            <p className="lead">
              Zaloguj się, żeby zarządzać ofertami i płatnymi zamówieniami.
            </p>
            <AdminLogin />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
