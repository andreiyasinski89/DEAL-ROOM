import { g, x } from "../helpers";
import type { Extras } from "../types";

/** Polski: drugie sformułowanie każdego zastrzeżenia (rosyjski oryginał: ruBeatsAlt.ts). {a|b}: forma męska|żeńska klienta. */
export const beatsAlt: Extras["beatsAlt"] = {
  price: {
    soft: "Szczerze, {tierPrice} na start i jeszcze {sub} — to dla mnie spore pieniądze.",
    hard: "Z każdego serwisu hotelowego korzystam za darmo, a wy chcecie {tierPrice} i jeszcze {sub}. Z jakiej racji?",
    push: "Nadal nie odpowiedziałeś, za co dokładnie mam płacić.",
    alt: [
      g("Rozumiem. Co zwykle rezerwujesz w ciągu roku? Od tego zależy, czy to w ogóle ma sens.", "Wartość przez potrzeby", "Nie bronisz ceny, tylko poznajesz, ile klient naprawdę wydaje na podróże."),
      g("Oto z czego składa się płatność: wejście {tierPrice}, potem {sub}. Mogę pokazać to na piśmie.", "Przejrzystość płatności", "Uczciwie i jasno, ale bez pytania o podróże cena pozostaje abstrakcyjna."),
      x("Inni płacą i nie narzekają, więc ty też się przyzwyczaisz: dla takiego produktu to zwykłe pieniądze, nie ma co tak się martwić.", "Presja normą", "„Wszyscy płacą” to nie odpowiedź na osobiste „za drogo”."),
      x("To szybko się zwróci, obiecuję: klienci zwykle odzyskują wydane pieniądze już w pierwszych miesiącach, więc ryzyka prawie nie ma.", "Fałszywa obietnica zwrotu", "Zwrotu nie można gwarantować: to droga do skargi."),
    ],
  },
  subscription: {
    soft: "Chwila, czyli oprócz wejścia płacę co miesiąc jeszcze {sub}? Tak mi tego nie tłumaczono.",
    hard: "Abonament {sub} i do tego wejście? Pachnie pułapką. Dlaczego dowiaduję się o tym dopiero teraz?",
    push: "Chcę wiedzieć, jakich jeszcze płatności nie nazwałeś.",
    alt: [
      g("Zgadza się, oprócz wejścia jest abonament {sub}. Zsumujmy wszystko, a co daje, pokażę w dokumentach.", "Pełny obraz płatności", "Nazwano wszystkie regularne płatności i pokazano, co za nie dostajesz."),
      g("Tak, abonament to osobna płatność, {sub}. Jego warunki lepiej czytać w umowie: otworzę ją razem z tobą.", "Oparcie na umowie", "Słusznie odesłać do dokumentu, ale płatność warto powiązać z kosztami klienta."),
      x("Abonament to drobiazg wobec całej reszty. Nie warto przez niego się wahać i przeciągać decyzji.", "Umniejszanie zastrzeżenia", "Klient pyta o regularne pieniądze, a ty nazywasz je drobiazgiem."),
      x("Abonament można spokojnie przerwać w każdej chwili, żadnych zobowiązań i żadnych konsekwencji, to przecież klub.", "Niesprawdzona obietnica", "Nie znasz warunków rezygnacji: nie wolno obiecywać tego, czego nie ma w dokumencie."),
    ],
  },
  points_value: {
    soft: "Wyjaśnij, proszę: za {tierPrice} dostaję punkty, a nie pieniądze, i część po prostu idzie do firmy. Tak?",
    hard: "Punkty na waszej platformie to wewnętrzna waluta, którą sami wyceniacie. Dlaczego mam w to wierzyć?",
    push: "Nie odpowiedziałeś: punkty można wymienić na pieniądze czy nie?",
    alt: [
      g("Zgadza się: punkty to nie pieniądze, płaci się nimi za podróże na platformie. Zasady pokażę na piśmie.", "Precyzyjne sformułowanie + dokument", "Potwierdzono rozumienie klienta i nic nie ubarwiono."),
      g("Tak, punkty działają tylko wewnątrz platformy. Za jakie podróże zwykle płacisz, żeby zobaczyć, czy by ci się przydały?", "Fakty + pytanie o użyteczność", "Uczciwie i od razu sprawdzenie użyteczności dla klienta."),
      x("Punkty to te same pieniądze, tylko w wygodnej formie. Nie ma co czepiać się nazwy, istota jest ta sama.", "Przekręcanie faktów", "Punkty nie są równe pieniądzom: podmiana pojęć to podstawa do skargi."),
      x("Punkty można w każdej chwili wypłacić na kartę, to twoje pieniądze i żadnych ograniczeń tu nie ma.", "Fałszywa obietnica", "Nie znasz takiego warunku: zmyślić go to oszukać."),
    ],
  },
  tier_choice: {
    soft: "Mówią mi, że wystarczy Elite, a koleżanka radzi Turbo. Podpowiedz, jak wybrać?",
    hard: "Na pewno polecasz Turbo, bo jest droższe. Wyjaśnij różnicę tak, żebym mógł{|a} to sprawdzić.",
    push: "To który poziom pasuje mnie, a nie wam?",
    alt: [
      g("Wybierzmy według twoich podróży: ile razy w roku podróżujesz i ile wydajesz?", "Wybór według potrzeb", "Wybór powiązano z życiem klienta, a nie z twoim przychodem."),
      g("Różnica to cena i punkty: przy rejestracji jeden pakiet daje jedno, drugi coś innego, i przedłużenie też. Resztę sprawdzimy w tabeli firmy.", "Oparcie na oficjalnych danych", "Nie wymyślasz różnic i proponujesz sprawdzenie w dokumencie."),
      x("Oczywiście Turbo: to poważny wybór dla poważnych ludzi, a Elite biorą ci, którzy w siebie wątpią.", "Presja upsellem", "Sprzedawanie drożej bez poznania potrzeb to czerwony przycisk klienta."),
      x("Turbo przynosi więcej dochodu, więc do zarabiania to jedyny słuszny wybór.", "Fałszywa obietnica dochodu", "Nie możesz obiecywać dochodu, a tym bardziej „większego”."),
    ],
  },
  refund_cancel: {
    soft: "Załóżmy, że mi nie pasuje. Jak wyjść i co z pieniędzmi?",
    hard: "Jeśli nie da się wyjść i odzyskać pieniędzy, to pułapka. Pokaż, gdzie to jest napisane.",
    push: "Zadał{em|am} proste pytanie o zwrot. Odpowiedzi nadal nie ma.",
    alt: [
      g("Warunki zwrotu i rezygnacji sprawdzamy w umowie. Otworzę ją razem z tobą przed płatnością.", "Dokument zamiast obietnic", "Nie wymyślono warunku, tylko zaproponowano sprawdzenie go na piśmie."),
      g("Szczerze: szczegółów na pamięć nie pamiętam, żeby się nie pomylić. Znajdźmy punkt w umowie i przeczytajmy razem.", "Przyznanie granic wiedzy", "Przyznać „nie pamiętam” i otworzyć dokument to praktyka zawodowa."),
      x("Nie martw się, zwrócą wszystko bez problemu, tak zawsze bywa, nigdy nie słyszałem, żeby komuś się nie udało.", "Niesprawdzona obietnica", "„Nie słyszałem” to nie gwarancja, a warunków nie znasz."),
      x("Zwrócą wszystko w całości, gwarantuję to, to standardowa procedura i żadnych pytań nie będzie.", "Fałszywa gwarancja zwrotu", "Osobista gwarancja tam, gdzie niczego nie gwarantujesz, to poważne naruszenie."),
    ],
  },
  network_realism: {
    soft: "Nie jestem zbyt towarzyski{|a}. Jeśli nikogo nie zaproszę, to czy to w ogóle ma sens?",
    hard: "Ilu ludzi trzeba przyprowadzić, żeby wyjść chociaż na zero? Odpowiedz liczbą, bez „to zależy”.",
    push: "Co się stanie z moimi pieniędzmi, jeśli nie uda mi się przyciągać ludzi?",
    alt: [
      g("Wtedy po prostu korzystasz z konta. Sieć jest dobrowolna, a dochodu nikt nie gwarantuje.", "Uczciwe ujęcie", "Oddzielono korzystanie od biznesu i wprost powiedziano, że gwarancji nie ma."),
      g("Liczb nie podam: gwarancji dochodu nie ma. Mogę pokazać, jak wygląda praca z siecią w praktyce, a ty sam{|a} ocenisz, czy ci pasuje.", "Rezygnacja z obietnic", "Uczciwie: bez liczb, których nie da się potwierdzić."),
      x("Przyprowadzić ludzi nie jest trudno, każdy ma znajomych. Pisz po prostu do wszystkich i trochę naciskaj, a wynik będzie.", "Presja i podejście spamowe", "Rada pisania do wszystkich szkodzi reputacji klienta."),
      x("Przyprowadzisz trzy osoby i wszystko się zwróci, wielu tak robi i radzą sobie bez wysiłku.", "Fałszywa obietnica dochodu", "Każde „zwróci się” łamie etykę i prawo reklamy."),
    ],
  },
  time: {
    soft: "Można to zrobić kiedy indziej? Nie mam teraz w ogóle czasu na długie rozmowy.",
    hard: "Za pięć minut mam spotkanie. Jedno zdanie: czego chcesz?",
    push: "Już mówił{em|am}, że jestem zajęt{y|a}. Nie będę powtarzać.",
    alt: [
      g("Oczywiście: pomagam policzyć opłacalność podróży. Kiedy wygodnie wrócić na dziesięć minut?", "Sedno + wybór czasu", "Dano sedno w kilka sekund i zaproponowano dogodną porę."),
      g("Rozumiem. Pozwól, że zadzwonię jutro o dogodnej porze. Którą wolisz?", "Przesunięcie na konkretną porę", "Dobrze, ale wartości rozmowy klient jeszcze nie zobaczył."),
      x("To nie potrwa długo, posłuchaj mnie chociaż minutę, a potem zdecydujesz: szybko opowiem wszystko naraz.", "Monolog", "Prosisz o minutę, a potem wygłaszasz monolog."),
      x("Wszyscy tak mówią, a potem po pół roku żałują, że nie posłuchali na czas. Zdecydujmy teraz.", "Presja i wyrzut", "Wyrzut wobec klienta to najkrótsza droga do „do widzenia”."),
    ],
  },
  trust: {
    soft: "Przepraszam, ale cię nie znam. Dlaczego mam ci ufać?",
    hard: "W internecie pełno „firm”. Czym wasza różni się poza ładnymi słowami?",
    push: "Mówisz, a dowodów nie ma. Potrzebuję faktów.",
    alt: [
      g("Dobre pytanie. Nie wierz na słowo: oto {proof}. Pytaj, co chcesz sprawdzić, a pokażę.", "Weryfikowalne fakty", "Nie prosisz o wiarę, tylko dajesz możliwość sprawdzenia."),
      g("Mogę pokazać, jak korzystam z konta na co dzień, i dać obejrzeć dokumenty. Co jest dla ciebie bardziej przekonujące?", "Osobisty przykład + wybór", "W porządku, ale dokumenty przekonują bardziej niż osobisty przykład."),
      x("Przykro mi to słyszeć: jestem uczciwym człowiekiem i pracuję w tym nie od dziś, po co miałbym cię oszukiwać?", "Obraza", "Obraza stawia klienta w roli winnego."),
      x("Przysięgam, że wszystko będzie dokładnie tak, jak mówię, i żadnych problemów nie będzie, uwierz na słowo.", "Fałszywa obietnica", "Przysięgi zamiast faktów pogłębiają nieufność."),
    ],
  },
  mlm_stigma: {
    soft: "Powiedz, czy to nie coś w rodzaju sieciówki? Nie przepadam za tym.",
    hard: "Marketing sieciowy i piramidy to dla mnie to samo. To to?",
    push: "Nadal nie powiedziałeś, czy to firma sieciowa czy nie.",
    alt: [
      g("Tak, model jest sieciowy, nie będę tego ukrywać. Co dokładnie cię niepokoi?", "Otwartość + pytanie", "Przyznano oczywistość i zapytano o przyczynę wątpliwości."),
      g("Tak, model jest sieciowy. Zobaczmy dokumenty, a ty zdecydujesz, czy ci pasuje.", "Fakty i dokumenty", "Słusznie, ale bez pytania o jego obawy."),
      x("Jaka piramida? To absolutnie legalny biznes, piramidami zajmują się zupełnie inni, niesprawiedliwie tak o nas mówisz.", "Spór", "Spór nie zdejmuje strachu, a „absolutnie legalny” nie możesz udowodnić."),
      x("Nie, to nie marketing sieciowy, tylko zamknięty klub dla podróżników, nie ma tu nic wspólnego z tym.", "Kłamstwo", "Zaprzeczenie modelu sieciowego to kłamstwo, które łatwo sprawdzić."),
    ],
  },
  need: {
    soft: "Szczerze, w ogóle nie potrzebuję żadnych klubów: jeżdżę parę razy w roku i mi to wystarcza.",
    hard: "Świetnie podróżuję bez was. Powiedz, po co mam płacić za to, co robię sam{|a}?",
    push: "Przecież już mówił{em|am}, że tego nie potrzebuję.",
    alt: [
      g("Może rzeczywiście nie potrzebujesz. Sprawdźmy na jednej twojej podróży: jeśli korzyści nie ma, powiem to.", "Sprawdzenie na danych", "Proponujesz sprawdzenie, a nie udowadniasz."),
      g("Rozumiem. Wielu osobom tak się najpierw wydaje. Policzymy jeden twój urlop, bez zobowiązań?", "Normalizacja wątpliwości", "Dobrze, ale pytanie o podróże jest mocniejsze."),
      x("Potrzebują wszyscy, ty po prostu jeszcze nie zrozumiał{eś|aś} swojej korzyści. Pozwól, że wyjaśnię, a się zgodzisz.", "Spór", "„Potrzebne wszystkim” to nie argument dla jednego człowieka."),
      x("Nie potrzebujesz? To tracisz to, co inni już zrozumieli, i będziesz żałować zmarnowanej okazji.", "Presja i fałszywa rzadkość", "Presja strachu przed stratą nie działa na kogoś, kto powiedział „nie”."),
    ],
  },
  competitor: {
    soft: "Zwykle wszystko znajduję przez agregator, tam jest wygodnie. W czym jesteście lepsi?",
    hard: "Booking i serwisy lotnicze są darmowe. Podaj choć jeden powód, żeby płacić wam {tierPrice} i {sub}.",
    push: "Nadal nie porównałeś. Konkretnie: w czym jesteście lepsi?",
    alt: [
      g("Agregatory są wygodne. Porównajmy liczbowo twoją ostatnią podróż, z punktami i abonamentem.", "Porównanie na danych klienta", "Nie krytykujesz konkurenta, tylko proponujesz sprawdzenie obliczeniem."),
      g("Jeśli jeździsz rzadko, agregator może być korzystniejszy. Jeśli często, warto policzyć. Pokazać jak?", "Uczciwość co do granic produktu", "Przyznanie, że produkt nie jest dla wszystkich, nadaje wagę twoim słowom."),
      x("Agregatory zawyżają ceny i ukrywają prowizje, tam cię po prostu oszukują, a u nas wszystko uczciwie i taniej.", "Krytyka konkurenta", "Złe słowa o innych bez dowodów budzą nieufność."),
      x("U nas zawsze taniej, to pewne, wielokrotnie to porównywano, więc nawet nie trzeba sprawdzać.", "Fałszywa obietnica", "Twierdzenie „na pewno taniej” bez obliczeń prowadzi do reklamacji."),
    ],
  },
  spouse_third_party: {
    soft: "Muszę to omówić {third}. Takie decyzje podejmujemy razem.",
    hard: "Bez {thirdWho} niczego nie podpiszę i raczej się nie zgodzą.",
    push: "To sprawa rodzinna i nie ma co nas poganiać.",
    alt: [
      g("Oczywiście. Co będzie najważniejsze dla {thirdWho}? Prześlę wyliczenie i odpowiem na pytania, jeśli się pojawią.", "Pytanie o osobę trzecią", "Osoba trzecia stała się uczestnikiem decyzji, a nie przeszkodą."),
      g("Dobrze. Mogę porozmawiać i z nią lub z nim, żeby odpowiedzieć na pytania bezpośrednio. Kiedy wygodnie?", "Spotkanie we troje", "Konkretny krok, ale warto było dowiedzieć się, czego dokładnie się obawiają."),
      x("Jesteś przecież dorosł{y|a}, zdecyduj sam{|a}. Po co wszystko uzgadniać, to twoja osobista decyzja, prawda?", "Presja i umniejszanie", "Postawiono klienta między sobą a bliskimi."),
      x("Zapiszmy się dziś, a potem wszystko wyjaśnisz. Tak prościej: lepiej zrobić, a potem się dogadać.", "Presja i ukrywanie decyzji", "Rada ukrycia decyzji to ryzyko etyczne i czerwony przycisk."),
    ],
  },
  think_about_it: {
    soft: "Muszę to wszystko rozważyć. Dam znać.",
    hard: "Nie poganiaj mnie. Jak zdecyduję, sam{|a} zadzwonię.",
    push: "Potrzebuję czasu, a nie namawiania.",
    alt: [
      g("Rozsądnie. Jakie pytanie jest teraz dla ciebie główne? Prześlę dokładnie to, co pomoże.", "Wyjaśnienie wątpliwości", "„Zastanowię się” zamieniono w konkretne pytanie."),
      g("Oczywiście. Napiszę do ciebie w czwartek, kiedy już to przemyślisz. Pasuje?", "Konkretny następny kontakt", "Dobrze: jest data, ale przyczyna wątpliwości pozostała nieznana."),
      x("Co tu rozważać? Warunki świetne, lepszych nie znajdziesz, a czas ucieka, więc decyduj dziś.", "Presja", "Nie uszanowano prawa klienta do namysłu."),
      x("Zastanów się, ale oferta obowiązuje tylko do wieczora, potem ceny będą już inne.", "Fałszywa rzadkość", "Fałszywy termin niszczy zaufanie."),
    ],
  },
  bad_past_experience: {
    soft: "Raz już włożył{em|am} pieniądze w coś podobnego i zosta{łem|łam} z niczym. Nie chcę znowu.",
    hard: "Opowiadano mi już piękne historie o „klubie” i „możliwościach”. Co jest u was inaczej?",
    push: "Powtarzasz te same słowa co ostatnio.",
    alt: [
      g("Przykro mi, że tak wyszło. Co dokładnie obiecano i co z tego wyszło? Ważne, żeby tego nie powtórzyć.", "Empatia + pytanie", "Odkryto przyczynę bólu zamiast się bronić."),
      g("Rozumiem. Nie obiecuję tego, czego nie mogę pokazać. Oto, co można sprawdzić: {proof}.", "Uczciwe ujęcie", "Uczciwie, ale historia klienta pozostała niewysłuchana."),
      x("To było coś innego, u nas tak po prostu nie bywa, nie porównuj nas z tamtymi.", "Usprawiedliwianie", "„U nas tak nie bywa” brzmi jak u wszystkich."),
      x("Po prostu miał{eś|aś} pecha. Spróbuj jeszcze raz: tym razem na pewno nic nie stracisz, ręczę.", "Presja i fałszywa obietnica", "„Nic nie stracisz” to obietnica bez podstaw."),
    ],
  },
  no_money: {
    soft: "Mam teraz krucho z pieniędzmi, nie mam zbędnych {tierPrice}.",
    hard: "Każdy mój dolar jest rozpisany. Jakie są płatności poza wejściem? Mów od razu.",
    push: "Powiedział{em|am}: nie ma pieniędzy. Nie ma o czym dalej mówić.",
    alt: [
      g("Rozumiem. Jaka kwota byłaby dla ciebie komfortowa? Wtedy zdecydujemy, czy ci to pasuje.", "Szukanie budżetu", "Nie kłócisz się z brakiem pieniędzy, tylko poznajesz granice."),
      g("Dobrze, nie spieszmy się. Wrócimy do tego, kiedy będzie ci wygodniej. Na razie prześlę informacje.", "Szacunek dla sytuacji", "Dobry ruch, ale można było zapytać o komfortowy budżet."),
      x("Pieniądze mają wszyscy, trzeba tylko ustalić priorytety: na drobiazgi pewnie wydajesz więcej.", "Umniejszanie", "Zarzut „złych priorytetów” rani."),
      x("Pożycz od znajomych albo weź raty: to inwestycja, wszystko odda, wielu tak robi.", "Rada zadłużenia się", "Doradzanie długu na zakup to poważny błąd etyczny."),
    ],
  },
  no_network: {
    soft: "W ogóle nie wiem, komu to proponować. Mój krąg jest mały.",
    hard: "Moi znajomi nie znoszą „sieciowych” rzeczy. Stracę przyjaciół.",
    push: "Nie dam rady tak, to nie dla mnie.",
    alt: [
      g("Zaczynać nie trzeba od znajomych, a biznes jest dobrowolny. Opowiedzieć, jak to działa?", "Alternatywny start", "Zdjęto strach przed „koniecznością zapraszania przyjaciół”."),
      g("Sprawdźmy: z kim rozmawiasz w ciągu tygodnia? Bez zobowiązania, żeby cokolwiek proponować, po prostu spojrzymy na krąg.", "Wspólne ćwiczenie", "Zastrzeżenie stało się małą praktyką."),
      x("Znajomych ma każdy, po prostu nie chcesz się przełamać. Trzeba pracować, a nie szukać powodów.", "Umniejszanie", "Oskarżenie o lenistwo zamyka dialog."),
      x("Napisz do wszystkich z telefonu tą samą wiadomością: ktoś na pewno odpowie.", "Podejście spamowe", "Rada pisania do wszystkich szkodzi reputacji klienta."),
    ],
  },
  not_salesperson: {
    soft: "Nie umiem sprzedawać, to nie dla mnie. Jestem w ogóle skromn{ym człowiekiem|ą osobą}.",
    hard: "Nie chcę nikogo namawiać, to upokarzające. Sprzedaż to nie moja rzecz.",
    push: "Znowu o sprzedaży. Przecież mówił{em|am}, że nie jestem handlowcem.",
    alt: [
      g("Dobrze, że tak mówisz. Pokażę bez „wciskania”, jak to działa.", "Przyznanie racji + przeformułowanie", "Przyjęto obawę i przeformułowano „sprzedaż”."),
      g("Można zacząć jako zwykły klient: korzystać z konta dla siebie. Sieć jest dobrowolna. Opowiedzieć?", "Alternatywny start", "Dobrze, ale bez pytania o to, czego dokładnie boi się klient."),
      x("Nauczysz się: sprzedaż jest prosta, każdy opanuje ją w tydzień, nie ma się czego bać.", "Ignorowanie zastrzeżenia", "Jeśli to „proste”, klient poczuje się głupio."),
      x("To po co {przyszedłeś|przyszłaś}? Tu bez tego się nie da, albo się uczysz, albo nie marnuj czasu.", "Presja", "Pytanie brzmi jak wyrzut."),
    ],
  },
  proof_request: {
    soft: "Mogę zobaczyć dokumenty? Przywykł{em|am} wierzyć tylko papierom.",
    hard: "Pokaż wszystko, co można sprawdzić: umowę, warunki, dane firmy. Inaczej dalej nie idziemy.",
    push: "Słowa mi niepotrzebne. Gdzie są papiery?",
    alt: [
      g("Oczywiście. Oto {proof}. Obejrzyj spokojnie, a jeśli czegoś zabraknie, powiedz, a znajdę.", "Dowód + gotowość uzupełnienia", "Pokazano to, co da się sprawdzić, i gotowość dodania więcej."),
      g("Mogę przesłać {proof} zaraz po rozmowie. Co jest dla ciebie najważniejsze do sprawdzenia w pierwszej kolejności?", "Dowody na piśmie + pytanie", "Dobrze i od razu doprecyzowanie priorytetów."),
      x("Wszyscy moi klienci są zadowoleni, możesz zapytać każdego, nikt nigdy się nie skarżył i niczego nie żałował.", "Puste zapewnienia", "Bez konkretów i kontaktów do sprawdzenia to puste słowa."),
      x("Za swoje słowa odpowiadam, u nas wszystko jest idealnie i bez problemów, więc dokumenty ci się nie przydadzą.", "Fałszywa obietnica", "„Idealnie i bez problemów” to czerwona flaga dla analityka."),
    ],
  },
  income_question: {
    soft: "A ile ty sam zarabiasz na tym, jeśli to nie tajemnica?",
    hard: "Podaj swój realny dochód za ostatnie trzy miesiące. Nie „potencjał”, tylko liczbę.",
    push: "Wykręcasz się. Jedną liczbę, proszę.",
    alt: [
      g("Odpowiem uczciwie: wynik zależy od wysiłku, a gwarancji dochodu nie ma.", "Uczciwość bez gwarancji", "Uczciwa odpowiedź bez upiększeń to najlepszy dowód."),
      g("Swoje liczby podam, jakie są, ale tobie ich nie obiecuję. Strukturę wypłat można zobaczyć w dokumentach firmy.", "Przeniesienie na dokumenty", "Słusznie, ale unik od osobistego pytania jest wyczuwalny."),
      x("Wystarczająco, żeby nie pracować na kogoś. Ty też możesz, jeśli będziesz robić to, co ja.", "Przechwałki", "Brzmi jak manipulacja i zawiera obietnicę."),
      x("Dużo, a ty za parę miesięcy dojdziesz do takiego poziomu, jeśli nie będziesz leniwy.", "Fałszywa obietnica dochodu", "Obietnica dochodu to naruszenie etyki i prawa reklamy."),
    ],
  },
  stall: {
    soft: "Wrzuć mi wszystko na komunikator, obejrzę w wolnej chwili.",
    hard: "Nie trzeba niczego pokazywać. Po prostu wyślij informacje.",
    push: "To wyślesz czy nie?",
    alt: [
      g("Wyślę. Co jest dla ciebie ważniejsze do zobaczenia najpierw: płatności, warunki czy przykłady? Wyślę dokładnie to.", "Doprecyzowanie zainteresowania", "Formalna prośba zamienia się w dialog."),
      g("Dobrze, wyślę dziś. Umówimy się, że napiszę jutro zapytać o wrażenia?", "Umówienie następnego kontaktu", "Kontakt ustalony: dobrze."),
      x("Co tam czytać, opowiem ci wszystko od razu i bez maili będzie jasne.", "Ignorowanie prośby", "Ignorujesz prośbę klienta."),
      x("Wyślę, ale decyzję trzeba podjąć dzisiaj, inaczej warunki się zmienią.", "Fałszywa rzadkość", "Presja „dzisiaj” razem z „wyślę” brzmi absurdalnie."),
    ],
  },
  aggression: {
    soft: "Mam dość waszych wiadomości. Rozumiesz w ogóle, że przeszkadzasz?",
    hard: "Przestań dzwonić! Skąd masz mój numer? Złożę skargę!",
    push: "Powiedział{em|am}: odczep się! Czego nie rozumiesz?",
    alt: [
      g("Słyszę, że jesteś zirytowan{y|a}, i przepraszam za zakłócenie. Co dokładnie cię irytuje? Uwzględnię to.", "Deeskalacja", "Przyjęto emocję i dano możliwość wypowiedzenia się."),
      g("Przepraszam za kłopot. Jeśli chcesz, już nie napiszę, powiedz tylko.", "Przeprosiny i szacunek dla granicy", "Szacunek dla granicy — ale bez szansy na zachowanie kontaktu."),
      x("Bez nerwów, proszę. Wykonuję swoją pracę i muszę dokończyć rozmowę.", "Umniejszanie emocji", "„Bez nerwów” tylko rozpala."),
      x("Przecież sam{|a} zostawił{eś|aś} zgłoszenie, więc nie ma co się oburzać.", "Usprawiedliwianie", "Usprawiedliwianie stawia klienta w roli winnego, a co do „zgłoszenia” możesz się mylić."),
    ],
  },
  manipulation: {
    soft: "Jestem gotow{y|a} wziąć, jeśli dacie choć jakąś zniżkę albo bonus.",
    hard: "Inny klub proponuje dwa razy taniej. Albo się zrównacie, albo odchodzę.",
    push: "To idziecie na ustępstwa czy nie?",
    alt: [
      g("Cenę i warunki ustala firma, zniżki nie obiecuję. Pomogę dobrać pakiet pod twoje podróże.", "Twarda postawa + wartość", "Uczciwie powiedziano, czego nie można, i zaproponowano to, co można."),
      g("Rozumiem chęć korzyści. Zobaczmy, co da się ustalić w ramach warunków firmy, bez obietnic rzucanych na wiatr.", "Szukanie rozwiązania w granicach", "Słusznie, ale bez wyraźnego „nie” dla zniżki."),
      x("Dobrze, dam zniżkę, tylko nie odchodź. Powiedzmy dwadzieścia procent i rejestrujemy od razu.", "Oddanie pozycji", "Obiecano to, czego nie ma, i pokazano, że cena jest nieprawdziwa."),
      x("Jeśli odejdziesz, stracisz jedyną szansę, drugiej takiej nie będzie. Decyduj, póki oferta obowiązuje.", "Fałszywa rzadkość", "Klient-manipulant odchodzi właśnie od presji."),
    ],
  },
  smokescreen: {
    soft: "Wydaje mi się to zbyt drogie. I w ogóle jakoś niejasne.",
    hard: "Nie, cena jest po prostu niepoważna. Nie zgadzam się płacić takich pieniędzy.",
    push: "Nie chodzi tylko o cenę, ale nie umiem tego wyjaśnić.",
    alt: [
      g("Rozumiem. A gdyby cena była inna, czy coś jeszcze pozostałoby wątpliwością?", "Sprawdzenie ukrytego zastrzeżenia", "Sprawdzasz, czy to prawdziwe zastrzeżenie."),
      g("Zobaczmy, co obejmuje {tierPrice}: {terms}. I powiedz, która część budzi pytania.", "Praca z ceną", "Odpowiadasz na to, co padło, i doprecyzowujesz."),
      x("Drogo w porównaniu z czym? U innych jeszcze drożej, a jakość gorsza, więc nic nie tracisz.", "Spór", "Kłócisz się z zastrzeżeniem, które może być fałszywe."),
      x("Mogę poprosić zarząd o zniżkę, ale tylko jeśli zapiszesz się dziś.", "Zmyślona zniżka", "Nie masz prawa obiecywać zniżki i to nie rozwiązuje problemu."),
    ],
  },
};
