import type { MiniText } from "../types";

/** Polski tekst ręcznie napisanego przypadku poziomu 3 „Sceptyczna księgowa” (graf: content/miniCase.ts). */
export const mini: MiniText = {
  title: "Sceptyczna księgowa",
  persona: {
    name: "Irena",
    profession: "księgowa",
    psychotype: "Analityk",
    pain: "Uwielbia podróżować, ale spędza godziny na szukaniu korzystnych cen",
    hiddenMotive: "Chce częściej jeździć z rodziną, ale boi się powtórzyć błąd przyjaciółki",
    redButton: "Kłamstwo i presja, obietnice „złotych gór”",
    goldenKey: "Uczciwość, liczby na jej własnej podróży, prawo do namysłu",
  },
  briefing:
    "Dzwonisz do Ireny, znajomej znajomych. Podróżuje 2–3 razy w roku, nocleg szuka sama na Bookingu. Proponujesz jej członkostwo MWR Life na poziomie Elite: $340, z czego $100 to opłata rejestracyjna firmy, a $240 to punkty na konto Travel Advantage; dalej abonament $120 miesięcznie. Cel: zarejestrować Elite lub umówić następny krok.",
  hiddenContext:
    "Przyjaciółka Ireny zainwestowała w podobny klub, obiecano jej zwrot w dwa miesiące, a wyjść udało się dopiero po pół roku. Mąż Ireny jest przeciw wszelkim „schematom” — to jej ukryte zastrzeżenie. Fakty do samodzielnego sprawdzenia: Elite — $340 ($100 opłata dla firmy, $240 w punktach na konto Travel Advantage), abonament $120 miesięcznie; zarobek jest możliwy tylko z rozwijania własnej sieci, gwarancji nie ma.",
  nodes: {
    n1: {
      text: "Halo? Tak, mówi Irena. To w sprawie tego klubu podróży?.. To znowu marketing sieciowy?",
      hint: "Jej pytanie jest bezpośrednie. Co najmocniej zdejmuje podejrzenia: wymijanie czy otwartość?",
      choices: {
        a: { text: "Tak, model jest sieciowy, nie będę tego ukrywać. Co dokładnie cię w tym niepokoi?", technique: "Przyznanie racji + doprecyzowanie", coachNote: "Przyznano oczywistość i zapytano o przyczynę wątpliwości — zaufanie rośnie, a ty zdobywasz informacje." },
        b: { text: "Pozwól, że szybko opowiem, czym jesteśmy lepsi od Bookingu — mamy zamknięte ceny dla uczestników!", mistake: "Ignorowanie zastrzeżenia", coachNote: "Nie odpowiedziano na bezpośrednie pytanie i uciekło się w monolog o zniżkach." },
        c: { text: "Nie, nie, skąd, to coś zupełnie innego — zamknięty klub dla mądrych podróżników!", mistake: "Kłamstwo", coachNote: "Zaprzeczenie modelu sieciowego to kłamstwo. Łatwo je sprawdzić, a zaufanie znika natychmiast." },
        d: { text: "Rozumiem, telefon jest niespodziewany. Daj mi dwie minuty — a sama zdecydujesz, czy to ciekawe?", technique: "Przyznanie racji + łagodna zgoda", coachNote: "Grzecznie, ale na pytanie o MLM nie odpowiedziano — wróci ono później." },
      },
    },
    n2: {
      text: "Przynajmniej szczerze. Mnie już oszukano — przyjaciółka zainwestowała w taki klub i potem pół roku nie mogła wyjść. Skąd mam wiedzieć, że u was jest inaczej?",
      hint: "Zanim padną argumenty, człowiek musi zostać wysłuchany. Co wiesz o tej historii?",
      choices: {
        a: { text: "Współczuję twojej przyjaciółce. Co dokładnie jej nie wyszło? Chcę zrozumieć, czego ci brakuje do spokoju.", technique: "Empatia + pytanie otwarte", coachNote: "Odkryto ukryty ból zamiast od razu się bronić." },
        b: { text: "U nas wszystko jest oficjalne: jest umowa i warunki firmy. Możesz sprawdzić sama.", technique: "Dowód faktami", coachNote: "Fakty działają, ale pominięto emocjonalną część jej historii." },
        c: { text: "To nie był nasz klub, u nas tak nie bywa.", mistake: "Usprawiedliwianie", coachNote: "„U nas tak nie bywa” brzmi jak zbycie — tak mówią wszyscy." },
        d: { text: "Po prostu spróbuj — nic nie stracisz!", mistake: "Presja i fałszywa obietnica", coachNote: "„Nic nie stracisz” to obietnica bez podstaw. Dla osoby ze złym doświadczeniem to czerwona płachta." },
      },
    },
    n2b: {
      text: "Chwileczkę. Na waszej stronie jest napisane „program partnerski” i „polecenia”. Rozmawiasz ze mną w ogóle szczerze?",
      hint: "Błąd można przyznać — to czasem przywraca zaufanie. Zbyć — na pewno nie.",
      choices: {
        a: { text: "Masz rację, pierwsza odpowiedź była wymijająca — przepraszam. Tak, program partnerski istnieje, ale z klubu można korzystać bez niego. Trzymajmy się faktów?", technique: "Przyznanie błędu", coachNote: "Szczere przyznanie to jedyny sposób na odzyskanie zaufania po nieścisłości." },
        b: { text: "No to taki marketing, nie zwracaj uwagi.", mistake: "Ignorowanie zastrzeżenia", coachNote: "Zbycie oczywistej sprzeczności to potwierdzenie, że coś ukrywasz." },
        c: { text: "Po prostu naczytałaś się plotek w internecie.", mistake: "Spór", coachNote: "Kłócenie się z klientem i umniejszanie jego źródeł to szybka droga do końca rozmowy." },
      },
    },
    n2c: {
      text: "Zamknięte ceny... Ja i tak szukam na Bookingu, ceny tam nie są gorsze. A czasu, szczerze mówiąc, nie mam za wiele.",
      hint: "Nie kłóć się z Bookingiem. Lepiej dowiedz się, jak ona podróżuje.",
      choices: {
        a: { text: "Często podróżujesz? Gdzie byłaś ostatnio i jak dobierałaś nocleg?", technique: "SPIN — pytania sytuacyjne", coachNote: "Zamiast kłócić się z konkurentem, dowiedziano się, jak klientka szuka podróży — to materiał do wyliczenia." },
        b: { text: "Booking to jeden serwis, a my mamy zamknięte ceny, których tam nie ma.", mistake: "Spór", coachNote: "Twierdzenie bez dowodów. Ona może sprawdzić i nie znaleźć potwierdzenia." },
        c: { text: "Rozumiem, że mało czasu. Zadzwonię w czwartek o dogodnej porze — na 10 minut?", technique: "Zamknięcie na następny krok", coachNote: "Szacunek dla czasu i konkretne ustalenie. Ale potrzeb klientki nie poznano." },
      },
    },
    n3: {
      text: "Jej obiecano, że klub zwróci się w dwa miesiące. Nie zwrócił się. Płaciła składkę, a podróży prawie nie było. Nie chcę tak samo.",
      hint: "Obietnice zwrotu to dokładnie to, co ją sparzyło. Jak mówić, żeby tego nie powtórzyć?",
      choices: {
        a: { text: "Dziękuję, że mi powiedziałaś. Nie obiecuję zwrotu: klub to korzystne podróże dla siebie. Jeśli jeździsz 2–3 razy w roku, policzmy, czy to opłaca się właśnie tobie.", technique: "Uczciwe ujęcie + przejście do wyliczenia", coachNote: "Zrezygnowano ze „złotych gór” — dokładnie to, co chciała usłyszeć." },
        b: { text: "Przyjaciółka po prostu słabo pracowała. U nas można zarobić bardzo dużo, najważniejsze to chcieć.", mistake: "Fałszywa obietnica dochodu", coachNote: "Obietnica dochodu to naruszenie etyki i prawa reklamy. I dokładne powtórzenie tego, co ją sparzyło." },
        c: { text: "Rozumiem. Przejdźmy do liczb.", coachNote: "Zbyt szybko przeszło się do rzeczy — emocja została bez odpowiedzi." },
      },
    },
    n3b: {
      text: "Osoba prawna, umowa... to wszystko dobrze. Ale ile to w ogóle kosztuje i co dostanę?",
      hint: "Podaj liczby i warunki bez upiększeń.",
      choices: {
        a: { text: "Powiem uczciwie i krótko: składkę i warunki podam, ale najpierw chcę zrozumieć, jak teraz wybierasz hotele. Tak policzymy realną korzyść.", technique: "SPIN — pytanie sytuacyjne", coachNote: "Rozmowa wróciła do jej sytuacji zamiast abstrakcyjnych obietnic." },
        b: { text: "Wejście kosztuje $340. Resztę dowiesz się na prezentacji.", mistake: "Monolog / unikanie odpowiedzi", coachNote: "Zaproszenie „na prezentację” zamiast odpowiedzi irytuje analityka." },
      },
    },
    n4: {
      text: "No dobrze, załóżmy, że jeżdżę przynajmniej raz w roku. A ile kosztuje wejście? I jakie mam gwarancje, że nie stracę pieniędzy?",
      hint: "Słowo „gwarancje” to pułapka. Co naprawdę możesz zagwarantować, a czego nie?",
      choices: {
        a: { text: "Elite to $340: $100 to opłata rejestracyjna firmy, $240 to punkty na twoje konto Travel Advantage, dalej abonament $120 miesięcznie. Oszczędności nie gwarantuję, ale sprawdźmy na twojej ostatniej podróży: dokąd jechałaś i ile zapłaciłaś?", technique: "Uczciwa odpowiedź + sprawdzenie na jej danych", coachNote: "Cena podana wprost, gwarancji nie zmyślono, sprawdzenie jest na jej liczbach. Dla analityka to ideał." },
        b: { text: "To inwestycja, zwróci się już z pierwszej podróży — gwarantuję.", mistake: "Fałszywa obietnica", coachNote: "Słowo „gwarantuję” to tu prosta droga do skargi i zwrotu." },
        c: { text: "$340 i jeszcze $120 miesięcznie. Decyduj sama.", mistake: "Chłodne podanie", coachNote: "Liczba bez wartości i bez troski — klientka zostaje sam na sam z wątpliwościami." },
        d: { text: "Nie mówmy o pieniądzach, tylko o emocjach: wyobraź sobie siebie na Bali o zachodzie słońca...", mistake: "Unikanie pytania", coachNote: "Analityczka zadała konkretne pytanie — odpowiedź „o emocjach” ją irytuje." },
      },
    },
    n5: {
      text: "Tak... Muszę się zastanowić. I omówić to z mężem — nie lubi takich rzeczy.",
      hint: "Mąż to ukryte zastrzeżenie. Lepiej zaprosić go do rozmowy, niż go ominąć.",
      choices: {
        a: { text: "Oczywiście. Co zwykle mówi mąż o takich rzeczach? Przyślę wyliczenie dla twojej podróży, pokażesz mu liczby, a w czwartek porozmawiamy we troje?", technique: "Praca z osobą trzecią + następny krok", coachNote: "Nie ominięto męża, tylko uczyniono go uczestnikiem decyzji i wyznaczono konkretny krok." },
        b: { text: "Dobrze, zastanów się. Napiszę do ciebie w tym tygodniu.", technique: "Odroczone zamknięcie", coachNote: "Rozmyte „napiszę w tym tygodniu” bez daty i celu to częsta przyczyna cichego zgubienia klienta." },
        c: { text: "No jeśli mąż jest przeciw, to po co ci to w ogóle?", mistake: "Presja / umniejszanie", coachNote: "Dotknięto spraw osobistych i postawiono ją przed wyborem „ja albo mąż”." },
        d: { text: "Zarejestrujmy Elite jeszcze dziś, a mężowi powiesz później.", mistake: "Presja", coachNote: "Radzenie, by ukryła decyzję przed mężem, to toksyczna presja i ryzyko wizerunkowe." },
      },
    },
    n6: {
      text: "Dobrze, podoba mi się, że nie obiecujesz cudów. Policz to dla mojej podróży do Turcji. Co jest potrzebne, żeby zacząć?",
      hint: "Teraz potrzebny jest jasny, łagodny następny krok — bez presji i bez zmyślonej rzadkości.",
      choices: {
        a: { text: "Proponuję tak: najpierw prześlę wyliczenie dla twojej Turcji, a jeśli liczby ci odpowiadają — razem zarejestrujemy Elite. Zgoda?", technique: "Zamknięcie na weryfikowalny krok", coachNote: "Klientka sama decyduje na liczbach — sprzedaż bez ryzyka zwrotu." },
        b: { text: "Elite można zarejestrować już dziś: $340, z czego $100 to rejestracja, a $240 to punkty na konto Travel Advantage, dalej $120 miesięcznie. Wszystkie warunki prześlę na piśmie. Pasuje?", technique: "Zamknięcie z alternatywą", coachNote: "Wszystkie płatności nazwano wprost, warunki są na piśmie. Dobra druga droga do wygranej." },
        c: { text: "Świetnie! Tylko dziś zostały 2 miejsca w promocji!", mistake: "Kłamstwo o rzadkości", coachNote: "Zmyślona rzadkość niszczy zaufanie, które dopiero co zdobyto." },
        d: { text: "Dobrze. Prześlij paszport i dane karty od razu — zarejestruję.", mistake: "Presja na tempo", coachNote: "Proszenie o dane karty przez telefon to zbyt gwałtowny krok wobec klientki, która dopiero co ochłonęła." },
      },
    },
    end_sale_clean: { text: "Irena: „Umowa stoi. Prześlij wyliczenie, a jeśli wszystko się zgodzi — zarejestrujemy. Dziękuję, że bez sztuczek”.", reason: "SALE CLOSED: klientka zgodziła się na wyliczenie i rejestrację według wyniku." },
    end_sale_trial: { text: "Irena: „Dobrze, rejestrujemy Elite. Warunki prześlij na e-mail”.", reason: "SALE CLOSED: Elite zarejestrowano przy pełnym zrozumieniu płatności i warunków." },
    end_partial_meeting: { text: "Irena: „Dobrze, w czwartek porozmawiamy we troje. Mąż chętnie obejrzy liczby”.", reason: "PARTIAL: wyznaczono rozmowę z mężem — ukryte zastrzeżenie wyniesiono na światło dzienne." },
    end_partial_call: { text: "Irena: „No dobrze, w czwartek o szóstej wieczorem. Tylko krótko”.", reason: "PARTIAL: umówiono rozmowę, ale potrzeb klientki nie poznano." },
    end_partial_vague: { text: "Irena: „Tak, tak, napisz kiedyś. Do widzenia”.", reason: "PARTIAL: następny krok jest rozmyty — szansa na odzyskanie klientki jest niewielka." },
    end_lost_lie: { text: "Irena: „Nie lubię, gdy ktoś mnie okłamuje. Wszystkiego dobrego”. Sygnał zajętości.", reason: "GAME OVER: kłamstwo o modelu sieciowym wyszło na jaw, zaufanie utracone." },
    end_lost_promise: { text: "Irena: „Dokładnie takie same słowa mówiono mojej przyjaciółce. Rozmowa skończona”.", reason: "GAME OVER: obietnica dochodu lub gwarancji powtórzyła historię, która ją sparzyła." },
    end_lost_pressure: { text: "Irena: „Proponujesz mi oszukiwać męża? Nie dzwoń do mnie więcej”.", reason: "GAME OVER: presja i rada ukrycia decyzji — klientka odeszła." },
    end_lost_spouse: { text: "Irena: „To moja rodzina, nie tobie ją oceniać. Do widzenia”.", reason: "GAME OVER: dotknięto spraw osobistych — ukryte zastrzeżenie „mąż jest przeciw” stało się przyczyną odmowy." },
    end_lost_scarcity: { text: "Irena: „Dwa miejsca, tylko dziś... Już to słyszałam. Nie, dziękuję”.", reason: "GAME OVER: zmyślona rzadkość zniszczyła dopiero co zdobyte zaufanie." },
  },
};
