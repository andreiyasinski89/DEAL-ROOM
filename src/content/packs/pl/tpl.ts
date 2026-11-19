import type { Tpl } from "../types";

/** Polskie szablony scenariuszy (kształt i znaczniki: packs/types.ts; rosyjski oryginał: packs/ru.ts). */
export const tpl: Tpl = {
  quote: ["„", "”"],
  title: "{name}: {label}",
  points: "{n} punktów",
  terms: "{fee} to opłata rejestracyjna firmy, a przy rejestracji na konto Travel Advantage trafia {tierPoints}",
  termsRest: "; podział pozostałej części kwoty trzeba sprawdzić w dokumentach firmy",
  renew: "każde przedłużenie abonamentu daje {renewPoints}",
  perMonth: "miesięcznie",
  tutorialTitle: "Przypadek 0: Jak grać",
  channel: { call: "rozmowa telefoniczna", meeting: "spotkanie osobiste", chat: "rozmowa w komunikatorze", zoom: "prezentacja na Zoomie" },
  voice: {
    analyst: { pre: [], post: [" Tylko konkrety, bez lania wody.", " Potrzebuję faktów, a nie emocji.", " Liczby, poproszę.", " Bez ogólników."] },
    driver: { pre: [], post: [" Szybciej, proszę.", " Krótko, do rzeczy.", " Czas to pieniądz.", " Sedno, proszę."] },
    expressive: { pre: ["Oj, no nie wiem... ", "Słuchaj, mam wątpliwości... ", "Ojej, to wszystko takie skomplikowane... ", "Wow, ale... "], post: [] },
    peacemaker: { pre: ["Jest mi niezręcznie, ale... ", "Nie chcę cię urazić, ale... ", "Tylko się nie obrażaj... ", "Wiesz, trochę się wstydzę, ale... "], post: [] },
  },
  hint: {
    trust: "Klient sprawdza twoją uczciwość: potrzebuje faktów do sprawdzenia i dokumentów, a nie zapewnień.",
    value: "Za tym zastrzeżeniem kryje się pytanie o wartość. Co wiesz o podróżach i wydatkach klienta?",
    other: "Nie kłóć się i nie naciskaj. Co pomoże klientowi podjąć decyzję we własnym tempie?",
    rec: "Przyznaj się do błędu i oddaj kontrolę klientowi. Dalej — bez presji.",
    open: "Pierwsze sekundy decydują o wszystkim: szanuj czas i zainteresowanie klienta.",
    close: "Potrzebny jest jasny, łagodny następny krok: bez presji i bez zmyślonej rzadkości.",
  },
  reveal: "Właściwie, powiem szczerze. ",
  open: {
    a: {
      sell: "Dzień dobry, {nameVoc}! Chcę krótko przedstawić ofertę: {productAcc}. Zajmie to dwie minuty — czy teraz pasuje? Jeśli nie, wrócę w dogodnym czasie.",
      retain: "Dzień dobry, {nameVoc}! Chcę spokojnie omówić twoje konto Travel Advantage i abonament: co jest dla ciebie jasne, a co nie. Czy teraz pasuje? Jeśli nie, wrócę w dogodnym czasie.",
      tech: "Pytanie o zgodę + szacunek dla czasu",
      note: "Zapytano o zgodę i uszanowano granice klienta — zaufanie rośnie od pierwszych sekund.",
    },
    b: {
      sell: "Dzień dobry! Krótko: oferujemy {productAcc}. A co jest ci znane w tym temacie?",
      retain: "Dzień dobry! Krótko: chcę pomóc uporządkować sprawę abonamentu i konta. Z czym jest ci teraz najtrudniej?",
      tech: "Krótkie przedstawienie + pytanie",
      note: "Jasne przedstawienie się i pytanie włączają klienta w rozmowę.",
    },
    c: { t: "Dzień dobry! Mam dla ciebie superofertę, której nie można przegapić!", mistake: "Presja od pierwszych sekund", note: "Głośne słowa bez treści wzbudzają czujność." },
    d: { t: "Dzień dobry, {nameVoc}! Wygrał{eś|aś} specjalny bonus — wystarczy potwierdzić udział.", mistake: "Manipulacja / fałszywy pretekst", note: "Fałszywy pretekst do rozmowy to utrata zaufania, zanim się zacznie." },
    lostText: "{name} odkłada słuchawkę: „Nie lubię, gdy ktoś mnie okłamuje od pierwszej sekundy”.",
    lostReason: "GAME OVER: fałszywy pretekst na początku rozmowy.",
  },
  close: {
    soft: "Dobrze, jestem gotow{y|a} iść dalej. Co proponujesz?",
    hard: "Niech będzie. Ale warunki są takie: bez presji i bez niespodzianek. Co proponujesz dalej?",
    a: {
      sell: "Proponuję tak: {next}. Jeśli potem nie zostaną wątpliwości — razem zarejestrujemy {tier}. Zgoda?",
      retain: "Proponuję tak: {next}. Jeśli potem będzie dla ciebie jasne, czy kontynuować — zdecydujemy razem. Zgoda?",
      tech: "Zamknięcie na weryfikowalny krok",
      note: "Klient sam sprawdza i decyduje — sprzedaż bez ryzyka zwrotu.",
    },
    b: {
      sell: "Mogę od razu zarejestrować {tier}: {tierPrice}: {terms}; dalej {sub}. Wszystkie warunki na piśmie. Pasuje?",
      retain: "Mogę od razu otworzyć z tobą umowę i warunki abonamentu {sub} i razem zdecydować, czy kontynuować. Pasuje?",
      tech: "Zamknięcie z alternatywą",
      note: "Wszystkie płatności nazwano wprost, warunki są na piśmie — dobra druga droga.",
    },
    c: { t: "Dobrze, zastanów się, napiszę do ciebie w tym tygodniu.", mistake: "Rozmyty następny krok", note: "„Napiszę w tym tygodniu” bez daty i celu to częsta przyczyna cichego zgubienia klienta." },
    d: { t: "To zamknijmy dzisiaj — zostało już tylko kilka miejsc!", mistake: "Fałszywa rzadkość", note: "Zmyślona rzadkość niszczy zdobyte zaufanie." },
  },
  endings: {
    saleClean: {
      sell: { text: "{name}: „Umowa stoi — {next}. Zróbmy to. Jeśli liczby się zgodzą, zapisujemy {tier}”.", reason: "SALE CLOSED: klient zgodził się na weryfikowalny krok i rejestrację według wyniku." },
      retain: { text: "{name}: „Umowa stoi — {next}. Zróbmy to. Dziękuję, że bez presji”.", reason: "SALE CLOSED: klient pozostaje w kontakcie, wszystko wyjaśniono uczciwie i bez presji." },
    },
    saleSoft: {
      sell: { text: "{name}: „Dobrze, zapisujemy {tier}. Warunki proszę przesłać na piśmie”.", reason: "SALE CLOSED: zarejestrowano {tier} przy pełnym zrozumieniu płatności: {tierPrice} ({terms}) i {sub}." },
      retain: { text: "{name}: „Dobrze, otwórzmy umowę i zdecydujmy spokojnie. Dziękuję, że bez sztuczek”.", reason: "SALE CLOSED: warunki abonamentu omówiono wspólnie, klient podjął świadomą decyzję." },
    },
    partialNext: {
      sell: { text: "{name}: „Dobrze, {next} — zróbmy to. Decyzję podejmę potem”.", reason: "PARTIAL: umówiono następny krok, ale pełnego zaufania jeszcze nie ma." },
      retain: { text: "{name}: „Dobrze, {next} — zróbmy to. Decyzję podejmę potem”.", reason: "PARTIAL: umówiono omówienie, ostateczna decyzja klienta jeszcze przed nim." },
    },
    partialVague: { text: "{name}: „No... napisz kiedyś. Do widzenia”.", reason: "PARTIAL: następny krok jest rozmyty — szansa na odzyskanie klienta jest niewielka." },
    lostClose: { text: "{name}: „Kilka miejsc? Już mi to mówiono. Nie, dziękuję”.", reason: "GAME OVER: zmyślona rzadkość na finiszu zniszczyła zaufanie." },
  },
  autoEnd: {
    irritation: { text: "Klient gwałtownie przerywa rozmowę: „To mnie nie interesuje. Proszę więcej nie dzwonić”. Sygnał zajętości.", reason: "Irytacja osiągnęła maksimum — klient odłożył słuchawkę." },
    trust: { text: "„Wiesz, już ci nie wierzę. Wszystkiego dobrego”. Klient kończy rozmowę.", reason: "Zaufanie spadło do zera — klient przestał ci wierzyć." },
  },
  lostBye: "{name}: „{bye}”",
  gameOver: "GAME OVER: {why}",
  briefing: { channelWord: "Kanał", firstStep: "Pierwszy krok: „{next}”.", goal: "Cel: uzgodnić krok „{next}” albo zarejestrować {tier}.", known: "Wiadomo" },
  hidden: {
    objection: "Ukryte zastrzeżenie",
    red: "Czerwony przycisk klienta",
    gold: "Złoty klucz",
    facts: "Fakty do samodzielnego sprawdzenia: {tier} — {tierPrice} ({terms}), abonament {sub} ({renew}); zarobek jest możliwy tylko z rozwijania własnej sieci, gwarancji nie ma.",
    level5: "Klient może wyolbrzymiać oferty konkurentów — sprawdzaj fakty.",
  },
};
