# Dokumentacja biznesowa i techniczna SKO·LA

## 1. Cel dokumentu
Ten dokument opisuje projekt SKO·LA z dwóch stron:

- biznesowej, czyli po co aplikacja istnieje, dla kogo jest i jaki problem rozwiązuje,
- technicznej, czyli jak jest zbudowana, z jakich modułów się składa i jak przepływa przez nią stan.

Opis opiera się na aktualnym kodzie źródłowym repozytorium, a nie na założeniach projektowych.

## 2. Opis produktu
SKO·LA to edukacyjna aplikacja webowa inspirowana szkolnymi oszczędnościami i marką PKO Bank Polski. Jej główny cel to nauka matematyki i podstaw finansowych przez krótkie, interaktywne lekcje oparte na grywalizacji.

Aplikacja ma dwa odrębne światy wizualne:

- `Junior Saver` dla klas 1-3,
- `Cyber Banker` dla klas 4-8.

Zmiana klasy automatycznie przełącza cały motyw, sposób komunikacji i styl interfejsu, ale nie resetuje postępu użytkownika.

### 2.1. Wartość biznesowa
Wartość produktu opiera się na trzech filarach:

1. Nauka przez działanie - dziecko nie rozwiązuje abstrakcyjnych zadań, tylko wykonuje miniwyzwania osadzone w kontekście skarbonki, bankomatu, kantoru, sejfu czy ryzyka kredytowego.
2. Motywacja przez progres - monety, XP, poziomy, streak i sklep nagród tworzą pętlę nagrody, która zachęca do powrotów.
3. Rozpoznawalny kontekst marki - elementy wizualne i słownictwo są osadzone wokół SKO i PKO Bank Polski.

### 2.2. Docelowy użytkownik
Głównym użytkownikiem jest uczeń szkoły podstawowej.

- Klasy 1-3 korzystają z prostszych, bardziej zabawowych mechanik.
- Klasy 4-8 dostają bardziej „cyberowy” interfejs i trudniejsze zadania matematyczne oraz finansowe.

Nie ma osobnego panelu administratora, profilu rodzica ani realnego systemu kont - aplikacja działa jako pojedyncze doświadczenie edukacyjne.

### 2.3. Główne scenariusze użytkownika
Typowa ścieżka wygląda tak:

1. Użytkownik wchodzi do aplikacji pierwszy raz.
2. Widzi ekran onboardingu, wpisuje imię i wybiera klasę.
3. Aplikacja zapisuje dane lokalnie, ustawia odpowiedni motyw i przekazuje użytkownika na dashboard.
4. Użytkownik wybiera lekcję albo otwiera sklep nagród.
5. Po każdej poprawnej odpowiedzi dostaje monety i XP, a po ukończeniu lekcji - potwierdzenie postępu.
6. Użytkownik może wrócić do ekranu głównego, zmienić klasę albo wyzerować postęp.

Na dashboardzie działa też stały `TopBar`, który pokazuje saldo monet, poziom, streak, aktualną klasę oraz daje szybki dostęp do zmiany klasy i resetu aplikacji.

### 2.4. Mechanika motywacyjna
System grywalizacji składa się z kilku warstw:

- `SKO Coins` - waluta aplikacji.
- `XP` - doświadczenie naliczane za poprawne kroki w lekcjach.
- `Level` - wyliczany z XP.
- `Streak` - liczba kolejnych dni aktywności.
- `Odznaki` - struktura danych jest już przygotowana, ale UI jeszcze ich nie eksponuje.
- `Completed lessons` - lista ukończonych lekcji, również przygotowana pod dalszy rozwój.

Startowe wartości po onboardingu:

- 50 monet,
- streak = 1,
- zapis daty aktywności w `lastActiveDay`.

### 2.5. Rekomendowane KPI biznesowe
Jeśli produkt ma być rozwijany dalej, warto mierzyć:

- procent ukończenia onboardingu,
- procent użytkowników kończących pierwszą lekcję,
- liczbę lekcji ukończonych na sesję,
- średni czas do poprawnej odpowiedzi,
- długość streaka,
- liczbę wejść do sklepu nagród,
- współczynnik powrotu po 1, 7 i 30 dniach.

## 3. Katalog lekcji
Każda lekcja jest osobnym modułem React i korzysta z tego samego silnika ćwiczeń. Poniższa tabela opisuje aktualny katalog.

| ID lekcji | Klasa | Temat | Mechanika | Nagroda bazowa | Liczba rund |
| --- | --- | --- | --- | --- | --- |
| `g1-piggy-bank` | 1 | Wrzuć do skarbonki | Drag and drop monet 1, 2, 5 zł do skarbonki, dokładny wynik | 15 SKO | 5 |
| `g1-pocket-money` | 1 | Tydzień kieszonkowego | Kalendarz dni tygodnia i dodawanie | 15 SKO | 3 |
| `g2-coin-exchange` | 2 | Rozmieniarka | Mnożenie jako powtarzane dodawanie | 20 SKO | 5 |
| `g2-gold-bars` | 2 | Sztabki złota | Odejmowanie w kontekście masy | 20 SKO | 5 |
| `g3-trip-budget` | 3 | Budżet wycieczki | Tabliczka mnożenia i dodawanie w budżecie klasowym | 25 SKO | 3 |
| `g3-change-atm` | 3 | Bankomat reszta | Najpierw obliczenie reszty z 50 zł, potem wydanie jej minimalną liczbą nominałów | 25 SKO | 4 |
| `g4-fractions` | 4 | FRAC.SHARES | Ułamki jako udziały w spółce, procent lub wypłata dywidendy | 25 SKO | 5 |
| `g5-fx-kantor` | 5 | FX.KANTOR | Wymiana walut i mnożenie liczb dziesiętnych | 30 SKO | 5 |
| `g6-vault-vol` | 6 | VAULT.VOL | Objętość sejfu i dzielenie całkowite | 35 SKO | 3 |
| `g7-vault-hack` | 7 | Kalkulator odsetek | Procent składany sterowany suwakami | 50 SKO | 3 |
| `g8-risk` | 8 | RISK.MODEL | Prawdopodobieństwo i wartość oczekiwana straty | 60 SKO | 4 |
| `demo-quiz` | fallback | Pierwsze monety | Prosty quiz matematyczny | 10 SKO | 3 |

### 3.1. Krótki opis lekcji

- `g1-piggy-bank` uczy rozpoznawania monet i dodawania do 12 zł.
- `g1-pocket-money` ćwiczy sumowanie tygodniowych kwot kieszonkowego.
- `g2-coin-exchange` zamienia „ile razy coś się powtarza” na mnożenie.
- `g2-gold-bars` pokazuje odejmowanie na realnym, fizycznym kontekście.
- `g3-trip-budget` scala mnożenie i dodawanie w sytuacji codziennej.
- `g3-change-atm` uczy myślenia o reszcie i doborze nominałów.
- `g4-fractions` buduje intuicję udziałów własnościowych i procentów.
- `g5-fx-kantor` wprowadza kursy walut i zaokrąglenia.
- `g6-vault-vol` łączy geometrię z praktycznym pytaniem „ile paczek się zmieści”.
- `g7-vault-hack` pokazuje nieliniowość procentu składanego.
- `g8-risk` tłumaczy ryzyko kredytowe przez prawdopodobieństwo i stratę oczekiwaną.

## 4. Sklep nagród
Sklep nagród jest częścią pętli motywacyjnej, ale obecnie działa jako demo UX, a nie realny system zamówień.

### 4.1. Zasady działania

- Użytkownik widzi saldo monet w prawym górnym obszarze.
- Po wejściu do sklepu widzi dostępne nagrody i ich ceny.
- Aplikacja blokuje zakup, jeśli użytkownik nie ma wystarczającej liczby monet.
- Po kliknięciu „Wymień” wyświetla się modal z udawaną odpowiedzią API.

### 4.2. Przykładowe nagrody

| Nagroda | Cena |
| --- | --- |
| Maskotka Żyrafka Lokatka | 200 SKO |
| Skarbonka SKO | 350 SKO |
| Notes Lokatki | 120 SKO |
| Plecak SKO·LA | 800 SKO |
| Słuchawki Cyber | 1500 SKO |
| Bon do księgarni | 600 SKO |

### 4.3. Ważne ograniczenie
Sklep nie obsługuje:

- realnej płatności,
- rezerwacji stanu magazynowego,
- integracji z backendem zamówień,
- wysyłki fizycznych nagród.

W kodzie jest to jawnie oznaczone jako demo.

## 5. Ograniczenia obecnego prototypu
Z punktu widzenia biznesu warto znać aktualny zakres:

- postęp przechowywany jest lokalnie w przeglądarce,
- brak logowania i kont użytkowników,
- brak synchronizacji między urządzeniami,
- brak serwera lekcji i wyników,
- brak prawdziwej realizacji sklepu,
- odznaki i ukończone lekcje są zapisane w stanie, ale nie mają jeszcze pełnego ekranu prezentacji.

## 6. Architektura techniczna

### 6.1. Stos technologiczny

| Warstwa | Technologia | Rola |
| --- | --- | --- |
| Frontend | React 18 + TypeScript | Budowa interfejsu |
| Bundler | Vite | Development i produkcja |
| Stylowanie | Tailwind CSS | Layout, kolory, utility classes |
| UI primitives | shadcn/ui + Radix UI | Komponenty bazowe |
| Animacje | Framer Motion | Przejścia, feedback, onboarding |
| Stan aplikacji | Zustand | Lokalny stan grywalizacji |
| Routing | React Router | Podstawowe trasy |
| Notyfikacje | Toaster + Sonner | Komunikaty UI |
| Formularze i walidacja | React Hook Form, Zod | Gotowa infrastruktura, nie w pełni wykorzystana |
| Backend client | Supabase JS | Przygotowana integracja klienta |
| Testy | Vitest + JSDOM | Scaffolding testowy |

### 6.2. Wejście do aplikacji
Punkt startowy wygląda tak:

1. `src/main.tsx` renderuje `App`.
2. `App.tsx` otacza aplikację `QueryClientProvider`, `TooltipProvider`, `Toaster`, `Sonner` i `BrowserRouter`.
3. Router ma tylko dwie trasy:
   - `/` - ekran główny,
   - `*` - `NotFound`.
4. Wewnątrz strony głównej `Index.tsx` aplikacja sama decyduje, czy pokazuje onboarding, dashboard, lekcję czy sklep.

To ważne: lekcje nie są osobnymi adresami URL, tylko stanem wewnętrznym aplikacji.

W `Index.tsx` znajduje się centralna mapa `LESSONS`, która łączy identyfikatory kart na dashboardzie z konkretnymi komponentami lekcji. Dwa wpisy korzystają z aliasów:

- `g5-fx` wskazuje na komponent `g5-fx-kantor`,
- `g7-interest` wskazuje na komponent `g7-vault-hack`.

To rozwiązanie pozwala zachować prostsze nazwy kart na ekranie głównym bez zmiany wewnętrznych identyfikatorów lekcji.

### 6.3. Przepływ aplikacji

1. Jeśli `onboarded === false`, użytkownik widzi `Onboarding`.
2. Po wprowadzeniu imienia i klasy `completeOnboarding()` zapisuje dane do stanu.
3. `ThemeModeProvider` ustawia na `<html>` atrybut `data-mode` i klasę `dark` dla trybu cyber.
4. `Dashboard` wywołuje `registerActivity()` przy montowaniu, dzięki czemu streak opiera się na dniu aktywności.
5. Użytkownik wybiera lekcję lub sklep.
6. Lekcja jest renderowana przez `ExerciseContainer`.
7. Po zakończeniu lekcji użytkownik wraca na dashboard, gdzie stan nadal jest zachowany lokalnie.

### 6.4. Zarządzanie stanem
Centralnym miejscem stanu jest `src/store/useGamificationStore.ts`.

#### Przechowywane dane

- `username`
- `grade`
- `mode`
- `onboarded`
- `coins`
- `xp`
- `level`
- `streak`
- `lastActiveDay`
- `badges`
- `completedLessons`

#### Akcje

- `completeOnboarding(username, grade)`
- `setGrade(grade)`
- `awardCoins(amount)`
- `awardXp(amount)`
- `registerActivity()`
- `earnBadge(badge)`
- `markLessonComplete(lessonId)`
- `reset()`

#### Reguły biznesowe w stanie

- tryb `junior` działa dla klas 1-3,
- tryb `cyber` działa dla klas 4-8,
- poziom jest liczony jako `floor(xp / 100) + 1`,
- streak rośnie tylko o 1 dzień przy codziennej aktywności,
- jeśli przerwa jest większa niż 1 dzień, streak wraca do 1,
- stan jest persistowany w `localStorage` pod kluczem `sko-la-state`.

### 6.5. Silnik lekcji
`ExerciseContainer` jest wspólnym hostem dla wszystkich lekcji.

#### Co robi ten komponent

- renderuje nagłówek lekcji,
- pokazuje pasek postępu,
- obsługuje przechodzenie między krokami,
- nalicza nagrodę za poprawną odpowiedź,
- pokazuje overlay z sukcesem lub błędem,
- zapisuje ukończenie lekcji,
- po zakończeniu wyświetla kartę końcową.

#### Algorytm nagrody
Nagroda monetowa zależy od szybkości odpowiedzi:

- mniej niż 3 sekundy - mnożnik `2.0x`,
- mniej niż 6 sekund - mnożnik `1.5x`,
- mniej niż 12 sekund - mnożnik `1.2x`,
- powyżej 12 sekund - mnożnik `1.0x`.

W praktyce:

- `baseReward` jest zdefiniowany per lekcja,
- poprawna odpowiedź przynosi `awardCoins(round(baseReward * multiplier))`,
- za każdy poprawny krok użytkownik dostaje też `20 XP`.

#### Obsługa błędów

- błędna odpowiedź uruchamia overlay z błędem,
- krok jest powtarzany,
- komponent dziecka jest remountowany przez inkrementację `attempt`,
- podwójne wysłanie odpowiedzi jest blokowane, dopóki overlay jest aktywny.

### 6.6. Lekcje jako osobne moduły
Każda lekcja:

- ma własny plik,
- ustawia `lessonId`,
- definiuje `baseReward`,
- podaje liczbę kroków,
- przekazuje renderer kroku do `ExerciseContainer`.

Niektóre lekcje generują rundy losowo przy montowaniu, a inne mają rundy statyczne. To oznacza, że:

- jedna sesja lekcji jest spójna,
- po ponownym wejściu do lekcji zestaw zadań może się zmienić,
- poziom trudności jest kontrolowany przez zakresy w generatorach rund.

### 6.7. Warstwa wizualna i motywy
Styling opiera się na CSS variables w `src/index.css`.

#### Motywy

- `data-mode="junior"` - jasny, miękki, pastelowy, z dużymi zaokrągleniami.
- `data-mode="cyber"` - ciemny, neonowy, z siatką tła i terminalowym językiem UI.

#### Tailwind
`tailwind.config.ts` mapuje tokeny CSS na klasy semantyczne:

- `bg-primary`
- `text-foreground`
- `bg-card`
- `text-success`
- `bg-gradient-primary`
- `shadow-bouncy`

To oznacza, że komponenty nie używają sztywno wpisanych kolorów, tylko pracują na tokenach.

#### Typografia

- junior: `Nunito` i `Quicksand`,
- cyber: `Press Start 2P` i `JetBrains Mono`.

### 6.8. Interakcje i animacje
Animacje są używane konsekwentnie w całej aplikacji:

- wejścia kart i ekranów,
- delikatne pływanie monet,
- feedback po odpowiedzi,
- animacje sklepowe,
- pulsowanie i glitch w trybie cyber,
- przejścia w onboarding, dashboardach i lekcjach.

To nie są dekoracje, tylko część mechaniki uczenia: animacja ma wzmacniać odpowiedź i podpowiedź, a nie tylko wyglądać atrakcyjnie.

### 6.9. Integracja z Supabase
W repozytorium istnieje przygotowany klient Supabase:

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

#### Co jest skonfigurowane

- klient korzysta z `VITE_SUPABASE_URL`,
- klient korzysta z `VITE_SUPABASE_PUBLISHABLE_KEY`,
- sesje auth są ustawione na `localStorage`,
- automatyczne odświeżanie tokenów jest włączone.

#### Co jest ważne technicznie

- plik `types.ts` ma aktualnie pusty schemat tabel, widoków, funkcji i enumów,
- w aktualnym UI nie ma jeszcze realnych zapytań do Supabase,
- integracja jest przygotowana pod przyszły backend, ale nie zasila jeszcze głównego flow aplikacji.

### 6.10. Edge Function `tts`
W katalogu `supabase/functions/tts` znajduje się funkcja Deno, która:

- przyjmuje JSON z polem `text`,
- opcjonalnie przyjmuje `voiceId`,
- wywołuje ElevenLabs Text-to-Speech,
- zwraca surowy plik MP3.

To rozwiązanie jest opisane jako narzędzie do wygenerowania voiceoveru do materiału promocyjnego, a nie jako część głównej logiki aplikacji.

#### Zmienne i zależności

- wymaga `ELEVENLABS_API_KEY` po stronie środowiska Supabase,
- `supabase/config.toml` ma `verify_jwt = false` dla tej funkcji,
- jeśli miałaby być wystawiana publicznie, powinna zostać dodatkowo zabezpieczona.

### 6.11. Konfiguracja środowiska
Aktualne nazwy zmiennych środowiskowych:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID` - obecny w `.env`, ale nieużywany bezpośrednio przez frontendowy klient.

### 6.12. Skrypty
Z `package.json` wynikają następujące polecenia:

- `npm run dev` - uruchomienie środowiska deweloperskiego,
- `npm run build` - build produkcyjny,
- `npm run build:dev` - build w trybie development,
- `npm run preview` - lokalny podgląd buildu,
- `npm run lint` - linting,
- `npm run test` - uruchomienie testów,
- `npm run test:watch` - tryb watch.

### 6.13. Testy
Obecnie repozytorium ma tylko minimalny scaffolding testowy:

- `src/test/setup.ts` ustawia `jest-dom` i mock `matchMedia`,
- `src/test/example.test.ts` jest przykładowym testem,
- `vitest.config.ts` i `jsdom` są gotowe do rozbudowy.

Na ten moment testy nie pokrywają jeszcze zachowań biznesowych lekcji, sklepu ani stanu grywalizacji.

## 7. Struktura katalogów

| Katalog / plik | Rola |
| --- | --- |
| `src/pages` | Główne strony i trasa 404 |
| `src/components/sko` | Logika i UI SKO·LA |
| `src/components/sko/lessons` | Konkretne lekcje |
| `src/components/ui` | Komponenty bazowe shadcn/ui |
| `src/store` | Zustand - stan grywalizacji |
| `src/hooks` | Hooki pomocnicze, np. podpowiedzi maskotki |
| `src/providers` | Provider trybu wizualnego |
| `src/integrations/supabase` | Klient i typy Supabase |
| `src/lib` | Małe helpery, np. `cn()` |
| `supabase/functions` | Edge functions, obecnie `tts` |
| `tailwind.config.ts` | Definicja tokenów i animacji |
| `src/index.css` | CSS variables i dwa motywy |
| `src/App.css` | Pozostałość po szablonie startowym, nie jest częścią głównego UI |

## 8. Jakość, dostępność i UX

- Większość interaktywnych elementów ma `aria-label`.
- Wejścia liczbowe używają `inputMode="numeric"` lub `inputMode="decimal"`.
- Obrazy mają `alt`.
- Layout jest responsywny i działa zarówno na małych ekranach, jak i na desktopie.
- Animacje są obecne, ale nie dominują treści.
- Tryb cyber ma subtelny grid i terminalowy język, co wzmacnia odróżnienie od juniora.

## 9. Rekomendacje rozwoju
Najbardziej naturalne następne kroki to:

1. Dodać prawdziwe zapisywanie postępu do backendu.
2. Wprowadzić ekran odznak i historii ukończonych lekcji.
3. Podłączyć realny system nagród zamiast modala demo.
4. Rozszerzyć testy o logikę punktacji, streaka i walidację lekcji.
5. Dodać analitykę zdarzeń biznesowych.
6. Ujednolicić integrację Supabase tak, aby zasilała główny flow aplikacji.

## 10. Podsumowanie
SKO·LA jest już dobrze zdefiniowanym prototypem edukacyjnym:

- ma jasną segmentację wiekową,
- ma spójny model grywalizacji,
- ma sensowny katalog lekcji,
- ma oddzielny sklep nagród,
- ma przygotowaną, ale jeszcze niewykorzystaną warstwę backendową,
- ma solidny system motywów i animacji.

Najważniejsze ograniczenie na dziś to fakt, że całość działa frontendowo i lokalnie. Z perspektywy produktu to dobry etap prototypowy, ale przed wdrożeniem produkcyjnym potrzebna będzie synchronizacja danych, realny backend i dopięcie nagród.
