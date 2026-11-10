import { caterers } from "../lib/christmas-catering";
import HolidayBrand from "./HolidayBrand";
export default function CateringCards() {
  return <div className="catering-grid">{caterers.map((c) => <article className="catering-card" key={c.slug} id={c.slug}>
    <div className="catering-card-heading"><HolidayBrand slug={c.slug} name={c.name} dark={["hotel-lesny", "royal-hotel", "soodi"].includes(c.slug)} />
    <div><h3>{c.name}</h3><p className="catering-address">{c.address}</p></div></div>
    <div className="catering-card-body">
      <span className={"season-status" + (c.confirmed ? " is-confirmed" : "")}>{c.confirmed ? "Menu świąteczne 2026" : "Zapytaj o menu 2026"}</span>
      <strong className="catering-price">{c.price}</strong><p>{c.summary}</p><details className="catering-more"><summary>Odbiór i zamówienia</summary><p>{c.details}</p></details>
      <a className="text-link" href={c.source} target="_blank" rel="noopener noreferrer">Zobacz menu ↗</a>
    </div>
  </article>)}</div>;
}
