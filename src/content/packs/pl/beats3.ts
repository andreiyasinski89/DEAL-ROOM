import type { Beat, BeatTag } from "../../data/beats";

/** Polska baza zastrzeżeń, część 3. */
export const beats3: Partial<Record<BeatTag, Beat>> = {
  not_salesperson: {
    label: "„Nie jestem handlowcem”", family: "other",
    soft: ["Nie umiem sprzedawać. To na pewno nie dla mnie.", "Sprzedawanie znajomym to nie moja bajka."],
    hard: ["Nie jestem handlowcem i nie chcę nim być. Niedobrze mi od tej „sprzedaży”.", "Jeśli trzeba kogoś namawiać, od razu wysiadam."],
    opts: [
      { t: "Dobrze, że tak mówisz: natrętnych sprzedawców nie brakuje. Pokażę bez „wciskania”.", tech: "Przyznanie racji + przeformułowanie", note: "Przyjęto obawę i przeformułowano „sprzedaż”." },
      { t: "Można zacząć jako zwykły klient: korzystać z konta dla siebie. Biznes jest dobrowolny. Opowiedzieć?", tech: "Alternatywny start", note: "Dobrze, ale bez pytania o to, czego dokładnie boi się klient." },
      { t: "Sprzedawać każdy umie, to bardzo proste, nie ma tu nic trudnego, każdy da radę w tydzień.", mistake: "Ignorowanie zastrzeżenia", note: "Jeśli to „proste”, klient poczuje się głupio." },
      { t: "Jeśli boisz się sprzedaży, to po co w ogóle {przyszedłeś|przyszłaś}? Tu bez tego się nie da, więc albo się uczysz, albo nie marnuj czasu.", mistake: "Presja", note: "Pytanie brzmi jak wyrzut." },
    ],
    push: ["I ty też. Nie, ja tak nie umiem.", "Nie muszę nikogo namawiać."],
    rec: [
      { t: "Spróbuj bez zobowiązań: pokażę, jak wyglądają pierwsze trzy kroki. Jeśli to nie dla ciebie — po prostu powiesz.", tech: "Demonstracja bez zobowiązań", note: "Próbny krok bez ryzyka obniża barierę." },
      { t: "Nauczysz się, nikt nie rodzi się mistrzem.", mistake: "Ignorowanie zastrzeżenia", note: "Szablonowa fraza nie usuwa strachu." },
      { t: "No to rzeczywiście {nie powinieneś|nie powinnaś} się tym zajmować.", mistake: "Rezygnacja z klienta", note: "Zamknięto rozmowę za klienta." },
    ],
    bye: "Nie dla mnie. Do widzenia.", why: "Strach przed sprzedażą nie został zdjęty — klient poczuł presję.",
  },
  proof_request: {
    label: "„Udowodnij”", family: "trust",
    soft: ["A są jakieś dowody, że to działa?", "Można coś zobaczyć — umowę, warunki, opinie?"],
    hard: ["Pokaż umowę, warunki, opinie — wszystko, co można sprawdzić. Inaczej rozmowa nie ma sensu.", "Daj dokumenty teraz, a nie obietnice."],
    opts: [
      { t: "Tak, lepiej sprawdzić samemu. Oto {proof}. Co jest dla ciebie najważniejsze?", tech: "Dowód + pytanie", note: "Dano coś weryfikowalnego i dopytano, co ważne dla klienta." },
      { t: "Mogę przesłać {proof} na e-mail, obejrzysz na spokojnie.", tech: "Dowody na piśmie", note: "Dobrze, ale bez dialogu." },
      { t: "Wszyscy moi klienci są zadowoleni, możesz zapytać każdego — nikt nigdy się nie skarżył i nie będzie żałować.", mistake: "Puste zapewnienia", note: "Bez konkretów i kontaktów do sprawdzenia to puste słowa." },
      { t: "Mogę powiedzieć na słowo: u nas wszystko jest idealnie i bez problemów.", mistake: "Fałszywa obietnica", note: "„Idealnie i bez problemów” to czerwona flaga dla analityka." },
    ],
    push: ["Słowa to nie dowody. Potrzebuję faktów.", "Znowu bez papierów. Nie."],
    rec: [
      { t: "Słusznie. Oto {proof}. Powiedz, czego dokładnie brakuje, a znajdę.", tech: "Zgoda + konkrety", note: "Zgoda z żądaniem klienta jest silniejsza niż obrona." },
      { t: "Jesteś zbyt wybredn{y|a}, po prostu spróbuj.", mistake: "Presja", note: "Oskarżenie o wybredność zamyka dialog." },
      { t: "Nie mam teraz pod ręką, ale uwierz.", mistake: "Unik", note: "Odpowiedź bez faktów potwierdza podejrzenie." },
    ],
    bye: "Bez dowodów rozmowa skończona.", why: "Klient żądał faktów, a dostał zapewnienia.",
  },
  income_question: {
    label: "„Ile zarabiasz?”", family: "trust",
    soft: ["A ile sam zarabiasz na tym?", "Czy można realnie zarobić na sieci? Ile ci wychodzi?"],
    hard: ["Ile osobiście zarabiasz? Podaj liczbę. Tylko uczciwie, bez „potencjału”.", "Pokaż swój prawdziwy dochód albo nie opowiadaj o biznesie."],
    opts: [
      { t: "Odpowiem uczciwie: mój poziom zależy od wysiłku, gwarancji dochodu nie ma. Opowiedzieć, od czego zależy wynik?", tech: "Uczciwość + ramy bez gwarancji", note: "Uczciwa odpowiedź bez upiększeń to najsilniejszy dowód." },
      { t: "Podam tylko własne liczby, takie jak są, bez obietnic dla ciebie. Mogę pokazać strukturę wypłat z dokumentów firmy.", tech: "Przeniesienie na dokumenty", note: "Słusznie, ale unik od osobistego pytania jest wyczuwalny." },
      { t: "Więcej, niż myślisz. Uwierz, to bardzo opłacalne.", mistake: "Unik / przechwałki", note: "Mgliste „więcej, niż myślisz” budzi podejrzenia." },
      { t: "Osobiście zarabiam bardzo dużo, a ty możesz zarabiać tyle samo już za kilka miesięcy, jeśli po prostu będziesz robić to, co ja.", mistake: "Fałszywa obietnica dochodu", note: "Obietnica dochodu to naruszenie etyki i prawa reklamy." },
    ],
    push: ["Nie odpowiedziałeś na moje pytanie. Czyli nie ma się czym chwalić?", "Liczby miały być. Gdzie są?"],
    rec: [
      { t: "Słusznie. Powiem wprost: mój wynik jest taki i taki, a jest skutkiem moich starań i stażu. Początkujący zarabia mniej i nie ma obowiązku zarabiać w ogóle.", tech: "Uczciwa odpowiedź", note: "Bezpośrednia odpowiedź przywraca zaufanie." },
      { t: "To nie ma znaczenia, liczy się perspektywa.", mistake: "Unik", note: "Zignorowanie bezpośredniego pytania." },
      { t: "Wystarczająco, żeby nie pracować na kogoś.", mistake: "Przechwałki / manipulacja", note: "Brzmi jak manipulacja." },
    ],
    bye: "Nie odpowiedziałeś mi. Wszystkiego dobrego.", why: "Bezpośrednie pytanie o dochód pozostało bez uczciwej odpowiedzi.",
  },
  stall: {
    label: "„Wyślij mi mailem”", family: "other",
    soft: ["Wyślij mi wszystko mailem, obejrzę później.", "Wrzuć informacje na komunikator, rzucę okiem w wolnej chwili."],
    hard: ["Wyślij informacje. Obejrzę, jak będę miał{|a} czas.", "Żadnych prezentacji. Po prostu wyślij."],
    opts: [
      { t: "Wyślę. Co jest dla ciebie ważniejsze do zobaczenia: cena, warunki czy przykłady?", tech: "Doprecyzowanie zainteresowania", note: "Formalną prośbę zamieniasz w dialog." },
      { t: "Dobrze, wyślę dziś. Umówimy się, że zadzwonię jutro zapytać o wrażenia?", tech: "Konkretny następny kontakt", note: "Następny kontakt ustalony — dobrze." },
      { t: "Co tam czytać, opowiem szybko i wszystko będzie jasne, bez żadnych maili i długiego czekania.", mistake: "Ignorowanie prośby", note: "Ignorujesz prośbę klienta." },
      { t: "Wyślę, ale decyzję trzeba podjąć dzisiaj.", mistake: "Fałszywa rzadkość", note: "Presja „dzisiaj” razem z „wyślę” brzmi absurdalnie." },
    ],
    push: ["No to wyślesz czy nie?", "Prosił{em|am} o samo wysłanie."],
    rec: [
      { t: "Wysyłam teraz. I dopiszę jedno krótkie zdanie o najważniejszym, żebyś od razu wszystko zrozumiał{|a}.", tech: "Spełnienie prośby", note: "Spełniono prośbę i dodano wartość." },
      { t: "Wyślę, ale i tak nie obejrzysz.", mistake: "Umniejszanie", note: "Przepowiadanie odmowy samo się spełnia." },
      { t: "Lepiej omówmy wszystko teraz, po co odkładać.", mistake: "Ignorowanie prośby", note: "Znów nie słychać klienta." },
    ],
    bye: "Dobrze, nie wysyłaj. Do widzenia.", why: "Prośba „wyślij” nie została zamieniona w dialog.",
  },
  aggression: {
    label: "Agresja", family: "other",
    soft: ["Już mi się znudziłeś! Ile można pisać?", "Znowu ty! Przecież prosił{em|am}, żeby nie przeszkadzać."],
    hard: ["Przestań do mnie pisać! Wrzucę cię na czarną listę, to spam!", "Kim ty w ogóle jesteś? Skąd masz mój numer? To nielegalne!"],
    opts: [
      { t: "Rozumiem twoją irytację. Co dokładnie cię irytuje?", tech: "Deeskalacja", note: "Przyjęto emocję i dano możliwość wypowiedzenia się — to obniża napięcie." },
      { t: "Przepraszam za kłopot. Jeśli sobie tego życzysz, nie będę już pisać.", tech: "Przeprosiny i szacunek dla granicy", note: "Szacunek dla granicy — ale bez szansy na zachowanie kontaktu." },
      { t: "Spokojnie, proszę, bez emocji. Wykonuję tylko swoją pracę i muszę doprowadzić rozmowę do końca.", mistake: "Umniejszanie emocji", note: "„Spokojnie” tylko dolewa oliwy do ognia." },
      { t: "Wykonuję tylko swoją pracę, sam{|a} zostawił{eś|aś} zgłoszenie.", mistake: "Usprawiedliwianie", note: "Usprawiedliwianie stawia klienta w roli winnego, a co do „zgłoszenia” możesz się mylić." },
    ],
    push: ["Nie rozumiesz ludzkiego języka? Odczep się!", "Doprowadzasz mnie do szału!"],
    rec: [
      { t: "Rozumiem. Przestaję. Jeśli kiedyś będzie zainteresowanie — wiesz, gdzie mnie znaleźć. Dziękuję za szczerość.", tech: "Godne wyjście", note: "Godne wyjście bywa lepsze niż zatrzymywanie." },
      { t: "Ale przecież chodziło tylko o pomoc!", mistake: "Usprawiedliwianie", note: "Obraza tylko przedłuża konflikt." },
      { t: "Zachowujesz się niekulturalnie.", mistake: "Spór / umniejszanie", note: "Wyrzut wobec klienta to koniec dialogu." },
    ],
    bye: "Koniec. Blokuję cię.", why: "Agresji klienta nie udało się obniżyć, kontakt zablokowany.",
  },
  manipulation: {
    label: "Targowanie się i presja klienta", family: "other",
    soft: ["Wezmę, ale jeśli zwrócisz mi część opłaty wstępnej ze swojej prowizji.", "Opuść część ceny, a zapiszę się od razu."],
    hard: ["Dostał{em|am} już dwie lepsze oferty. Albo dajesz {tier} dwa razy taniej, albo odchodzę.", "Zrób zniżkę 50% i darmowy miesiąc abonamentu, inaczej koniec rozmowy."],
    opts: [
      { t: "Cenę i warunki ustala firma, zniżki nie obiecuję. Pomogę wybrać pakiet pod twoje podróże.", tech: "Twarda postawa + wartość", note: "Uczciwie powiedziano, że nie można dawać zniżek, i zaproponowano to, co można." },
      { t: "Rozumiem chęć korzyści. Zobaczmy, co można ustalić w ramach warunków firmy, bez obietnic rzucanych na wiatr.", tech: "Szukanie rozwiązania w granicach", note: "Słusznie co do sensu, ale bez wyraźnego „nie” dla zniżki." },
      { t: "Dobrze, 50% — tylko nie odchodź, zapiszmy szybko, zrobię wszystko, jak chcesz!", mistake: "Oddanie pozycji", note: "Obiecano to, czego nie można, i pokazano, że cena jest nieprawdziwa." },
      { t: "Jeśli odejdziesz, stracisz wyjątkową ofertę, która się nie powtórzy, i będziesz żałować zmarnowanej okazji.", mistake: "Fałszywa rzadkość / presja", note: "Klient-manipulant odchodzi właśnie od presji." },
    ],
    push: ["Czyli nie zależy ci na transakcji. Potrzebuję wyniku teraz.", "To nie jest rozmowa."],
    rec: [
      { t: "Zależy mi, ale warunki są stałe. Mogę zaproponować dobranie pakietu pod twoje podróże i pokazanie wyliczenia. Idziemy tak?", tech: "Twarda postawa", note: "Twardą, uprzejmą postawę negocjatorzy szanują." },
      { t: "Dobra, 30% — to moje ostatnie słowo.", mistake: "Słaba pozycja", note: "Nowa zniżka po „ostatnim słowie” podkopuje zaufanie." },
      { t: "Po prostu próbujesz mnie wykiwać.", mistake: "Oskarżenie", note: "Oskarżenie o manipulację bez dowodów to konflikt." },
    ],
    bye: "Nie dogadaliśmy się. Do widzenia.", why: "Targowanie przegrane: słaba pozycja albo presja.",
  },
  smokescreen: {
    label: "Fałszywe zastrzeżenie", family: "value",
    soft: ["To dla mnie za drogie.", "Nie wiem, coś nie tak z ceną."],
    hard: ["Cena to absurd. Wbrew zdrowemu rozsądkowi.", "{tierPrice}? Nie, to nie podlega dyskusji."],
    opts: [
      { t: "Rozumiem. A gdyby cena była w porządku, czy coś jeszcze by cię zatrzymało?", tech: "Sprawdzenie ukrytego zastrzeżenia", note: "Sprawdzono, czy to prawdziwe zastrzeżenie." },
      { t: "Zobaczmy, z czego składa się {tierPrice}: {fee} rejestracja i {tierPoints} w punktach na konto.", tech: "Praca z ceną", note: "Reagujesz na to, co padło, ale nie sprawdzasz, czy to prawdziwe." },
      { t: "Drogo w porównaniu z czym? U innych jeszcze drożej, a jakość gorsza, więc nic nie tracisz!", mistake: "Spór", note: "Kłócisz się z zastrzeżeniem, które może być fałszywe." },
      { t: "Mogę wynegocjować zniżkę 30% od razu, jeśli zdecydujesz się dziś.", mistake: "Zmyślona zniżka", note: "Zniżek przy fałszywym zastrzeżeniu obiecywać nie wolno i to nie rozwiązuje problemu." },
    ],
    push: ["Nie chodzi tylko o cenę... Po prostu to wszystko jakieś dziwne.", "Cena nie jest najważniejsza. Po prostu mi się nie podoba."],
    rec: [
      { t: "Dziękuję, że powiedział{eś|aś} szczerze. Co dokładnie wydaje się dziwne? Rozłóżmy to.", tech: "Pytanie otwarte", note: "Dano klientowi możliwość powiedzenia prawdy." },
      { t: "Czyli cena jednak odpowiada? To zapisujemy.", mistake: "Ignorowanie zastrzeżenia", note: "Zignorowano wskazówkę prawdziwej przyczyny." },
      { t: "Raz drogo, raz dziwnie — zdecyduj się.", mistake: "Spór / umniejszanie", note: "Wyrzut wobec klienta to koniec dialogu." },
    ],
    bye: "To wszystko jakieś dziwne. Nie będę.", why: "Fałszywe zastrzeżenie nie zostało odkryte, prawdziwa przyczyna pozostała nieznana.",
  },
};
