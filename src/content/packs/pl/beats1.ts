import type { Beat, BeatTag } from "../../data/beats";

/** Polska baza zastrzeżeń, część 1 (rosyjski oryginał i zasady znaczników: data/beats.ts). {a|b}: forma męska|żeńska klienta. */
export const beats1: Partial<Record<BeatTag, Beat>> = {
  price: {
    label: "„Za drogo”", family: "value",
    soft: ["{tierPrice} na wejściu i jeszcze {sub} — to dla mnie trochę za dużo.", "Oj, {tierPrice}... a do tego {sub}. Drogawo."],
    hard: ["{tierPrice} za wejście i {sub}? Każdy agregator rezerwacji jest za darmo. Uzasadnij to albo nie marnuj mojego czasu.", "{tierPrice}? Za te pieniądze polecę gdzie chcę, bez żadnych abonamentów."],
    opts: [
      { t: "Wejście to {tierPrice}: {terms}. Ile wydajesz na podróże w ciągu roku?", tech: "Oddzielenie ceny od wartości", note: "Cenę uczciwie rozbito na części, a rozmowa przeszła do prawdziwych wydatków klienta na podróże." },
      { t: "Wejście kosztuje {tierPrice}, potem {sub}. Mogę rozpisać, co dokąd trafia, i pokazać warunki na piśmie.", tech: "Przejrzystość ceny", note: "Uczciwie i przejrzyście, ale bez pytania o jego podróże wątpliwości klienta zostają." },
      { t: "Ależ to bardzo opłacalne! Ludzie dołączają i są zadowoleni, a ty się wahasz, choć cena jest całkiem rozsądna i nie ma na co czekać.", mistake: "Presja społecznym dowodem", note: "Cudze opinie nie odpowiadają na osobiste „za drogo”." },
      { t: "To inwestycja: wejście zwróci się samo w kilka miesięcy, gwarantuję ci to, więc naprawdę nie ma się czym martwić, trzeba tylko zdecydować.", mistake: "Fałszywa obietnica zwrotu", note: "Nie ma gwarancji zwrotu i nie może być. Taka obietnica prowadzi prosto do skargi." },
    ],
    push: ["Nie, nadal nie rozumiem, za co tu płacę.", "Po prostu podajesz liczby, a ja nie widzę sensu."],
    rec: [
      { t: "Policzmy na twoich liczbach: ile wydajesz na urlop w ciągu roku i na co wystarczyłoby {tierPoints}. Jeśli korzyści nie ma — powiem to wprost.", tech: "Obliczenie na danych klienta", note: "Zaproponowano sprawdzenie korzyści na jego pieniądzach i obiecano szczerość, jeśli jej nie ma." },
      { t: "Mogę poprosić firmę o zniżkę, tylko decyduj szybko.", mistake: "Zmyślona zniżka", note: "Cena jest ustalona warunkami. Obiecanie nieistniejącej zniżki to kłamstwo i utrata zaufania." },
      { t: "Od przyszłego miesiąca cena wzrośnie, trzeba się pośpieszyć.", mistake: "Fałszywa rzadkość", note: "Zmyślona rzadkość niszczy zaufanie." },
    ],
    bye: "Drogo i niejasno. Nie, dziękuję.", why: "Cena nie została powiązana z realną korzyścią klienta, więc nie zobaczył, za co płaci.",
  },
  subscription: {
    label: "„Jeszcze abonament $120?”", family: "value",
    soft: ["Chwileczkę, jeszcze {sub}? Myślał{em|am}, że płaci się raz i po sprawie.", "Nie rozumiem... czyli oprócz {tierPrice} trzeba płacić {sub} bez przerwy?"],
    hard: ["{sub}?! Co miesiąc? To prawie $1 440 rocznie. To pułapka, po prostu nie powiedziałeś od razu.", "Przemilczałeś abonament. Czego jeszcze nie mówisz?"],
    opts: [
      { t: "Tak, {sub} to osobna płatność. W skali roku to $1 440 plus wejście. Sprawdzimy, czy to się opłaca przy twoich podróżach?", tech: "Uczciwość co do stałych kosztów", note: "Kwotę roczną podano od razu i zaproponowano sprawdzenie korzyści — to usuwa wrażenie pułapki." },
      { t: "Tak, abonament to {sub}. Pokażę w dokumentach firmy, co obejmuje, i sam zobaczysz.", tech: "Oparcie na dokumentach", note: "Dobrze, że nie opowiadasz z pamięci. Ale bez pytania o jego podróże liczba została abstrakcyjna." },
      { t: "To grosze, ludzie wydają więcej na kawę niż na abonament.", mistake: "Umniejszanie zastrzeżenia", note: "Dla klienta to nie grosze. Porównanie z kawą brzmi jak drwina." },
      { t: "Abonament można wyłączyć w każdej chwili bez konsekwencji, spokojnie, wszystko jest bardzo elastyczne, nikt nikogo nie trzyma.", mistake: "Niesprawdzona obietnica", note: "Nie znasz na pewno warunków wyłączenia. Nie wolno obiecywać tego, czego nie ma w dokumencie." },
    ],
    push: ["Nie powiedziałeś mi od razu. Teraz nie jestem pewn{y|a}, czy w ogóle mówi mi się wszystko.", "Czyli to jeszcze nie wszystko, tak? Co jeszcze wyskoczy?"],
    rec: [
      { t: "Masz rację: o abonamencie trzeba było powiedzieć od razu. Oto wszystkie płatności: wejście {tierPrice} i {sub}. Resztę reguluje umowa — przeczytajmy ją razem.", tech: "Przyznanie błędu + kompletność", note: "Przyznać się do wpadki i wyłożyć wszystkie płatności to najlepszy sposób na odzyskanie zaufania." },
      { t: "No to drobiazg, najważniejszy jest wynik.", mistake: "Ignorowanie zastrzeżenia", note: "Klient złości się właśnie na niedopowiedzenie, a ty znów je pomniejszasz." },
      { t: "Wszyscy płacą abonament i nikt się nie skarży.", mistake: "Presja / fałszywe uogólnienie", note: "„Wszyscy płacą” to nie argument, a ty nie możesz wiedzieć, że nikt się nie skarży." },
    ],
    bye: "Ukryte opłaty to nie dla mnie. Do widzenia.", why: "O abonamencie klient dowiedział się nie od razu i odebrał to jako niedopowiedzenie.",
  },
  points_value: {
    label: "„Punkty to nie pieniądze?”", family: "trust",
    soft: ["Chwila, płacę {tierPrice}, a na konto trafia tylko {tierPoints}, a {fee} po prostu przepada?", "Czyli punkty to nie pieniądze, a {fee} oddaję bezpowrotnie?"],
    hard: ["Wychodzi na to, że płacę {tierPrice}, a dostaję punkty na ich platformie? To gra w „Monopoly”. Wyjaśnij to normalnie.", "{fee} poszło do firmy, na konto trafia {tierPoints}. Więc gdzie tu korzyść dla mnie, a nie dla was?"],
    opts: [
      { t: "Zgadza się: {fee} to opłata dla firmy, a {tierPoints} na twoim koncie Travel Advantage przeznaczone jest na podróże. To nie gotówka.", tech: "Precyzyjne sformułowanie bez upiększeń", note: "Potwierdzono jego rozumienie i powiedziano wprost, że punkty to nie pieniądze. To usuwa nieufność." },
      { t: "Dokładnie: {terms}. Pokazać w panelu klienta?", tech: "Fakty + demonstracja", note: "Poprawnie i namacalnie, ale bez pytania, czy takie punkty będą mu przydatne." },
      { t: "Punkty to te same pieniądze, tylko leżą na innym koncie, więc w sumie nic nie tracisz, a nawet zyskujesz więcej.", mistake: "Przekręcanie faktów", note: "Punkty nie są równe pieniądzom: nie da się ich po prostu wypłacić. Taka podmiana to podstawa do skargi." },
      { t: "Punkty można w każdej chwili wypłacić i odzyskać pieniądze, to przecież twoje pieniądze, więc nie ma tu żadnego ryzyka.", mistake: "Fałszywa obietnica", note: "Nie znasz takiego warunku. Zmyślić go to oszukać klienta." },
    ],
    push: ["Powiedziałeś teraz coś innego. Punkty to pieniądze czy nie?", "Tak właśnie myślał{em|am}: kręcisz. Powiedz wprost."],
    rec: [
      { t: "Wprost: punkty to nie pieniądze. {fee} to opłata dla firmy, a {tierPoints} służy do płacenia za podróże na platformie. Jeśli to ci nie pasuje — powiemy to uczciwie.", tech: "Bezpośrednia odpowiedź", note: "Bezpośrednia odpowiedź po nieścisłości przywraca szacunek klienta." },
      { t: "No w gruncie rzeczy to to samo, nie czepiaj się.", mistake: "Ignorowanie zastrzeżenia", note: "Dla klienta różnica jest zasadnicza, a ty ją negujesz." },
      { t: "Najważniejsze, że masz możliwość tanio podróżować.", mistake: "Unikanie odpowiedzi", note: "Nie odpowiedziano na bezpośrednie pytanie i dodano niesprawdzoną obietnicę." },
    ],
    bye: "Nikt mi nie mówi wprost, co dostaję. Nie, dziękuję.", why: "Różnicy między punktami a pieniędzmi klient nigdy nie usłyszał wprost.",
  },
  tier_choice: {
    label: "„Elite czy Turbo?”", family: "value",
    soft: ["Jaka jest różnica między Elite a Turbo? Co mam wybrać?", "Proponują mi Elite, a koleżanka mówi, że trzeba Turbo. Kto ma rację?"],
    hard: ["Elite, Turbo — po prostu chcesz sprzedać drożej. Wyjaśnij różnicę bez marketingu.", "Dlaczego mam brać Turbo za $590, skoro Elite kosztuje $340?"],
    opts: [
      { t: "Elite to $340, Turbo to $590; w obu $100 to opłata dla firmy, a na konto trafiają punkty. Jak często podróżujesz?", tech: "Porównanie na faktach + pytanie", note: "Podano liczby, a wybór powiązano z realnymi podróżami klienta, a nie z twoją korzyścią." },
      { t: "Różnica to cena i punkty: przy rejestracji 120 dla Elite i 490 dla Turbo, a przedłużenie abonamentu daje 120 i 240. Co do reszty sprawdzimy oficjalną tabelę firmy.", tech: "Oparcie na oficjalnych danych", note: "Uczciwie: nie wymyślasz innych różnic, tylko proponujesz sprawdzenie." },
      { t: "Bierz Turbo, jest zawsze lepsze — i punktów więcej, i poważny poziom, a Elite biorą tylko ci, którzy w siebie nie wierzą.", mistake: "Presja / upsell bez podstaw", note: "Sprzedawanie drożej bez poznania potrzeb to czerwony przycisk klienta." },
      { t: "Turbo daje dwa razy większy dochód, więc jest korzystniejsze dla wszystkich.", mistake: "Fałszywa obietnica dochodu", note: "Nie możesz obiecywać dochodu, a tym bardziej „dwa razy większego”." },
    ],
    push: ["Nie odpowiedziałeś na pytanie. Na czym naprawdę polega różnica?", "To brzmi jak „bierz droższe”. Wyjaśnij po ludzku."],
    rec: [
      { t: "Słusznie. Zróbmy tak: Elite to $340, Turbo to $590. Jak dużo podróży planujesz? Dobierzemy to, co pasuje właśnie tobie, nawet jeśli to Elite.", tech: "Rekomendacja na korzyść klienta", note: "Gotowość polecenia tańszej opcji to najsilniejszy sygnał uczciwości." },
      { t: "No, Turbo jest dla tych, którzy podchodzą poważnie.", mistake: "Presja", note: "Naciskanie na „powagę” dotyka klienta." },
      { t: "Jeśli bierzesz Elite, to znaczy, że nie wierzysz w sukces.", mistake: "Manipulacja", note: "Manipulowanie statusem to droga do utraty klienta." },
    ],
    bye: "Próbują mi sprzedać drożej. Dziękuję, nie.", why: "Wybór pakietu nie był powiązany z potrzebami klienta — poczuł presję.",
  },
  refund_cancel: {
    label: "„A jak mi się nie spodoba, oddadzą pieniądze?”", family: "trust",
    soft: ["A jeśli mi się nie spodoba, zwrócą pieniądze?", "Jak wyjść, jeśli mi nie podpasuje? Co wtedy z pieniędzmi?"],
    hard: ["Pokaż, gdzie jest zapisany zwrot. Jak nie zapiszesz — koniec rozmowy.", "Już mi obiecywano „wszystko zwrócimy” gdzie indziej. Co macie konkretnie?"],
    opts: [
      { t: "Szczerze: warunki zwrotu i rezygnacji sprawdzę w umowie i pokażę na piśmie przed płatnością.", tech: "Uczciwość + dokument", note: "Nie wymyślono warunku, tylko obiecano pokazać go na piśmie. To maksimum zaufania." },
      { t: "Warunki są w umowie: otwórzmy ją razem i sam wszystko przeczytasz.", tech: "Odesłanie do dokumentu", note: "Słusznie, ale warto dodać, że sporne miejsca omówicie razem." },
      { t: "Wszystko zwrócą, spokojnie, nikt nigdy się nie skarżył.", mistake: "Niesprawdzona obietnica", note: "Nie wiesz, czy zwrócą. Takie „spokojnie” to podstawa do roszczeń." },
      { t: "Zwrócą wszystko bez pytań, osobiście gwarantuję, i w ogóle nie ma się czym martwić: to dawno dopracowana procedura.", mistake: "Fałszywa gwarancja zwrotu", note: "Osobista gwarancja tam, gdzie niczego nie gwarantujesz, to poważne naruszenie." },
    ],
    push: ["To zwrócą czy nie? Nie usłyszał{em|am} odpowiedzi.", "Albo wiesz, albo nie. Co jest w umowie?"],
    rec: [
      { t: "Powiem uczciwie: na pamięć nie pamiętam, żeby się nie pomylić. Otwieramy umowę i czytamy razem punkt o zwrocie, przed płatnością.", tech: "Przyznanie granic wiedzy", note: "Przyznać „nie pamiętam” i otworzyć dokument to normalna praktyka zawodowa." },
      { t: "No ogólnie wszystko w porządku, tak sądzę.", mistake: "Rozmyta odpowiedź", note: "„Tak sądzę” zamiast warunków umowy brzmi jak unik." },
      { t: "Jeśli od początku myślisz o zwrocie, to znaczy, że nie jesteś gotow{y|a}.", mistake: "Presja / umniejszanie", note: "Pytanie o zwrot to zwykła ostrożność, a nie słabość." },
    ],
    bye: "Jeśli nie da się pokazać warunków zwrotu, nie wchodzę w to.", why: "Pytanie o zwrot i rezygnację zostało bez dokumentów i bez uczciwej odpowiedzi.",
  },
  network_realism: {
    label: "„A jeśli nikogo nie przyprowadzę?”", family: "other",
    soft: ["A jeśli nikogo nie przyprowadzę? To po co mi to w ogóle?", "Nie jestem pewn{y|a}, czy uda mi się kogoś pozyskać. Co wtedy?"],
    hard: ["Czyli dochód tylko wtedy, jeśli przyprowadzę innych? Więc wszystko opiera się na nowych ludziach.", "Ilu ludzi trzeba przyprowadzić, żeby to się choć zwróciło? Tylko uczciwie."],
    opts: [
      { t: "Wtedy po prostu korzystasz z konta Travel Advantage do podróży. Sieć jest dobrowolna; dochodu nikt nie gwarantuje.", tech: "Uczciwe ujęcie", note: "Rozdzielono „korzystanie” od „budowania biznesu” i wprost powiedziano, że nie ma gwarancji." },
      { t: "Zapraszanie nie jest obowiązkowe. Jeśli zechcesz pracować z siecią — opowiem, jak to wygląda w praktyce.", tech: "Alternatywna ścieżka", note: "Słusznie, ale warto dodać, że wynik zależy od wysiłku i nie jest gwarantowany." },
      { t: "Przyprowadzisz, dokąd się podziejesz: każdy ma znajomych, którzy tego potrzebują, wystarczy napisać i trochę docisnąć.", mistake: "Presja / niepewne uogólnienie", note: "Przypisujesz klientowi wynik, którego nie znasz." },
      { t: "Przyprowadzisz dwie osoby i wejście zwróci się w całości, sprawdzone na wielu ludziach, więc w ogóle się nie bój.", mistake: "Fałszywa obietnica dochodu", note: "Każda obietnica „zwróci się w całości” łamie etykę i prawo reklamy." },
    ],
    push: ["Właśnie to „wszystko się uda” mi się nie podoba. Konkretnie, co będzie, jeśli się nie uda?", "Omijasz pytanie. Odpowiedz, co będzie, jeśli nikogo nie przyprowadzę."],
    rec: [
      { t: "Wprost: jeśli nikogo nie przyprowadzisz, zostajesz z kontem i abonamentem {sub}, a korzyść zależy tylko od twoich podróży. Oceńmy, czy to się dla ciebie opłaca.", tech: "Bezpośrednia odpowiedź z liczbami", note: "Wymieniono i plusy, i koszty bez upiększeń." },
      { t: "Nic strasznego się nie stanie, wielu tak żyje.", mistake: "Unikanie odpowiedzi", note: "„Wielu tak żyje” jest nieweryfikowalne i niczego nie wyjaśnia." },
      { t: "Czyli nie jesteś nastawion{y|a} na sukces.", mistake: "Umniejszanie", note: "Obwinianie klienta zamyka dialog." },
    ],
    bye: "Nie dostaję uczciwej odpowiedzi. Nie interesuje mnie to.", why: "Uczciwej odpowiedzi na temat braku wyników w sieci klient nie dostał.",
  },
  time: {
    label: "„Nie mam czasu”", family: "value",
    soft: ["Szczerze, nie mam teraz na to czasu.", "Jestem teraz bardzo zajęt{y|a}, porozmawiajmy później."],
    hard: ["Mam trzy spotkania pod rząd. Czego chcesz? Jednym zdaniem.", "Nie mam czasu. Mów krótko albo się rozłączam."],
    opts: [
      { t: "Rozumiem. Jedno pytanie: na co ucieka ci najwięcej czasu przy planowaniu podróży?", tech: "Szacunek dla czasu + pytanie", note: "Uznano jego zajętość i od razu pokazano, że rozmowa będzie rzeczowa." },
      { t: "To umówmy się na rozmowę w dogodnym terminie — na 10 minut.", tech: "Przesunięcie na konkretną porę", note: "Dobry ruch, ale wartości rozmowy klient jeszcze nie zobaczył." },
      { t: "To zajmie dosłownie minutę, wytrzymaj, szybko wszystko opowiem: najpierw o firmie, potem o Travel Advantage, potem o pakietach, abonamencie i biznesie.", mistake: "Monolog", note: "„Wytrzymaj” brzmi jak prośba o to, żeby znieść ciebie." },
      { t: "Wszyscy zajęci tak mówią, a potem żałują, że nie posłuchali.", mistake: "Presja", note: "Wyrzut wobec klienta to najkrótsza droga do „do widzenia”." },
    ],
    push: ["Przecież mówię: nie mam czasu. Kończmy.", "Nie słuchasz mnie. Nie mam czasu."],
    rec: [
      { t: "Rozumiem. Kiedy wygodniej — jutro czy w czwartek? Napiszę jedną wiadomość, najważniejsze zmieści się w trzech linijkach.", tech: "Alternatywa + zwięzłość", note: "Wybór z dwóch opcji i obietnica zwięzłości." },
      { t: "No to chociaż wysłuchaj mnie do końca, to ważne.", mistake: "Ignorowanie zastrzeżenia", note: "Powtórzono to, na co klient już powiedział „nie”." },
      { t: "Jeśli nie masz czasu na własne podróże, to nie cenisz swojego życia.", mistake: "Presja / umniejszanie", note: "Umniejszanie klienta to błąd, którego nie da się naprawić." },
    ],
    bye: "Koniec, nie mam czasu. Do widzenia.", why: "Wartość rozmowy nie została pokazana w pierwszych sekundach i klient odszedł.",
  },
};
