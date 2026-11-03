export type Offer = {
  id: string;
  slug: string;
  title: string;
  company: string;
  companySlug: string;
  category: string;
  badge: string;
  summary: string;
  conditions: string;
  address: string;
  area: string;
  source: string;
  image: string;
  days: number[];
  start: string;
  end: string;
  verified: string;
  status: string;
  featured: boolean;
  price: string;
  oldPrice: string;
  sponsored?: boolean;
  hearts?: number;
};
export const categories = [
  { id: "jedzenie", name: "Jedzenie", icon: "Utensils", color: "#fff0e6" },
  { id: "beauty", name: "Beauty", icon: "Sparkles", color: "#f5eafb" },
  {
    id: "sport-i-relaks",
    name: "Sport i relaks",
    icon: "Dumbbell",
    color: "#eaf2e7",
  },
  { id: "rozrywka", name: "Rozrywka", icon: "Ticket", color: "#e9edff" },
  { id: "zakupy", name: "Zakupy", icon: "ShoppingBag", color: "#fff3d8" },
  { id: "uslugi", name: "Usługi", icon: "Wrench", color: "#e7f1f1" },
  { id: "dla-dzieci", name: "Dla dzieci", icon: "Baby", color: "#fce9ed" },
];
const all = [0, 1, 2, 3, 4, 5, 6];
const base = {
  start: "",
  end: "",
  verified: "2026-11-03",
  status: "published",
  featured: false,
  price: "",
  oldPrice: "",
};
function offer(
  id: string,
  title: string,
  company: string,
  companySlug: string,
  category: string,
  badge: string,
  summary: string,
  conditions: string,
  address: string,
  area: string,
  source: string,
  image: string,
  days = all,
  extra: Partial<Offer> = {},
): Offer {
  return {
    ...base,
    id,
    slug: id,
    title,
    company,
    companySlug,
    category,
    badge,
    summary,
    conditions,
    address,
    area,
    source,
    image,
    days,
    ...extra,
  };
}
export const seeds: Offer[] = [
  offer(
    "chilli-druga-pizza",
    "Druga pizza za połowę ceny",
    "Chilli Pizza",
    "chilli-pizza",
    "jedzenie",
    "−50%",
    "Zamów dwie pizze — tańsza z rabatem 50%.",
    "Na miejscu lub z odbiorem osobistym. Odbiór osobisty wyłącznie przy zamówieniu online. Promocje nie łączą się. Lokalizację wybierz na stronie restauracji.",
    "Lokale w Białymstoku",
    "Całe miasto",
    "https://chillipizza.pl/promocje/",
    "pizza",
    all,
    { featured: true },
  ),
  offer(
    "beauty-bar-pierwsza-wizyta",
    "Nowa fryzura, 50 zł mniej",
    "Beauty Bar",
    "beauty-bar",
    "beauty",
    "−50 zł",
    "Rabat na pierwszą wizytę z kodem polecającym.",
    "Potrzebny indywidualny kod od uczestniczki Girls Club. Podaj go przy zapisie. Bonus osoby polecającej naliczany jest dopiero po zrealizowanej wizycie. Adres i dostępność sprawdź w salonie.",
    "Białystok — adres na stronie salonu",
    "Całe miasto",
    "https://beauty-bar.pl/beauty-bar-girls-club",
    "beauty",
    all,
    { featured: true },
  ),
  offer(
    "magic-gym-pierwsze-wejscie",
    "Pierwszy trening? Na nasz koszt",
    "Magic Gym",
    "magic-gym",
    "sport-i-relaks",
    "GRATIS",
    "Sprawdź klub podczas bezpłatnego pierwszego wejścia.",
    "Dla osób odwiedzających klub po raz pierwszy. Zabierz dokument tożsamości i wcześniej umów wejście w recepcji. Zakres wejścia potwierdź z klubem.",
    "al. 1000-lecia P.P. 8b",
    "Galeria M",
    "https://magic-gym.pl/kontakt/",
    "gym",
    all,
    { price: "0 zł", featured: true },
  ),
  offer(
    "hebe-makijaz-zielone-wzgorze",
    "Kosmetyki do makijażu do −50%",
    "Hebe · Zielone Wzgórze",
    "hebe-zielone-wzgorze",
    "zakupy",
    "do −50%",
    "Wybrane kosmetyki do makijażu w niższych cenach.",
    "Oferta na wybrane produkty. Zakres i ceny sprawdź w sklepie oraz w regulaminie akcji. Informacja opublikowana przez Galerię Zielone Wzgórze.",
    "Wrocławska 20",
    "Zielone Wzgórza",
    "https://galeriazielonewzgorze.pl/",
    "shopping",
    all,
    { end: "2026-11-04" },
  ),
  offer(
    "nalesniki-jak-smok-dostawa",
    "Naleśniki z dostawą i rabatem",
    "Naleśniki Jak Smok",
    "nalesniki-jak-smok",
    "jedzenie",
    "do −15%",
    "10% rabatu od 110 zł lub 15% od 170 zł.",
    "Dotyczy bieżącego zamówienia z dostawą. Rabat 10% przy wartości min. 110 zł, 15% przy min. 170 zł. Sprawdź dostępność dowozu pod swój adres.",
    "Lipowa 12",
    "Centrum",
    "https://www.restauracjanjs.pl/promocje",
    "pancakes",
  ),
  offer(
    "house-of-beauty-pakiety",
    "Epilacja laserowa w pakiecie",
    "House of Beauty",
    "house-of-beauty",
    "beauty",
    "do −20%",
    "Pakiety 7, 14 lub 21 zabiegów z rabatem.",
    "7 zabiegów: −10%, 14: −15%, 21: −20%. Według salonu pakiet można wykorzystać na różne partie ciała. Dobór zabiegu i warunki potwierdź w salonie.",
    "Białystok — adres na stronie salonu",
    "Całe miasto",
    "https://houseofbeauty.bialystok.pl/promocje/",
    "spa",
  ),
  offer(
    "na-lipowej-wtorki",
    "Wtorek smakuje lepiej z pizzą",
    "Na Lipowej",
    "na-lipowej",
    "jedzenie",
    "−30%",
    "Pizza Margarita z rabatem w każdy wtorek.",
    "Oferta cykliczna, we wtorki. Na stronie lokalu wymieniono pizzę Margarita oraz wybrane koktajle Margarita. Szczegóły i dostępność potwierdź w restauracji.",
    "Lipowa 3/5",
    "Centrum",
    "https://www.nalipowej.pl/wtorki-z-margaritta",
    "pizza",
    [2],
  ),
  offer(
    "fito-pierwsze-wejscie",
    "Poznaj FITO bez opłaty za wejście",
    "FITO Gym & Fitness",
    "fito-gym",
    "sport-i-relaks",
    "GRATIS",
    "Pierwsza wizyta na siłowni bez opłaty.",
    "Oferta pierwszego wejścia opublikowana w cenniku klubu. Przed wizytą potwierdź zasady i ewentualne wymagane zgłoszenie w recepcji.",
    "Antoniukowska 56, lok. 035",
    "Antoniuk",
    "https://fitogym.pl/",
    "gym",
    all,
    { price: "0 zł" },
  ),
  offer(
    "ccc-druga-para",
    "Druga para butów z rabatem 40%",
    "CCC · Zielone Wzgórze",
    "ccc-zielone-wzgorze",
    "zakupy",
    "−40%",
    "Dobierz drugą parę i skorzystaj z promocji.",
    "Warunki doboru produktów, zakres akcji i naliczanie rabatu według regulaminu CCC. Informacja opublikowana przez galerię. Przed zakupem sprawdź warunki w sklepie.",
    "Wrocławska 20",
    "Zielone Wzgórza",
    "https://galeriazielonewzgorze.pl/",
    "shopping",
    all,
    { end: "2026-11-05" },
  ),
  offer(
    "crossfit-pierwszy-trening",
    "Pierwszy CrossFit za darmo",
    "CrossFit Białystok",
    "crossfit-bialystok",
    "sport-i-relaks",
    "GRATIS",
    "Wypróbuj trening dla osób początkujących.",
    "Oferta pierwszego treningu. Strona wskazuje zajęcia Beginners we wtorki i czwartki. Sprawdź aktualny grafik, przyjdź około 15 minut wcześniej z dokumentem i strojem sportowym.",
    "Białystok — lokalizacja na stronie klubu",
    "Całe miasto",
    "https://crossfitbialystok.com/jak-zaczac/",
    "gym",
    [2, 4],
    { price: "0 zł" },
  ),
  offer(
    "osobliwy-dom-kdr",
    "Pokój zagadek z rodzinną zniżką",
    "Osobliwy Dom Pana Adama",
    "osobliwy-dom",
    "rozrywka",
    "−10%",
    "Dodatkowy rabat na grę dla posiadaczy BKDR.",
    "Wyłącznie dla posiadaczy Białostockiej Karty Dużej Rodziny. Według miejskiej listy partnerów: dodatkowe 10% rabatu na jedną grę w wybranym pokoju. Potwierdź zasady przy rezerwacji.",
    "Piłsudskiego 11/3, lok. 0/3 B",
    "Centrum",
    "https://www.bialystok.pl/pl/dla_mieszkancow/pomoc_spoleczna/bialostocka-karta-duzej-rodziny/lista-partnerow.html",
    "cinema",
  ),
];
export function today() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(
    new Date(),
  );
}
export function isActive(o: Offer, date = today()) {
  return (
    o.status === "published" &&
    (!o.start || o.start <= date) &&
    (!o.end || o.end >= date)
  );
}
export function weekday(date = today()) {
  return new Date(date + "T12:00:00Z").getUTCDay();
}
export function dateLabel(v: string) {
  return v
    ? new Date(v + "T12:00:00").toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
      })
    : "Oferta cykliczna";
}
