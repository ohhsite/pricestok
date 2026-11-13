# PriceStok — React + Next.js + Supabase + Stripe

### Społeczność i baner

Na nowej bazie wykonaj także `supabase/spolecznosc.sql` po wcześniejszych migracjach. Zgłoszenia promocji, firm i wynajmu banera znajdziesz w panelu w sekcji Zgłoszenia. Przy zgłoszeniu firmy kliknij „Przygotuj wizytówkę firmy”, sprawdź pola i zapisz. Domyślne sortowanie ofert pokazuje najpierw wyróżnienia redakcji, następnie liczbę serduszek. Jedno serduszko na ofertę przypada na identyfikator zapisany w ciasteczku przeglądarki.

Po uzgodnieniu wynajmu ustaw w Vercel `NEXT_PUBLIC_PRICESTOK_AD_TITLE`, `NEXT_PUBLIC_PRICESTOK_AD_TEXT` i `NEXT_PUBLIC_PRICESTOK_AD_URL`, a potem wdróż ponownie. Bez nazwy i adresu baner zaprasza do złożenia zapytania. Płatność i terminy wynajmu są ustalane indywidualnie.

Na produkcji ustaw `SITE_URL` na publiczną domenę PriceStok. Po wdrożeniu dodaj `/sitemap.xml` w Google Search Console i sprawdź indeksowanie kategorii oraz ofert.

Aktualizacja płatności: instrukcje w `WDROZENIE-ABONAMENTOW.md` zastępują poniższy historyczny cennik i konfigurację poprzednich pakietów. Aktualne ceny: jednorazowa promocja 50 zł netto/do 30 dni, abonament 50 zł netto/miesiąc oraz podstrona firmy 200 zł netto jednorazowo. Nowy projekt Supabase jest opisany w tej instrukcji.

Kompletne pliki źródłowe. Projekt jest niezależny od podglądu ChatGPT: możesz edytować go w VS Code, wysłać do GitHub i wdrożyć na Vercel. **Next.js jest frameworkiem React**; zapewnia też renderowanie treści po stronie serwera pod SEO oraz backend do Stripe.

## 1. Obejrzyj stronę lokalnie

Wymagany Node.js 22.13 lub nowszy.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Otwórz http://localhost:3000. Bez skonfigurowanej bazy katalog pokazuje 11 ofert startowych. Zapisywanie ogłoszeń, panel i płatności wymagają konfiguracji poniżej. To jawny tryb podglądu, nie zastępczy zapis w przeglądarce.

## 2. Podłącz Supabase

1. Utwórz osobny projekt Supabase dla tego serwisu. Nie używaj bazy LOFIT.
2. W SQL Editor uruchom cały `supabase/schema.sql`.
3. W `.env.local` wpisz `SUPABASE_URL` i `SUPABASE_SECRET_KEY`.
4. `SUPABASE_SECRET_KEY` to serwerowy secret key lub starszy service_role. Nie dodawaj prefiksu `NEXT_PUBLIC_`.
5. W Authentication → Users utwórz konto administratora z hasłem, zatwierdź jego e-mail i wpisz ten adres w `ADMIN_EMAIL`. Logowanie przez e-mail musi być włączone. Publiczna rejestracja kont nie jest potrzebna.
6. Wejdź na `/redakcja-k7m4q9` i zaloguj się tym kontem. Sesja administratora wygasa wraz z tokenem Supabase; wtedy zaloguj się ponownie.

Tabele mają włączone RLS i zablokowany dostęp dla anon/authenticated. Serwer po weryfikacji uprawnień używa swojego klucza; przeglądarka nigdy go nie otrzymuje.

## 3. Stripe — uruchom najpierw w odrębnym sandboxie

Pakiety są jednorazowe: standard **49 zł**, wyróżnienie **99 zł**, do **30 dni**. Nie ma subskrypcji ani automatycznego odnawiania. Ceny określa serwer w `app/lib/plans.ts`; frontend nie może podmienić kwoty.

1. W Stripe utwórz osobny sandbox do sprawdzenia tej integracji.
2. Wygeneruj osobny restricted API key z uprawnieniami wymaganymi przez Checkout Sessions (tworzenie/odczyt, w tym inline products/prices i klientów), odczyt PaymentIntents/Charges oraz tworzenie/odczyt Refunds dla zwrotów z panelu. Zweryfikuj zakres na testowym zakupie; nie używaj klucza projektu LOFIT. Jeśli konto nie umożliwia danego zakresu dla restricted key, sprawdź dokumentację swojego konta przed wyborem szerszego klucza.
3. Wpisz klucz wyłącznie do `STRIPE_SECRET_KEY` w `.env.local` lub jako sensitive environment variable Vercel.
4. Ustaw `ORDER_TOKEN_SECRET` na losowy sekret o długości min. 32 znaków. Nie zmieniaj go bez potrzeby: służy ponawianiu tego samego zamówienia.
5. Dodaj obowiązkowy webhook: `https://TWOJA-DOMENA/api/stripe/webhook`.
6. Zaznacz zdarzenia:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `charge.refunded`
   - `charge.dispute.created`
7. Skopiuj signing secret endpointu do `STRIPE_WEBHOOK_SECRET`.
8. Uzupełnij dane `SELLER_NAME`, `SELLER_ADDRESS`, `SELLER_TAX_ID` i `SELLER_CONTACT_EMAIL`. Przeczytaj i dostosuj `/warunki-publikacji` oraz `/zasady` do swojej działalności. Zawarte teksty są materiałem startowym do uzupełnienia, nie pełnym regulaminem prawnym ani polityką prywatności.
9. Po zatwierdzeniu dokumentów ustaw `SALES_TERMS_READY=true`, a do testów `PAYMENTS_ENABLED=true`.

Bez powyższej konfiguracji formularz zakupu jest widoczny, ale przycisk płatności pozostaje nieaktywny. Projekt nie zawiera żadnych prawdziwych kluczy ani istniejących produktów Twojego konta Stripe.

### Test webhooka lokalnie

Zainstaluj oficjalne Stripe CLI i zaloguj je do wybranego sandboxa.

```powershell
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired,charge.refunded,charge.dispute.created --forward-to localhost:3000/api/stripe/webhook
```

Sekret pokazany przez CLI użyj jako lokalny `STRIPE_WEBHOOK_SECRET`; sekret endpointu produkcyjnego jest inny. Zrestartuj `npm run dev` po zmianach `.env.local`.

Wejdź w „Dla firm”, wybierz pakiet i przejdź przez testowy Checkout. Użyj danych karty testowej Stripe, nigdy prawdziwej karty w sandboxie. Po webhooku zamówienie pojawi się w panelu jako „Opłacona — do sprawdzenia”. Sam ekran powrotu ze Stripe **nie** zmienia statusu płatności.

### Akceptacja i zwrot

- „Zatwierdź i publikuj” publikuje opłaconą ofertę i ustawia koniec na 30. dzień włącznie, maksymalnie do daty końca promocji. Pierwszy dzień jest liczony jako dzień 1.
- Operacja jest atomowa w PostgreSQL i odporna na podwójne kliknięcie; ponowienie nie wydłuża czasu.
- Wyróżnienie daje priorytet w domyślnym sortowaniu. Wszystkie płatne publikacje mają etykietę „Sponsorowane”.
- „Odrzuć i zwróć wpłatę” wymaga potwierdzenia i zleca pełny zwrot przez Stripe. Zwrot ma własny idempotency key. Panel nie oferuje częściowych zwrotów.
- Pełny zwrot lub spór płatniczy archiwizuje odpowiadającą ofertę.
- Nie są wysyłane automatyczne maile z tego projektu. Potwierdzenia płatności skonfiguruj w Stripe. Automatyczne fakturowanie i Stripe Tax nie są włączone; rozliczenie dokumentów i podatków skonfiguruj według swojej działalności.

## 4. GitHub i Vercel

Wrzuć **zawartość folderu projektu** do nowego repozytorium GitHub. `.env.local`, `node_modules` i `.next` są wykluczone z gita.

Na Vercel: importuj repozytorium, wybierz framework Next.js i Node.js 22+, dodaj zmienne z `.env.example`. `SITE_URL` musi być dokładnym adresem Twojego wdrożenia, np. `https://twoja-domena.pl`, bez ukośnika na końcu. Ustawienia podglądu i produkcji przechowuj osobno. Po podłączeniu domeny zaktualizuj `SITE_URL` i adres webhooka, następnie wykonaj redeploy.

Po sprawdzeniu sandboxa użyj oddzielnego klucza live, live webhooka i signing secret w środowisku produkcyjnym. Nie mieszaj środowisk.

## 5. SEO

- Treść kategorii i ofert jest renderowana na serwerze.
- Każda oferta i firma ma własny adres.
- Tytuły, opisy, canonical, breadcrumbs JSON-LD, `robots.txt` i `sitemap.xml` są przygotowane.
- Domena jest pobierana z `SITE_URL`.
- Panel, checkout i statusy płatności mają `noindex`.
- Publiczną domenę dodaj do Google Search Console i zgłoś `/sitemap.xml`.
- Data i dni obowiązywania liczone są według Europe/Warsaw.

Widoczność w Google zależy również od jakości i aktualności treści. Oferty startowe zebrano ze stron źródłowych 3 listopada 2026 r. Przed publicznym startem sprawdź je ponownie. Dwie oferty zakupowe wygasają 4 i 5 listopada; wygasłe automatycznie znikają.

## 6. Co edytować

| Plik                              | Przeznaczenie                           |
| --------------------------------- | --------------------------------------- |
| `app/components/Catalog.tsx`      | Strona główna, kategorie i filtry       |
| `app/globals.css`                 | Wygląd i responsywność                  |
| `app/lib/data.ts`                 | Kategorie, typy i startowe oferty       |
| `app/components/AdminPanel.tsx`   | Panel redakcji                          |
| `app/lib/plans.ts`                | Ceny i długość publikacji               |
| `app/api/checkout/route.ts`       | Tworzenie płatności Stripe              |
| `app/api/stripe/webhook/route.ts` | Weryfikacja webhooków i płatności       |
| `app/api/admin/route.ts`          | Zatwierdzanie, zwroty, edycja           |
| `supabase/schema.sql`             | Tabele i atomowe operacje bazy          |
| `app/warunki-publikacji/page.tsx` | Warunki usługi do dostosowania          |
| `public/images/`                  | Lokalne zdjęcia ilustracyjne z Unsplash |

## 7. Kontrola projektu

```powershell
npm run typecheck
npm test
npm run build
```

Testy działają bez kluczy Stripe i bez konta Supabase. Sprawdzają warunki płatności, podpis webhooka, daty oraz operacje bazy na lokalnym silniku PostgreSQL/WASM. Nie zastępują testowego zakupu w skonfigurowanym sandboxie.
