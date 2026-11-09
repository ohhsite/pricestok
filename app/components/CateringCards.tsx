import { caterers, checkedOn } from "../lib/christmas-catering";
import HolidayBrand from "./HolidayBrand";
export default function CateringCards() {
  return <div className="catering-grid">{caterers.map((c) => <article className="catering-card" key={c.slug} id={c.slug}>
    <HolidayBrand slug={c.slug} name={c.name} dark={["hotel-lesny", "royal-hotel", "soodi"].includes(c.slug)} />
    <div className="catering-card-body">
      <span className={"season-status" + (c.confirmed ? " is-confirmed" : "")}>{c.note}</span>
      <h3>{c.name}</h3><p className="catering-address">{c.address}</p>
      <strong className="catering-price">{c.price}</strong><p>{c.summary}</p><p className="catering-details">{c.details}</p>
      <a className="text-link" href={c.source} target="_blank" rel="noopener noreferrer">Menu i źródło informacji ↗</a>
      <small>Sprawdzono: {checkedOn}</small>
    </div>
  </article>)}</div>;
}
