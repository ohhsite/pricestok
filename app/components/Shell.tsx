import Newsletter from "./Newsletter";
import SiteMenu from "./SiteMenu";
import { MapPin, Plus, ArrowUpRight, Heart } from "lucide-react";
function Brand() {
  return (
    <a className="brand" href="/" aria-label="PriceStok — strona główna">
      <img src="/pricestok-logo.svg" width={184} height={42} alt="PriceStok" />
    </a>
  );
}
export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Brand />
        <span className="location">
          <MapPin size={15} /> Lokalnie. W Białymstoku.
        </span>
        <nav className="header-actions">
          <a
            className="saved-link"
            href="/?zapisane=1#okazje"
            aria-label="Zapisane promocje"
          >
            <Heart size={19} />
          </a>
          <SiteMenu />
          <a className="button small header-submit" href="/dodaj-promocje">
            <Plus size={17} /> Zgłoś okazję
          </a>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <>
    <Newsletter />
    <footer>
      <div className="container footer-top">
        <div>
          <Brand />
          <p>Lokalne okazje w Białymstoku.</p>
        </div>
        <div>
          <a href="/#okazje">Promocje</a>
          <a href="/dla-firm">Dla firm</a>
          <a href="/zasady">Jak sprawdzamy oferty</a>
          <a href="/polityka-prywatnosci">Prywatność</a>
          <a href="/o-nas">Kim jesteśmy</a>
          <a href="/dodaj-promocje?typ=firma">Zgłoś firmę</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PriceStok</span>
        <span>Odkrywaj miasto. Wydawaj mniej.</span>
      </div>
    </footer>
    </>
  );
}
