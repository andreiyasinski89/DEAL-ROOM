import type { PersonaText } from "../types";

const A = "Analityk";
const D = "Decydent";
const E = "Ekspresyjny";
const P = "Mediator";

const VOC: Record<string, string> = {"irina": "Ireno", "maxim": "Maksymie", "svetlana": "Swietłano", "artem": "Artemie", "olga": "Olgo", "dmitry": "Dymitrze", "natalia": "Natalio", "pavel": "Pawle", "elena": "Heleno", "viktor": "Wiktorze", "anna": "Anno", "sergey": "Sergiuszu", "marina": "Maryno", "roman": "Romanie", "yulia": "Julio", "alexey": "Aleksy", "tatyana": "Tatiano", "igor": "Igorze", "vera": "Wiero", "kirill": "Cyrylu", "anatoly": "Anatolu", "ksenia": "Ksenio", "gleb": "Glebie", "polina": "Polino", "stanislav": "Stanisławie", "larisa": "Laryso", "denis": "Denisie", "alla": "Allo", "timur": "Timurze", "zoya": "Zojo"};

const t = (name: string, profession: string, psychotype: string, pain: string, hiddenMotive: string, redButton: string, goldenKey: string): PersonaText => ({
  name, profession, psychotype, pain, hiddenMotive, redButton, goldenKey,
});

/** Polskie teksty 30 person klientów (id jak w data/personas.ts). */
const base: Record<string, PersonaText> = {
  irina: t("Irena", "księgowa", A, "Spędza godziny na szukaniu korzystnych cen", "Chce częściej być z rodziną, ale boi się powtórzyć błąd przyjaciółki", "Kłamstwo i presja, obietnice „złotych gór”", "Uczciwość, liczby na jej własnym przykładzie, prawo do namysłu"),
  maxim: t("Maksym", "właściciel warsztatu samochodowego", D, "Brak czasu i zbyt wiele zadań na jedną parę rąk", "Chce się rozwijać, ale nie ufa cudzym obietnicom", "Długie wstępy i „lanie wody”", "Krótka korzyść w liczbach i konkretny następny krok"),
  svetlana: t("Swietłana", "nauczycielka literatury", P, "Zmęczona brakiem pieniędzy i poczuciem, że wszystko ją omija", "Boi się potępienia ze strony dzieci i koleżanek z pracy", "Napastliwość i ostry ton", "Łagodne tempo, troska, historie takich samych ludzi"),
  artem: t("Artem", "social media manager", E, "Nuda w pracy, chce jaskrawych projektów", "Chce uznania i statusu wśród znajomych", "Nudziarstwo i suche tabelki", "Pomysł, historia i możliwość wyróżnienia się"),
  olga: t("Olga", "lekarka rodzinna", A, "Ciągłe zmęczenie i brak czasu dla siebie", "Sceptycznie podchodzi do wszelkich suplementów, ale sama czuje wypalenie", "Pseudonaukowe obietnice i „leczy wszystko”", "Skład, badania i uczciwe „to nie lek”"),
  dmitry: t("Dymitr", "dyrektor ds. zakupów", D, "Presja terminów i budżetu z góry", "Potrzebuje udanego pilotażu, żeby dostać awans", "Manipulacje i zniżki „tylko dziś”", "Ryzyko pod kontrolą, zrozumiałe wskaźniki i terminy"),
  natalia: t("Natalia", "administratorka salonu urody", E, "Dużo kontaktów z ludźmi, mało dochodu", "Marzy o własnym studiu", "Chłodny, oficjalny ton", "Emocje, uwaga skierowana osobiście do niej i ładne przykłady"),
  pavel: t("Paweł", "programista", A, "Siedząca praca i chroniczny brak wolnego czasu", "Chce drugiego źródła dochodu, ale nie wierzy w „schematy”", "Manipulacje i „wszyscy tak robią”", "Logika, przejrzyste warunki i możliwość samodzielnego sprawdzenia"),
  elena: t("Helena", "mama na urlopie wychowawczym", P, "Nie ma własnych pieniędzy i czuje zależność od męża", "Chce niezależności, ale boi się konfliktu w domu", "Presja i umniejszanie jej wątpliwości", "Bezpieczny start, wsparcie i elastyczny grafik"),
  viktor: t("Wiktor", "właściciel sklepu", D, "Spadek sprzedaży i zmęczenie „doradcami”", "W głębi szuka sposobu, by wyprzedzić konkurentów", "Gdy się go poucza", "Partnerski ton, korzyść dla biznesu i konkrety"),
  anna: t("Anna", "trenerka fitness", E, "Niestabilny dochód i wypalenie", "Chce mieć markę i własne produkty", "Krytyka jej pasji", "Inspiracja, społeczność i uznanie"),
  sergey: t("Sergiusz", "inżynier w fabryce", A, "Pensja stoi w miejscu", "Boi się ryzykować oszczędnościami", "Pośpiech i mgliste sformułowania", "Dokumenty, wyliczenia i czas na sprawdzenie"),
  marina: t("Maryna", "pielęgniarka", P, "Nocne zmiany i ciągłe zmęczenie", "Chce zmienić pracę, ale brakuje jej pewności siebie", "Agresywna sprzedaż", "Zaangażowanie, zachęta i małe kroki"),
  roman: t("Roman", "kierownik działu sprzedaży", D, "Wskaźniki KPI i presja na zespół", "Sprawdza cię jako sprzedawcę — liczą się dla niego techniki", "Słabe, niepewne odpowiedzi", "Pewność siebie, jasność i szacunek dla jego doświadczenia"),
  yulia: t("Julia", "blogerka beauty", E, "Potrzebuje treści i integracji reklamowych", "Chce uczciwej współpracy, a nie „jeszcze jednej reklamy”", "Szablonowe skrypty i pochlebstwa", "Żywa rozmowa i swoboda twórcza"),
  alexey: t("Aleksy", "kierowca tira", P, "Rzadko bywa w domu i tęskni za rodziną", "Marzy o większej ilości czasu z dziećmi", "Skomplikowane terminy i pośpiech", "Proste słowa i troska o jego rodzinę"),
  tatyana: t("Tatiana", "główna księgowa", A, "Sprawozdawczość i wieczne gorączkowe terminy", "Szuka przejrzystości i ochrony przed ryzykiem", "Obietnice bez dokumentów", "Umowa, rejestr i staranna praca z liczbami"),
  igor: t("Igor", "właściciel restauracji", D, "Rosnące koszty i brak ludzi", "Chce obniżyć koszty, ale nie chce wyjść na słabego", "Błagalne prośby i niepewność", "Szybki efekt finansowy i jasne warunki"),
  vera: t("Wiera", "emerytka, była nauczycielka", P, "Mała emerytura i samotność", "Boi się, że ją oszukają, jak sąsiadkę", "Pośpiech, presja i trudne słowa", "Cierpliwość, warunki na piśmie i ciepłe podejście"),
  kirill: t("Cyryl", "student i początkujący założyciel startupu", E, "Brak pieniędzy i doświadczenia, ale mnóstwo pomysłów", "Chce udowodnić rodzinie, że poradzi sobie sam", "Protekcjonalny ton", "Wyzwanie, perspektywa rozwoju i uznanie jego pomysłów"),
  anatoly: t("Anatol", "emeryt, były wojskowy", P, "Skromna emerytura i chęć zobaczenia świata", "Boi się wyjść na naiwnego przed dziećmi", "Pośpiech i żargon", "Spokojny ton, warunki na piśmie i szacunek dla jego doświadczenia"),
  ksenia: t("Ksenia", "menedżerka HR", A, "Wielu ludzi wokół, mało czasu dla siebie", "Podejrzewa „schematy”, ale kocha podróże", "Manipulacje i mgliste obietnice", "Przejrzyste warunki i uczciwe „nie dla każdego”"),
  gleb: t("Gleb", "trader", D, "Przywykł liczyć ryzyko i stopę zwrotu", "Szuka każdej asymetrii na swoją korzyść", "Emocje zamiast liczb", "Jasne wyliczenie i uznanie ryzyka"),
  polina: t("Polina", "graficzka", E, "Freelance i nieregularne pieniądze", "Marzy o podróżowaniu i pracy z różnych krajów", "Szablonowe prezentacje", "Żywa historia i ładna oprawa wizualna"),
  stanislav: t("Stanisław", "chirurg", D, "Mało urlopów, dużo odpowiedzialności", "Nie znosi nieścisłości i „lania wody”", "Niepewność i wymijanie", "Zwięzłość, precyzja i szacunek dla jego czasu"),
  larisa: t("Larysa", "kucharka w stołówce szkolnej", P, "Ciężka praca i niska pensja", "Boi się utraty tych nielicznych zaoszczędzonych pieniędzy", "Presja i skomplikowane warunki", "Cierpliwość, proste słowa i wyliczenie na piśmie"),
  denis: t("Denis", "menedżer w banku", A, "Zawodowo liczy cudze ryzyko", "Sceptyk wobec każdej „korzyści”", "Rozmyte obietnice zwrotu", "Liczby, dokumenty i uznanie ograniczeń"),
  alla: t("Alla", "właścicielka kwiaciarni", E, "Sezonowość i niestabilne przychody", "Chce pięknego życia, ale nie chce ryzykować sklepem", "Chamska napastliwość", "Ciepły kontakt i zrozumiała korzyść"),
  timur: t("Timur", "przedsiębiorca, flota taksówek", D, "Rutyna i bieżąca działalność bez dni wolnych", "Szuka dodatkowego, skalowalnego źródła dochodu", "Obietnice „złotych gór”", "Konkretne liczby i uczciwe ryzyka"),
  zoya: t("Zoja", "babcia, emerytka", P, "Chce pojechać z wnukami, ale oszczędza", "Boi się, że ją oszukają, jak znajomą", "Pośpiech, presja, trudne terminy", "Warunki na piśmie i spokojne tempo"),
};

export const personas: Record<string, PersonaText> = Object.fromEntries(Object.entries(base).map(([id, p]) => [id, { ...p, voc: VOC[id] }]));
