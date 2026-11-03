"use client";
import { useState, useEffect } from "react";
export default function PaymentStatus() {
  const [status, setStatus] = useState("loading"),
    [offer, setOffer] = useState("");
  async function check() {
    const params = new URLSearchParams(location.search);
    const id = params.get("order"),
      token = params.get("token");
    if (!id || !token) {
      setStatus("unknown");
      return;
    }
    try {
      const r = await fetch(
        "/api/orders?id=" +
          encodeURIComponent(id) +
          "&token=" +
          encodeURIComponent(token),
        { cache: "no-store" },
      );
      if (!r.ok) throw new Error();
      const data = await r.json();
      setStatus(data.status);
      setOffer(data.offerId || "");
    } catch {
      setStatus("error");
    }
  }
  useEffect(() => {
    check();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (attempts >= 12) clearInterval(timer);
      check();
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const messages: Record<string, string> = {
    loading: "Sprawdzamy status…",
    awaiting_payment:
      "Czekamy na potwierdzenie płatności przez Stripe. Przy niektórych metodach może to potrwać dłużej.",
    paid_review:
      "Wpłata potwierdzona. Twoja oferta czeka na sprawdzenie przez redakcję. Okres publikacji jeszcze się nie rozpoczął.",
    published: "Twoja promocja została zatwierdzona i jest opublikowana.",
    payment_failed: "Stripe nie potwierdził wpłaty. Płatność nie powiodła się.",
    expired: "Sesja płatności wygasła. Zamówienie nie zostało opłacone.",
    refund_pending: "Zwrot wpłaty został zlecony i jest przetwarzany.",
    refunded:
      "Wpłata została zwrócona. Oferta nie będzie publikowana w ramach tego zamówienia.",
    disputed:
      "Zamówienie zostało wstrzymane z powodu sporu dotyczącego płatności.",
    unknown: "Brakuje danych do sprawdzenia zamówienia.",
    error: "Nie udało się odczytać statusu. Spróbuj ponownie za chwilę.",
  };
  return (
    <div className="form-card">
      <p className="lead">
        {messages[status] || "Status wymaga sprawdzenia przez redakcję."}
      </p>
      {status === "published" && offer && (
        <a className="button" href={"/promocja/" + offer}>
          Zobacz swoją promocję ↗
        </a>
      )}
      <button
        className="button outline"
        style={{ marginLeft: 10 }}
        onClick={check}
      >
        Sprawdź ponownie
      </button>
      <p className="form-note">
        Sam powrót ze Stripe nie potwierdza wpłaty. Status zmienia się po
        zweryfikowanym powiadomieniu od Stripe.
      </p>
    </div>
  );
}
