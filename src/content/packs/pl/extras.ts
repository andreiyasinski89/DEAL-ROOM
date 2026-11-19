import { m } from "../helpers";
import type { Extras } from "../types";
import { beatsAlt } from "./beatsAlt";

/** Polskie teksty dodatkowych klocków (szkielet: data/moves.ts). {a|b}: forma męska|żeńska klienta. */
export const extras: Extras = {
  events: {
    interrupt: {
      line: "Chwileczkę... Przepraszam, dzwonią do mnie na drugiej linii, to pilne. Poczekasz?",
      opts: [
        m("Oczywiście, odbierz. Jeśli wygodniej, oddzwonię za dziesięć minut — powiedz tylko kiedy.", "Szacunek dla czasu + wybór", "Nie rywalizowano z cudzą pilną sprawą i dano wybór: klient wróci spokojny."),
        m("Poczekam, bez pośpiechu. Jak wrócisz, szybko przypomnimy, na czym stanęliśmy.", "Pauza bez presji", "Dobrze, ale nie zaproponowano oddzwonienia później."),
        m("Zostało mi do powiedzenia naprawdę niewiele: dokończę myśl o pakietach, a potem odbierzesz.", "Ignorowanie rozproszenia", "Klient powiedział, że to pilne, a ty trzymasz się swojego."),
        m("To ważna rozmowa, drugi telefon może poczekać. Nie rozpraszaj się, proszę: właśnie rozstrzyga się twój udział i nie można tego odkładać.", "Presja na uwagę", "Żądanie uwagi zamiast szacunku dla cudzej pilnej sprawy prowadzi do irytacji."),
      ],
      bye: "U ciebie wszystko jest ważniejsze niż moje sprawy. Nie dziś.",
      why: "Pilna sprawa klienta nie została uszanowana i zakończył rozmowę.",
    },
    competitor_offer: {
      line: "Przy okazji, wczoraj dostał{em|am} ofertę od podobnego klubu, podobno tańszą. Co powiesz?",
      opts: [
        m("Dobrze, że porównujesz. Prześlij ich warunki, przejdziemy punkt po punkcie: płatności, co obejmują, jak wyjść.", "Porównanie według kryteriów", "Nie atakujesz konkurenta, tylko proponujesz uczciwe zestawienie warunków i poznajesz priorytety klienta."),
        m("Powiedz, w czym dokładnie jest tańsza. Spojrzymy na twoje podróże, co komu bardziej się opłaca.", "Wyliczenie na podróżach", "Rozsądnie, ale nie poproszono o same warunki oferty."),
        m("Takich klubów jest wiele, ale u nas na pewno lepiej, uwierz, jesteśmy na rynku od dawna i wiemy, co robimy.", "Spór bez faktów", "Twierdzenie bez porównania brzmi jak reklama, a nie jak odpowiedź."),
        m("To na pewno oszustwo: takie kluby upadają po pół roku. Nie ryzykuj pieniędzy, zapisz się u nas.", "Umniejszanie konkurenta", "Nie widziano ich warunków: takie słowa to kłamstwo lub domysł i podkopują zaufanie."),
      ],
      bye: "Źle mówisz o innych, nawet nie patrząc na warunki. Porównam sam{|a}.",
      why: "Klient chciał uczciwego porównania, a dostał krytykę konkurenta bez faktów.",
    },
    friend_story: {
      line: "Znajomy opowiadał mi, że wstąpił do takiego klubu i potem nie mógł nic odzyskać. Zdarza się tak?",
      opts: [
        m("Dziękuję, że mówisz. Co dokładnie poszło nie tak u znajomego? Jego warunków nie znam, a twoje pokażę na piśmie przed płatnością.", "Empatia + dokumenty", "Nie tłumaczysz cudzej historii i zdejmujesz strach weryfikowalnymi warunkami."),
        m("To możliwe. Otwórzmy umowę i zobaczmy, jak w twoim przypadku wyglądają wyjście i zwrot.", "Oparcie na dokumencie", "Słusznie, ale bez pytania o to, co się stało ze znajomym."),
        m("To na pewno był inny klub, u nas tak nie bywa, wszystko jest inaczej, ręczę za to.", "Usprawiedliwianie", "„U nas tak nie bywa” słyszał każdy, kogo już oszukano."),
        m("Twój znajomy pewnie po prostu nie przeczytał umowy. Nie wierz takim opowieściom, szkodzą ludziom.", "Spór z opowieścią klienta", "Umniejszono źródło klienta i w gruncie rzeczy obwiniono znajomego."),
      ],
      bye: "Słyszał{em|am} dość. Nie, dziękuję.",
      why: "Opowieść znajomego klienta nie została wysłuchana, tylko zbyta.",
    },
    quote_request: {
      line: "Czy mogę od razu w liczbach: ile muszę zapłacić i na ile wychodzi to w ciągu roku?",
      opts: [
        m("Wejście to {tierPrice}, potem {sub}; w skali roku abonament to $1 440. Resztę pokażę na piśmie.", "Przejrzyste liczby + pytanie", "Wszystkie płatności nazwane, suma roczna policzona od razu, reszta z dokumentów."),
        m("Wejście to {tierPrice}, potem {sub}. Wyliczenie roczne prześlę na piśmie.", "Liczby bez dodatków", "Uczciwie i krótko, ale nie podano sumy rocznej."),
        m("To wszystko proste, w sumie wychodzi niewiele, a korzyść pokryje każde koszty, nawet nie ma co liczyć.", "Mglista suma", "Na bezpośrednie pytanie o liczby trzeba odpowiedzieć wprost, a nie „niewiele”."),
        m("W sumie wyjdzie bardzo niewiele, a wszystko zwróci się w parę miesięcy, to dawno sprawdzone na ludziach.", "Fałszywa obietnica zwrotu", "Nie wolno obiecywać zwrotu: to prosta droga do skargi."),
      ],
      bye: "Nie podają mi liczb. Wszystkiego dobrego.",
      why: "Na bezpośrednie pytanie o koszt klient nie dostał jasnych liczb.",
    },
    skeptic_question: {
      line: "Powiedz szczerze: korzystasz z tego sam? I co z tego masz?",
      opts: [
        m("Odpowiem wprost: zależy mi na twojej decyzji, ale nie sprzedam ci tego, co ci nie pasuje.", "Bezpośrednia odpowiedź o własnym interesie", "Uczciwie nazwano własny interes i nie ukryto go."),
        m("Tak, korzystam. Co dokładnie chcesz wiedzieć: jak działają punkty czy jak jest zbudowany abonament?", "Krótka odpowiedź + doprecyzowanie", "Dobrze, ale o własnym interesie nie powiedziano nic."),
        m("Jasne, dlatego ci opowiadam: jestem w temacie od dawna, wszystko mi się podoba i każdemu znajomemu radzę to samo.", "Przechwałki", "Opowieść o własnym zachwycie nie odpowiada na pytanie „co z tego masz”."),
        m("Korzystam i już dobrze zarabiam, ty też możesz, jeśli zechcesz i będziesz robić tak jak ja.", "Obietnica dochodu", "Obietnica dochodu to naruszenie etyki i prawa reklamy."),
      ],
      bye: "Wygląda na to, że chcą mi po prostu coś sprzedać. Nie interesuje mnie to.",
      why: "Uczciwej odpowiedzi o własnym interesie sprzedawcy klient nie dostał.",
    },
    silence: {
      line: "Ok.",
      opts: [
        m("Dzięki za odpowiedź. Zostały jakieś pytania? Mogę krótko napisać albo zadzwonić, jak ci wygodniej.", "Łagodne pytanie otwarte", "Krótka odpowiedź to sygnał. Nie naciskasz i proponujesz wybór kanału."),
        m("Jeśli niewygodnie pisać, mogę zadzwonić o dogodnej porze. Albo napisz, co dokładnie jest niejasne.", "Alternatywny kanał", "Dobry ruch, ale bez pytania o przyczynę milczenia."),
        m("Jesteś tam? Odpowiedz, proszę, ważne jest dla mnie, co myślisz, czekam.", "Naciskanie na odpowiedź", "Żądanie odpowiedzi od kogoś, kto milczy, to presja."),
        m("Czemu milczysz? Jeśli cię to nie interesuje, powiedz wprost. Zdecyduj teraz, potem może być za późno.", "Ultimatum", "Ultimatum w czacie zamyka dialog."),
      ],
      bye: "Nie trzeba mnie poganiać. Do widzenia.",
      why: "Krótka odpowiedź klienta nie została odczytana jako sygnał, a on został przyciśnięty.",
    },
    third_joins: {
      line: "Siedzi obok mnie ktoś, komu ufam w takich sprawach. Nie masz nic przeciwko, żebyśmy porozmawiali we troje?",
      opts: [
        m("Z przyjemnością. Przypomnijmy krótko to, co ważne dla was obojga, a potem zadacie dowolne pytania.", "Włączenie osoby trzeciej", "Nowego uczestnika uczyniono częścią decyzji, a nie przeszkodą."),
        m("Dobrze. Krótko powtórzę najważniejsze, żebyście oboje byli na bieżąco.", "Krótkie powtórzenie", "Słusznie, ale warto było zapytać, co ważne właśnie dla niej lub dla niego."),
        m("Pozwólcie, że kontynuuję od miejsca, na którym skończyliśmy, a pytania potem, żeby nie tracić czasu.", "Ignorowanie nowego uczestnika", "Pominięto nową osobę w rozmowie, a ona decyduje razem z klientem."),
        m("To zapiszmy się dziś, póki jesteście oboje nastawieni, a szczegóły opowiesz potem.", "Presja i ukrywanie decyzji", "Pośpiech przy osobie trzeciej to czerwony przycisk klienta."),
      ],
      bye: "Przemyślimy to we dwoje. Nie dzwońcie więcej.",
      why: "Nowego uczestnika rozmowy nie włączono, a decyzję próbowano przyspieszyć.",
    },
    time_check: {
      line: "Zostało mi jakieś pięć minut, potem muszę uciekać. Co jest najważniejsze?",
      opts: [
        m("To wybierzmy najważniejsze: nazwij jedno pytanie, a resztę sprawdzimy na piśmie.", "Priorytet w ramach czasu", "Przyjęto ograniczenie i skupiono rozmowę na kliencie."),
        m("Dobrze, krótko: co dostajesz, ile to kosztuje i jak wyjść. Od czego zaczynamy?", "Zwarta struktura", "Dobra struktura, ale wybór tematu lepiej zostawić klientowi."),
        m("Pięć minut wystarczy, szybko przebiegnę po wszystkich punktach: firma, punkty, abonament, pakiety, sieć i biznes.", "Monolog", "Pięć minut na „wszystko” to monolog, a nie rozmowa."),
        m("Jak teraz nie masz czasu, potem też nie będziesz miał{|a}. Zdecydujmy wszystko od razu, póki jesteś na linii.", "Presja pośpiechu", "Wyrzut o brak czasu i presja dają odmowę."),
      ],
      bye: "Czas minął, a ja nadal nic nie zrozumiał{em|am}. Do widzenia.",
      why: "W pozostałych minutach klient nie dostał tego, co najważniejsze.",
    },
    tired: {
      line: "Szczerze, jestem wykończon{y|a} w tym tygodniu. Głowa już nie pracuje.",
      opts: [
        m("Rozumiem. Zróbmy to lekko: jedno pytanie na dziś, resztę w dogodny dzień. Zgoda?", "Empatia + mały krok", "Uznano stan klienta i zmniejszono obciążenie."),
        m("To nie będę cię obciążać. Kiedy byłoby ci wygodnie wrócić do rozmowy?", "Przesunięcie na prośbę klienta", "Dobrze, ale można było zostawić jeden mały krok."),
        m("Zdarza się, każdy tak ma. Mimo wszystko kontynuujmy, zostało mi naprawdę niewiele do opowiedzenia.", "Ignorowanie stanu", "Usłyszano zmęczenie i poszło się dalej, jakby go nie było."),
        m("Właśnie dlatego potrzebujesz zmian: zmęczenie bierze się z braku pieniędzy i odpoczynku, a my rozwiązujemy oba, nie można odkładać.", "Presja na ból", "Używanie zmęczenia jako argumentu to presja i obietnica, której nie ma."),
      ],
      bye: "Czuję się źle, a mnie namawiają. Przestańcie.",
      why: "Zmęczenia klienta nie uszanowano, a on został przyciśnięty.",
    },
  },
  openers: {
    tenMinutes: {
      line: "Dzień dobry. Od razu powiem: mam dziesięć minut, potem spotkanie. Co macie?",
      opts: [
        m("Dziękuję, że uprzedzasz. W dziesięć minut zdążę zadać parę pytań i pokazać najważniejsze. Można?", "Przyjęcie ram", "Przyjęto ograniczenie klienta i powiedziano, co się wydarzy w tym czasie."),
        m("Dobrze, krótko: powiem, o co chodzi, i czym to może być przydatne. Od czego zacząć?", "Krótkie przedstawienie", "Dobry start, ale ram czasu nie wypowiedziano."),
        m("Dziesięć minut to mało. Umówmy się na czterdzieści, inaczej wszystkiego nie wyjaśnię, a warto.", "Presja na czas", "Klient podał ramy, a ty je poszerzasz."),
        m("Rozmawialiśmy już na prezentacji, sam{|a} zostawił{eś|aś} zgłoszenie, więc mam zaplanowane pół godziny.", "Fałszywy pretekst", "Zmyślony powód rozmowy niszczy zaufanie od pierwszych sekund."),
      ],
    },
    referral: {
      line: "Twój kontakt dali mi znajomi, ale tak naprawdę niczego nie wiem. Od czego zaczniemy?",
      opts: [
        m("Podziękuj im za polecenie. Od czego zacząć, zdecydujesz ty: co już słyszał{eś|aś} i co chciał{byś|abyś} zrozumieć?", "Pytanie zamiast prezentacji", "Oddano klientowi inicjatywę i dowiedziano się, z czym przyszedł."),
        m("Krótko opowiem, o co chodzi, a ty podpowiesz, co cię interesuje. Dobrze?", "Krótki start", "Dobrze, ale pytanie o to, co klient już wie, byłoby mocniejsze."),
        m("Skoro cię polecono, jesteś już w temacie. Przejdźmy od razu do rejestracji, po co przeciągać.", "Presja polecenia", "Polecenie nie znosi prawa klienta do poznania tego, co kupuje."),
        m("Znajomi już wstąpili i są bardzo zadowoleni, więc ty też na sto procent nie pożałujesz.", "Fałszywa gwarancja", "Cudza opinia nie gwarantuje wyniku i nie wolno go obiecywać."),
      ],
    },
    direct: {
      line: "Zanim czegokolwiek wysłucham: to o pieniądzach czy o podróżach? Odpowiedz wprost.",
      opts: [
        m("O podróżach. Zarobek jest możliwy tylko z własnej sieci, gwarancji nie ma. Co jest dla ciebie ważniejsze?", "Bezpośrednia odpowiedź", "Bezpośrednie pytanie — bezpośrednia odpowiedź i żadnych obietnic."),
        m("I o jednym, i o drugim. Zacznijmy od podróży, a o sieci opowiem, jeśli zechcesz.", "Dwa tematy po kolei", "Uczciwie, ale bez wyraźnej granicy między korzyścią a zarobkiem."),
        m("To wszystko razem, nie dzielmy na części: najważniejsze to zaufać i zacząć, resztę przyniesie czas.", "Unikanie bezpośredniego pytania", "Klient prosił o szczerość, a ty poszedłeś w ogólniki."),
        m("O pieniądzach, i to poważnych: wielu naszych osiąga dobry dochód już w miesiąc.", "Obietnica dochodu", "Obietnica dochodu to naruszenie etyki i prawa reklamy."),
      ],
    },
  },
  closers: {
    discount: {
      line: "Dobrze, jestem gotow{y|a}. Ale dorzućcie jeszcze zniżkę albo bonus, to zapiszę się dziś.",
      opts: [
        m("Cenę i warunki ustala firma, zniżki nie obiecuję. Mogę za to zaproponować: {next}.", "Twarda postawa + wartość", "Uczciwie powiedziano „nie” zniżce i zaproponowano to, co można."),
        m("Zobaczmy, co faktycznie przewidują warunki firmy, i omówmy to bez obietnic.", "Szukanie rozwiązania w ramach warunków", "Słusznie co do sensu, ale bez wyraźnego „nie” dla zniżki."),
        m("Dobrze, spróbuję coś wywalczyć, powiedzmy dziesięć procent, tylko zapisz się dziś.", "Słaba pozycja", "Zniżka, której nie ma, to kłamstwo i powód do nieufności wobec ceny."),
        m("Tylko dziś i tylko dla ciebie zniżka trzydzieści procent, a jutro już jej nie będzie, więc decyduj szybko.", "Zmyślona rzadkość", "Zmyślona rzadkość niszczy zdobyte zaufanie."),
      ],
    },
    send: {
      line: "Zróbmy tak: prześlij wszystko mailem, obejrzę i sam{|a} zdecyduję.",
      opts: [
        m("Prześlę dziś płatności i warunki. I umówmy się: w czwartek napiszę, żeby odpowiedzieć na pytania.", "Konkretny następny krok", "Data i działanie zamiast „potem”: tak mail się nie gubi."),
        m("Dobrze, wyślę. Napiszę do ciebie w czwartek zapytać, co postanowił{eś|aś}.", "Umówienie kontaktu", "Dobrze, ale bez pytania, co klient chce zobaczyć."),
        m("Wyślę, jak znajdę czas, a ty na razie pomyśl, bez pośpiechu, daj znać, jak zdecydujesz.", "Rozmyty krok", "„Jak będę miał czas” i „daj znać” to przepis na ciche zgubienie klienta."),
        m("Wyślę, ale oferta obowiązuje tylko do jutra, więc decyduj szybciej, drugiej szansy nie będzie.", "Zmyślony termin", "Fałszywy termin razem z mailem brzmi absurdalnie."),
      ],
    },
    how: {
      line: "Załóżmy, że tak. Co konkretnie mam teraz zrobić i ile zapłacić?",
      opts: [
        m("Krok po kroku: najpierw warunki na piśmie, potem twoja decyzja. Płatności: {tierPrice} na start i {sub}.", "Jasność krok po kroku", "Klient widzi kolejność działań i wszystkie płatności z góry."),
        m("Najpierw umowa i warunki na piśmie. Płatności: {tierPrice} na start i dalej {sub}.", "Płatności wprost", "Uczciwie, ale bez wyjaśnienia kroków klient zostaje we mgle."),
        m("To bardzo proste, wszystko zarejestruję osobiście, prawie nic nie będziesz musiał{|a} robić, nie martw się.", "Rozmyta odpowiedź", "„Prawie nic” zamiast kroków i kwot to unik."),
        m("Rejestrujemy od razu, póki otwarte jest okno rejestracji: potem trzeba będzie czekać, a warunki mogą się zmienić.", "Zmyślony pośpiech", "Zmyślony pośpiech niszczy zaufanie na finiszu."),
      ],
    },
  },
  story: {
    hint: "Klient zaczął dzielić się czymś osobistym. Wysłuchaj i powiąż to z jego celami, a nie ze sprzedażą.",
    opts: [
      m("Dziękuję, że mi powiedział{eś|aś}. Zobaczmy, jak to się wiąże z twoimi podróżami i wydatkami?", "Powiązanie osobistego z celem", "Wysłuchano człowieka i przywrócono rozmowę do jego celów."),
      m("Rozumiem cię. Kontynuujemy?", "Współczucie", "Ciepło, ale bez przejścia do jego korzyści."),
      m("Tak jest u wszystkich, nic szczególnego. Wróćmy do naszego pytania, mamy jeszcze dużo do omówienia.", "Umniejszenie opowieści", "Klient się otworzył, a ty go zbył."),
      m("Właśnie dlatego pilnie potrzebujesz dodatkowego dochodu, a my dokładnie to dajemy, nie można odkładać.", "Presja na ból", "Wykorzystanie cudzego bólu jako argumentu to presja i obietnica dochodu."),
    ],
    bye: "Opowiedział{em|am} o osobistych sprawach, a mnie próbują coś sprzedać. Nie dzwońcie.",
    why: "Osobistą opowieść klienta wykorzystano do presji.",
  },
  stories: {
    irina: "Wiesz, spędzam wieczorami ze dwie godziny na szukaniu dobrych cen, a potem i tak się waham, czy nie przepłaciłam.",
    maxim: "Szczerze mówiąc, mam warsztat, dziesięciu ludzi i ani wolnej minuty. Urlopu nie brałem od trzech lat.",
    svetlana: "Z nauczycielskiej pensji nie ma się za bardzo jak rozwinąć. A chciałabym choć raz pojechać nad morze nie na wczasy z zakładu.",
    artem: "W pracy sama szarość, same raporty. Chciałbym czegoś jaskrawego, żeby było co pokazać przyjaciołom.",
    olga: "Jestem lekarką i od pół roku czuję, że się wypalam. Urlop pomógłby bardziej niż witaminy, ale nie mam czasu.",
    dmitry: "Zajmuję się zakupami i co kwartał z góry naciskają albo na terminy, albo na budżet. Potrzebuję liczb i żadnych niespodzianek.",
    natalia: "Cały dzień jestem wśród ludzi w salonie, a pieniędzy i tak mało. Marzę, żeby kiedyś otworzyć własne miejsce.",
    pavel: "Całymi dniami siedzę przy komputerze. Chciałbym drugiego źródła dochodu, ale w „schematy” nie wierzę.",
    elena: "Jestem na urlopie wychowawczym, nie mam własnych pieniędzy i to nieprzyjemne uczucie zależności. Chciałabym mieć choć trochę swojego.",
    viktor: "Sklep ostatnio ledwo zipie, a wszyscy dookoła tylko radzą. Mam dość tych doradców.",
    anna: "Mój dochód skacze: raz tłum klientów, raz cisza. Wypalam się od tej niestabilności.",
    sergey: "Pensja stoi w miejscu już ze pięć lat. Oszczędności mam, ale nie chcę nimi ryzykować.",
    marina: "Nocne zmiany wykańczają. Marzę o zmianie pracy, ale jakoś brakuje mi pewności siebie.",
    roman: "Prowadzę dział sprzedaży i na mnie są KPI całego zespołu. Znam wszystkie techniki, więc oszczędź mi „wody”.",
    yulia: "Prowadzę bloga i mam dość szablonowych reklam. Ważne jest dla mnie, żeby marka proponowała uczciwą współpracę.",
    alexey: "Jestem kierowcą tira, rzadko bywam w domu i tęsknię za rodziną. Chciałbym spędzać więcej czasu z dziećmi.",
    tatyana: "Mam sprawozdawczość roczną i ciągłe gorączkowe terminy. Ważna jest dla mnie przejrzystość i to, żeby wszystko było w dokumentach.",
    igor: "Koszty w restauracji rosną, brakuje ludzi. Chciałbym obniżyć wydatki, ale tak, żeby nie wyjść na słabego.",
    vera: "Emerytura mam niewielką, mieszkam sama. Sąsiadkę niedawno oszukano i teraz wszystkiego się boję.",
    kirill: "Jestem studentem, mam startup i mnóstwo pomysłów, ale ani pieniędzy, ani doświadczenia. Chcę udowodnić rodzinie, że poradzę sobie sam.",
    anatoly: "Jestem emerytem, byłym wojskowym. Chciałbym zobaczyć świat, ale dzieci powiedzą, że jestem naiwny.",
    ksenia: "Wokół mnie ciągle są ludzie, a na siebie nie mam czasu. Kocham podróże, ale w „schematy” nie wierzę.",
    gleb: "Przywykłem liczyć ryzyko i stopę zwrotu. Interesuje mnie każda asymetria na moją korzyść, ale tylko uczciwa.",
    polina: "Jestem projektantką na freelansie, pieniądze mam nieregularne. Marzę o podróżowaniu i pracy z różnych krajów.",
    stanislav: "Jestem chirurgiem, mało urlopów, dużo odpowiedzialności. Nie znoszę nieścisłości i wody.",
    larisa: "Praca ciężka, pensja niewielka, odłożyłam całkiem mało. Boję się stracić te pieniądze.",
    denis: "Pracuję w banku i zawodowo liczę cudze ryzyko. Do każdej „korzyści” podchodzę sceptycznie.",
    alla: "Mam kwiaciarnię, przychody sezonowe. Chcę pięknego życia, ale sklepem ryzykować nie będę.",
    timur: "Rutyna, bieżąca działalność bez dni wolnych. Szukam jeszcze jednego źródła dochodu, które da się skalować.",
    zoya: "Jestem babcią i bardzo chcę pojechać z wnukami. Ale przywykłam oszczędzać i boję się, że mnie oszukają, jak znajomą.",
  },
  beatsAlt,
};
