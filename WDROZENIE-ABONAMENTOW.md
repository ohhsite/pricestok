# PriceStok — wdrożenie panelu i płatności

## Panel redakcji

W bieżącym projekcie Supabase wykonano również `supabase/panel.sql`. Przy przenoszeniu strony do innego projektu uruchom ten plik po `schema.sql` i `abonamenty.sql`.

- W **Nowa promocja** możesz wgrać zdjęcie JPG, PNG lub WebP do 3 MB. Zdjęcie pojawia się w tabeli, katalogu i na stronie promocji.
- Daty **Od** i **Do** są widoczne w tabeli. Filtr **Po terminie** pokazuje wygasłe oferty.
- W **Zgłoszenia od firm** przenoś zgłoszenia między listami **Nowe** i **Archiwum**.
- W **Lokalne firmy** dodaj nazwę, kategorię, opis, adres i opcjonalny link. Firmę zobaczysz pod `/firmy` i wybierzesz w formularzu promocji.

Jeżeli panel nadal zgłasza błąd odczytu, sprawdź, czy `SUPABASE_URL` i klucz `sb_secret_...` pochodzą z tego samego projektu. Po zmianie `.env.local` uruchom ponownie serwer. Kod błędu z panelu pozwala ustalić przyczynę bez udostępniania klucza.

Cennik: jednorazowa publikacja jednej promocji **50 zł netto za do 30 dni od akceptacji, bez odnowienia**; abonament jednej aktywnej promocji **50 zł netto miesięcznie**; osobna podstrona firmy **200 zł netto jednorazowo**. Podstrona nie wymaga abonamentu. Przy VAT 23% kwoty brutto wynoszą 61,50 zł za jednorazową promocję, 61,50 zł za miesiąc abonamentu i 246 zł za podstronę. Możliwe jest ustawienie właściwego zwolnienia z VAT. Rozliczenie abonamentu zaczyna się przy zakupie; oferta wymaga akceptacji redakcji. Zmiany promocji przez redakcję w dotychczasowym panelu.

Aktualizacja przywracająca płatności jednorazowe została wykonana także w nowym projekcie Supabase. Funkcja akceptacji ustawia koniec jednorazowej publikacji raz, od akceptacji redakcji. Powtórzone powiadomienia i ponowna akceptacja nie przedłużają okresu. Wygaśnięcie jest sprawdzane przy wyświetlaniu katalogu. Zakup jednorazowy używa Stripe Checkout `mode: payment` i nigdy nie tworzy subskrypcji.

## Co wgrać do GitHub

Zachowaj dokładnie poniższe ścieżki. `page.tsx` i `route.ts` w różnych folderach to różne pliki.

| Plik                              | Działanie                                           |
| --------------------------------- | --------------------------------------------------- |
| `app/lib/billing.ts`              | Dodaj: logika płatności i subskrypcji               |
| `app/api/abonament/route.ts`      | Dodaj: zakup, panel płatności, weryfikacja i zwroty |
| `app/components/Billing.tsx`      | Dodaj: formularz i panel abonamentów                |
| `app/wizytowka/[id]/page.tsx`     | Dodaj: osobna podstrona firmy                       |
| `app/dla-firm/page.tsx`           | Podmień: nowy cennik i formularz                    |
| `app/kup-promocje/page.tsx`       | Podmień: przekierowanie do nowego cennika           |
| `app/api/checkout/route.ts`       | Podmień: wyłączenie starych zakupów 49/99 zł        |
| `app/api/stripe/webhook/route.ts` | Podmień: obsługa nowych i starych transakcji        |
| `app/components/AdminPanel.tsx`   | Podmień: dodatkowa sekcja abonamentów               |
| `app/lib/repository.ts`           | Podmień: widoczność według opłaconego abonamentu    |
| `app/sitemap.ts`                  | Podmień: indeksowanie płatnych podstron firm        |
| `app/warunki-publikacji/page.tsx` | Podmień: warunki nowego cennika                     |
| `.env.example`                    | Szablon konfiguracji, bez sekretów                  |
| `supabase/abonamenty.sql`         | Aktualizacja bazy; wykonana już w nowym projekcie   |

`package.json` i instalowane biblioteki pozostają zgodne z poprzednią paczką. Nie kopiuj plików do jednego folderu.

## Supabase — nowy, osobny projekt

Utworzony projekt: **Bialystok na plus**, organizacja **ohhsite's Org** (ta sama co Choinki), plan Free, region Frankfurt. W momencie tworzenia Supabase podał koszt **0 USD/miesiąc**. Nie zmieniano organizacji ani projektu LOFIT, ani danych projektu Choinki. Limity i ewentualne przyszłe przejście na płatny plan są niezależną decyzją.

Panel projektu: https://supabase.com/dashboard/project/ukdekwmcbdxbwdymbyib

URL API: `https://ukdekwmcbdxbwdymbyib.supabase.co`

W nowym projekcie wykonano dotychczasowy `schema.sql` oraz `abonamenty.sql`. Tabele ofert, zgłoszeń, statystyk, starych zakupów i abonamentów są gotowe. RLS jest aktywny; publiczne role nie mają bezpośredniego dostępu. Dane pobierają autoryzowane endpointy serwera.

### Dokończenie połączenia na Vercel

W Vercel → Project → Settings → Environment Variables ustaw:

| Zmienna               | Wartość                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `SUPABASE_URL`        | `https://ukdekwmcbdxbwdymbyib.supabase.co`                       |
| `SUPABASE_SECRET_KEY` | Klucz `sb_secret_...` z Settings → API Keys tego NOWEGO projektu |
| `ADMIN_EMAIL`         | E-mail administratora utworzonego w nowym projekcie              |
| `SITE_URL`            | Dokładny adres HTTPS Twojej strony, bez końcowego ukośnika       |
| `PAYMENTS_ENABLED`    | `false` do czasu konfiguracji nowego Stripe                      |
| `SALES_TERMS_READY`   | `false` do zatwierdzenia danych i warunków                       |

Sekret Supabase wpisz bezpośrednio w Vercel. Nie przesyłaj go na czacie ani do GitHub. Nie dodawaj prefiksu `NEXT_PUBLIC_`. Dostępne połączenie nie udostępnia klucza sekretnego ani ustawień Vercel, dlatego tych dwóch kroków nie wykonano automatycznie.

W Supabase → Authentication → Users → Add user utwórz administratora z własnym e-mailem i hasłem; zaznacz potwierdzenie e-maila. Taki sam e-mail wpisz w `ADMIN_EMAIL`. Potem zrób **Redeploy w Vercel** i zaloguj się na `/panel`.

## Stripe — po utworzeniu osobnego konta

1. Na razie sprzedaż jest wyłączona. Nie utworzono żadnych obciążeń ani produktów na dotychczasowym koncie Stripe.
2. Skonfiguruj osobny sandbox/testowe konto, dane sprzedawcy i walutę PLN. Kod sam tworzy odpowiednią cenę miesięczną lub jednorazową przez Checkout. Każdy wariant ma własny Product.
3. Wpisz serwerowy klucz ograniczony do wymaganych operacji jako `STRIPE_SECRET_KEY`. Potrzebne są Checkout Sessions, Customers, Products/Prices, Subscriptions, Invoices/Invoice Payments, Payment Intents/Charges, Refunds, Tax Rates oraz Billing Portal Sessions/Configurations. Dla konfiguracji portalu i zwrotów potrzebny jest zapis; dla odczytywanych obiektów odczyt. Klucz nigdy nie trafia do przeglądarki.
4. Ustaw `BILLING_VAT_PERCENT=23` i `STRIPE_PL_VAT_RATE_ID=txr_...`, jeśli rozliczasz VAT 23%. Stawkę utwórz w Stripe jako aktywną, Polska (`PL`), 23%, **exclusive**. Przy właściwym zwolnieniu ustaw `BILLING_VAT_PERCENT=0` i pozostaw ID stawki puste. Puste pole stawki blokuje sprzedaż. Kod weryfikuje stawkę przed Checkout i dodaje ją także do odnowień.
5. Ta wersja obsługuje polskie firmy z NIP i ręczną stawkę VAT. Stripe Tax nie jest włączony. Jeśli później włączysz Stripe Tax dla sprzedaży wielokrajowej, najpierw skonfiguruj potwierdzone rejestracje i usuń ręczne `tax_rates` — nie łącz obu sposobów. Dokumenty Stripe nie zastępują konfiguracji księgowości/KSeF.
6. Ustaw `ORDER_TOKEN_SECRET` na losowy sekret co najmniej 32 znaki. Nie zmieniaj go bez potrzeby. Link do statusu i panelu płatności zawiera indywidualny token; firma powinna go zachować. Link jest pokazywany po powrocie z Checkout. Faktury pobierane są w portalu Stripe; wysyłkę e-mail faktur i przypomnień włącz w ustawieniach Stripe.
7. Endpoint webhooka: `https://TWOJA-DOMENA/api/stripe/webhook`. Ustaw zwrócony sekret jako `STRIPE_WEBHOOK_SECRET` i wybierz zdarzenia:
   - `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`
   - `invoice.paid`, `invoice.payment_failed`, `invoice.payment_action_required`
   - `charge.refunded`, `charge.dispute.created`, `radar.early_fraud_warning.created`
8. Uzupełnij `SELLER_NAME`, `SELLER_ADDRESS`, `SELLER_TAX_ID`, `SELLER_CONTACT_EMAIL` i zatwierdź warunki/prywatność (`SALES_TERMS_READY=true`).
9. Dopiero po testach ustaw `PAYMENTS_ENABLED=true` i wykonaj Redeploy. Produkcja wymaga kluczy i webhooka live oraz stawki VAT live.

Portal płatności jest tworzony z anulowaniem **na koniec okresu**, historią faktur i zmianą metody płatności. Ceny planów nie są edytowalne przez klienta. Abonament po anulowaniu pozostaje widoczny do końca opłaconego okresu, a po nieudanym odnowieniu znika. Dokładny czas końca jest sprawdzany przy odczycie; nie potrzeba osobnego zadania cron. Powrót z Checkout nigdy sam nie aktywuje publikacji.

## Moderacja i zwroty

`/panel` → „Abonamenty i płatne podstrony”. Sprawdź dane i źródło, następnie zatwierdź. Do momentu zatwierdzenia zakup nie jest publikowany. Odrzucenie anuluje abonament i zleca zwrot ostatniej wpłaty. Jeśli redakcja zwlekała do kolejnych odnowień, dodatkowe starsze wpłaty trzeba zwrócić w Stripe. Dlatego zgłoszenia powinny być oceniane przed następnym odnowieniem. Spory, pełne zwroty i wczesne sygnały oszustwa blokują publikację oraz wyłączają dalsze odnowienie; te stany wymagają sprawdzenia przez właścicielkę.

Podstrona firmy ma adres `/wizytowka/ID`, osobne metadane, canonical i dane LocalBusiness. Trafia do mapy strony po opłaceniu i akceptacji. Jest utrzymywana w działającym serwisie bez miesięcznych opłat; ta wersja nie wyłącza jej automatycznie.

## Weryfikacja

Testy lokalne obejmują akceptację tylko po opłaceniu, odnowienia, powtórzone/opóźnione zdarzenia, blokadę po sporze, brak dostępu publicznych ról oraz podpis webhooka Stripe. W nowym projekcie wykonano też transakcyjny test zapisu i akceptacji, po którym dane testowe wycofano. Bez kluczy nowego Stripe nie wykonano rzeczywistego zakupu testowego ani end-to-end płatności. Po wdrożeniu sprawdź osobno zakup abonamentu, odnowienie, błąd płatności, anulowanie na koniec okresu, odrzucenie i zwrot oraz podstronę za 200 zł netto.
