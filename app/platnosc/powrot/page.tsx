import { Header, Footer } from "../../components/Shell";
import PaymentStatus from "../../components/PaymentStatus";
export const metadata = {
  title: "Status płatności",
  robots: { index: false, follow: false },
};
export default function Return() {
  return (
    <>
      <Header />
      <main className="container inner-main">
        <div className="eyebrow">TWOJA PROMOCJA</div>
        <h1 className="page-title">Status zamówienia</h1>
        <PaymentStatus />
      </main>
      <Footer />
    </>
  );
}
