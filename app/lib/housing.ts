export type Budget = "all" | "400" | "500" | "600" | "600-plus";
export type HousingOffer = {
  id: string; investment: string; developer: string; address: string; district: string;
  area: number; rooms: number; floor: number; price: number;
  parking: number | null; storage: number | null; storageIncluded: boolean;
  basis: "package" | "optional-parking" | "apartment-only" | "incomplete";
  note: string; source: string; detailsSource?: string; checked: string;
};
export const housingChecked = "2026-11-22";
export const housingRoot = "/mieszkania-bialystok";
export const housingPages: { id: Budget; path: string; label: string; title: string; intro: string; advice: string }[] = [
  { id: "all", path: housingRoot, label: "Wszystkie", title: "Mieszkania na sprzedaż w Białymstoku", intro: "Porównaj nowe mieszkania według budżetu, metrażu i liczby pokoi. Zobacz cenę lokalu, parkingu i komórki w jednym miejscu.", advice: "Przy każdym lokalu podajemy, co obejmuje porównywana cena. Wariant z parkingiem i komórką to inny zakup niż samo mieszkanie. Nie traktujemy nieznanych dopłat jako zera." },
  { id: "400", path: "/mieszkania-do-400-tys-bialystok", label: "Do 400 tys. zł", title: "Mieszkania do 400 tys. zł w Białymstoku", intro: "Szukasz pierwszego mieszkania do 400 000 zł? Sprawdź lokale, których policzony wariant zakupu mieści się w tym budżecie, wraz z rozbiciem dodatkowych kosztów.", advice: "Przy budżecie 400 tys. zł szczególnie ważne są dopłaty. Sama cena mieszkania poniżej limitu nie oznacza, że zakup parkingu i komórki również się w nim zmieści. Poniżej pokazujemy zakres ceny przy każdej propozycji." },
  { id: "500", path: "/mieszkania-do-500-tys-bialystok", label: "Do 500 tys. zł", title: "Mieszkania do 500 tys. zł w Białymstoku", intro: "Porównaj mieszkania do 500 000 zł: kawalerki i mieszkania dwupokojowe, ceny parkingów oraz komórek lokatorskich. Sprawdź, co rzeczywiście obejmuje wybrany wariant.", advice: "W budżecie do 500 tys. zł warto porównać lokalizację z metrażem i dodatkami. Mniejszy lokal w centrum bez parkingu i większe mieszkanie z garażem na innym osiedlu nie są tym samym pakietem. Szczegóły zobaczysz w kartach ofert." },
  { id: "600", path: "/mieszkania-do-600-tys-bialystok", label: "Do 600 tys. zł", title: "Mieszkania do 600 tys. zł w Białymstoku", intro: "Nowe mieszkania do 600 000 zł w Białymstoku. Porównaj propozycje dla par i rodzin, liczbę pokoi, metraż oraz koszt zakupu z dodatkami.", advice: "Jeśli cena samego mieszkania zbliża się do 600 tys. zł, miejsce postojowe i komórka mogą przesunąć ofertę ponad limit. W tym zestawieniu limit dotyczy pokazanej ceny porównawczej, a nie wyłącznie ceny lokalu." },
  { id: "600-plus", path: "/mieszkania-powyzej-600-tys-bialystok", label: "Powyżej 600 tys. zł", title: "Mieszkania powyżej 600 tys. zł w Białymstoku", intro: "Porównaj mieszkania z budżetem powyżej 600 000 zł. Zobacz większe metraże, układy trzy- i czteropokojowe oraz rozbicie ceny lokalu i dodatków.", advice: "Powyżej 600 tys. zł porównuj nie tylko liczbę pokoi. Duży metraż nie zawsze oznacza oddzielne sypialnie dla wszystkich domowników. Sprawdź plan, kondygnację i zakres pakietu przed kontaktem z deweloperem." },
];
const polar = (id: number, area: number, rooms: number, floor: number, price: number): HousingOffer => ({
  id: `polarna-${id}`, investment: "Polarna", developer: "KTK Deweloper", address: "ul. Polarna, Białystok", district: "Zawady", area, rooms, floor, price,
  parking: 50000, storage: 5000, storageIncluded: false, basis: "package",
  note: "Porównujemy wariant z miejscem w hali garażowej i komórką / boxem. Deweloper podaje ceny dodatków; obowiązek ich zakupu oraz przypisanie do lokalu wymagają potwierdzenia.",
  source: "https://www.ktk-deweloper.pl/oferta/polarna/", detailsSource: `https://www.ktk-deweloper.pl/oferta/polarna/lok-${id}/`, checked: housingChecked,
});
export const housingOffers: HousingOffer[] = [
  polar(7, 26.05, 1, 1, 309995), polar(17, 41.50, 2, 0, 431600),
  polar(16, 43.31, 2, 0, 467748), polar(10, 43.80, 3, 1, 499320),
  polar(5, 43.94, 3, 0, 500916), polar(13, 53.44, 2, 2, 545088),
  polar(4, 49.10, 3, 0, 559740), polar(6, 59.31, 4, 1, 646479),
  polar(14, 79.91, 3, 2, 735172),
  ...[{ id: 2, floor: 0, price: 421260 }, { id: 8, floor: 2, price: 424800 }].map(({ id, floor, price }): HousingOffer => ({
    id: `jagienki-b2-${id}`, investment: "Urok Jagienki B2", developer: "Yuniversal Podlaski", address: "ul. Jagienki / Chmielna, Białystok", district: "Sienkiewicza", area: 35.40, rooms: 2, floor, price,
    parking: 44000, storage: 0, storageIncluded: true, basis: "optional-parking",
    note: "Komórka w cenie mieszkania. Parking opcjonalny: 44–49 tys. zł. Pokazana suma obejmuje najtańszy wariant parkingu; dostępność i możliwość przypisania konkretnego miejsca potwierdź w biurze sprzedaży.",
    source: `https://www.yuniversalpodlaski.pl/lokal/140,Bialystok-Urok-Jagienki-B2-ul-Jagienki--Chmielna/B2,mieszkanie_${id}`,
    detailsSource: "https://www.yuniversalpodlaski.pl/opis_inwestycji/140,Bialystok-Urok-Jagienki-B2-ul-Jagienki--Chmielna", checked: housingChecked,
  })),
  { id: "manufaktura-a11", investment: "Rezydencja Manufaktura · A/11", developer: "MERCISE", address: "al. Piłsudskiego 11/1, Białystok", district: "Centrum", area: 30.76, rooms: 1, floor: 1, price: 480299,
    parking: null, storage: null, storageIncluded: false, basis: "apartment-only",
    note: "Cena samego mieszkania. Według ogłoszenia dewelopera zakup parkingu i komórki nie jest obowiązkowy. Ogłoszenie dopuszcza zakup parkingu do mieszkań powyżej 34 m² — dla tego lokalu nie potwierdzamy możliwości zakupu miejsca. Komórki: 5–6 tys. zł/m², bez wskazania konkretnej powierzchni.",
    source: "https://bialystok.nieruchomosci-online.pl/nowe-mieszkanie,rezydencja-manufaktura/26975311.html", checked: housingChecked },
];
export const housingPending: HousingOffer[] = [
  { id: "symfonia-f4", investment: "Symfonia Życia II · F4", developer: "Sokołowscy Nieruchomości", address: "ul. Produkcyjna, Białystok", district: "Zawady", area: 32.30, rooms: 2, floor: 0, price: 339000, parking: null, storage: null, storageIncluded: false, basis: "incomplete", note: "Ogródek ok. 40 m². Cena i obowiązek zakupu parkingu oraz komórki nie zostały potwierdzone. Tej oferty nie zaliczamy do pełnych kosztów budżetowych.", source: "https://www.sokolowscynieruchomosci.pl/inwestycje/symfonia-zycia-etap-ii/f4", checked: housingChecked },
  { id: "symfonia-i13", investment: "Symfonia Życia II · I13", developer: "Sokołowscy Nieruchomości", address: "ul. Produkcyjna, Białystok", district: "Zawady", area: 46.93, rooms: 3, floor: 2, price: 435000, parking: null, storage: null, storageIncluded: false, basis: "incomplete", note: "Balkon. Cena i obowiązek zakupu parkingu oraz komórki nie zostały potwierdzone. Tej oferty nie zaliczamy do pełnych kosztów budżetowych.", source: "https://www.sokolowscynieruchomosci.pl/inwestycje/symfonia-zycia-etap-ii/i13", checked: housingChecked },
];
export function comparisonPrice(offer: HousingOffer): number | null {
  if (offer.basis === "incomplete") return null;
  return offer.price + (offer.parking ?? 0) + (offer.storage ?? 0);
}
export function inBudget(offer: HousingOffer, budget: Budget): boolean {
  const price = comparisonPrice(offer);
  if (price === null) return false;
  return budget === "all" || (budget === "600-plus" ? price > 600000 : price <= Number(budget) * 1000);
}
export type HousingSort = "price-asc" | "price-desc" | "area-asc" | "area-desc" | "unit-price" | "rooms-desc";
export function sortHousing(offers: HousingOffer[], sort: HousingSort): HousingOffer[] {
  return [...offers].sort((a, b) => {
    const ap = comparisonPrice(a) ?? Infinity, bp = comparisonPrice(b) ?? Infinity;
    const primary = sort === "price-desc" ? bp - ap : sort === "area-asc" ? a.area - b.area : sort === "area-desc" ? b.area - a.area : sort === "unit-price" ? a.price / a.area - b.price / b.area : sort === "rooms-desc" ? b.rooms - a.rooms : ap - bp;
    return primary || a.id.localeCompare(b.id);
  });
}
export function housingMoney(value: number) { return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(value); }
export const housingFaq = [
  { question: "Czy limit budżetu obejmuje parking i komórkę?", answer: "O tym decyduje wariant opisany przy ofercie. W Polarnej liczymy lokal, parking i komórkę / box. W Uroku Jagienki liczymy mieszkanie z komórką oraz najtańszy opcjonalny parking. Manufakturę pokazujemy jako samo mieszkanie, ponieważ dodatki nie są obowiązkowe. Nieznane obowiązkowe dopłaty oznaczamy osobno." },
  { question: "Czy ceny obejmują wykończenie i koszty notarialne?", answer: "Nie. To ceny lokali w stanie deweloperskim i wyraźnie wskazanych dodatków. Wykończenie, koszty notarialne, opłaty sądowe i finansowanie nie są wliczone." },
  { question: "Czy oferta jest nadal dostępna?", answer: "Stan dostępności sprawdziliśmy 22 listopada 2026 w opublikowanych ofertach deweloperów. To ręcznie przygotowany przegląd, nie aktualizacja na żywo. Cenę, rezerwację i dodatki potwierdź bezpośrednio u sprzedawcy przed podjęciem decyzji." },
];
