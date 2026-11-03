# Aktualizacja pakietów PriceStok

1. W Supabase SQL Editor uruchom aktualny plik `supabase/abonamenty.sql`. Przy nowej bazie najpierw wykonaj `supabase/schema.sql` oraz pozostałe migracje panelu i społeczności.
2. Wdróż aktualne źródła na Vercel z dotychczasową konfiguracją Supabase i Stripe. Ceny pakietów pochodzą z kodu, a Checkout tworzy pozycję jednorazową.
3. W trybie testowym Stripe kup pakiet, sprawdź webhook, wejdź do panelu i zatwierdź publikację. Sprawdź termin, korektę oraz link publiczny.
4. W panelu pod „Zamówienia, płatności i publikacje” wybierz „Edytuj treść publikacji”. Korekty i wymiany obsługuje redakcja na podstawie numeru zamówienia. Pakiet od 3 miesięcy pozwala na pierwszą wymianę po 30 dniach i kolejną po następnych 30 dniach.

Nowy cennik nie przyjmuje nowych subskrypcji. Wcześniejsze zamówienia i ich statusy pozostają w bazie. Aktywne wcześniejsze subskrypcje można zakończyć przez Stripe lub link zarządzania zamówieniem.
