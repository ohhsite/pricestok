"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { categories as defaults } from "../lib/data";
type MenuCategory = { id: string; name: string; parent?: string | null };
export default function SiteMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>(defaults);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(data => { if (Array.isArray(data)) setCategories(data); }).catch(() => {});
    const close = (e: KeyboardEvent) => { if (e.key === "Escape" && ref.current) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } };
    const outside = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) ref.current.open = false; };
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", outside);
    return () => { controller.abort(); document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <details ref={ref} className="site-menu" onToggle={e => setOpen(e.currentTarget.open)}>
    <summary aria-label="Menu strony" aria-expanded={open}><Menu size={20} /><span>Menu</span></summary>
    <div className="site-menu-panel">
      <div className="site-menu-top"><strong>Odkrywaj PriceStok</strong><button type="button" aria-label="Zamknij menu" onClick={() => { if (ref.current) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } }}><X size={21} /></button></div>
      <nav aria-label="Nawigacja strony" onClick={e => { if ((e.target as HTMLElement).closest("a") && ref.current) ref.current.open = false; }}>
        <a className="menu-all" href="/#okazje">Wszystkie promocje <ChevronRight size={17} /></a>
        <span className="menu-label">Kategorie</span>
        <div className="menu-categories">{categories.filter(c => !c.parent).map(c => <a key={c.id} href={"/kategoria/" + c.id}>{c.name}<ChevronRight size={15} /></a>)}</div>
        <span className="menu-label">Święta w Białymstoku</span>
        <a href="/catering-wigilijny-bialystok">Catering wigilijny</a><a href="/prezenty-swiateczne-bialystok">Prezenty i warsztaty</a><a href="/choinki-bialystok">Gdzie kupić choinkę?</a>
        <div className="menu-secondary"><a href="/firmy">Lokalne firmy</a><a href="/?zapisane=1#okazje">Zapisane promocje</a><a href="/dla-firm">Dla firm</a><a href="/dodaj-promocje">Zgłoś okazję</a></div>
      </nav>
    </div>
  </details>;
}
