import { today } from "./lib/data";
import { weekendPath } from "./lib/weekend";
import { HolidayLinks } from "./components/Holiday";
import { listCategories } from "./lib/categories";
import { listOffers } from "./lib/repository";
import Catalog from "./components/Catalog";
export const dynamic = "force-dynamic";
export default async function Home() {
  return <Catalog offers={await listOffers()} categories={await listCategories()} beforeCategories={<>{today() <= "2026-11-22" && <section style={{ padding: "1rem 1.25rem", background: "#fff0e6", borderRadius: ".8rem", marginBottom: "1rem" }}><strong>Weekend w Białymstoku · 21–22 listopada</strong><p style={{ margin: ".5rem 0" }}>21 wydarzeń: dla rodzin, koncerty, warsztaty, teatr i wieczorne wyjścia.</p><a href={weekendPath} className="text-link">Wybierz kategorię i zaplanuj weekend</a></section>}<section style={{padding:"1.25rem",background:"#fff",border:"1px solid #edddc7",borderRadius:".8rem",marginBottom:"1rem"}}><strong>Mieszkania w Białymstoku — porównaj cały wariant zakupu</strong><p style={{margin:".5rem 0"}}>Do 400, 500 i 600 tys. zł oraz powyżej. Cena mieszkania, parking i komórka w jednym zestawieniu.</p><a href="/mieszkania-bialystok" className="text-link">Zobacz mieszkania i wybierz budżet</a></section><HolidayLinks /></>} />;
}
