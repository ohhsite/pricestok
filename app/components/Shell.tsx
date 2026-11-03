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
        <nav>
          <a href="/#okazje">Odkrywaj promocje</a>
          <a href="/firmy">Lokalne firmy</a>
          <a href="/dla-firm">
            Dla firm <ArrowUpRight size={14} />
          </a>
          <a
            className="saved-link"
            href="/?zapisane=1#okazje"
            aria-label="Zapisane promocje"
          >
            <Heart size={19} />
          </a>
          <a className="button small" href="/dodaj-promocje">
            <Plus size={17} /> Zgłoś okazję
          </a>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
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
          <a href="/o-nas">Kim jesteśmy</a>
          <a href="/dodaj-promocje?typ=firma">Zgłoś firmę</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PriceStok</span>
        <span>Odkrywaj miasto. Wydawaj mniej.</span>
      </div>
    </footer>
  );
}
