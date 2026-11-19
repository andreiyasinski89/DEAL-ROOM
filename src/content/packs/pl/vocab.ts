import type { VocabText } from "../types";

const PROOF = "dokumenty (umowa, warunki firmy i twój panel klienta)";

/** Polskie teksty 9 segmentów rynku (klucze jak w data/vocab.ts). */
export const vocab: Record<string, VocabText> = {
  member_elite: {
    label: "Klient · Elite (podróże dla siebie)",
    product: "członkostwo MWR Life", productAcc: "członkostwo MWR Life", proof: PROOF,
    next: "rozmowa z wyliczeniem: twoje podróże w ciągu roku wobec punktów Elite i abonamentu",
    third: "z małżonkiem", thirdWho: "małżonka",
    brief: "Proponujesz członkostwo MWR Life na poziomie {tier}: {tierPrice}, z czego {fee} to opłata rejestracyjna firmy, a {tierPoints} to punkty na konto Travel Advantage; dalej abonament {sub}.",
    open: {
      call: "Halo? Tak, słucham. To w sprawie klubu podróży?",
      chat: "Cześć! Dostał{em|am} wiadomość o podróżach ze zniżkami. Co to za klub?",
      meeting: "Dzień dobry. Miało być o tym, jak oszczędzać na podróżach?",
      zoom: "Dzień dobry, jestem. Opowiedz o swoim klubie podróży.",
    },
  },
  member_turbo: {
    label: "Klient · Turbo (więcej punktów)",
    product: "członkostwo MWR Life", productAcc: "członkostwo MWR Life", proof: PROOF,
    next: "rozmowa z wyliczeniem dla Turbo: twoje podróże w ciągu roku, punkty i abonament",
    third: "z małżonkiem", thirdWho: "małżonka",
    brief: "Klient wybiera między poziomami; proponujesz {tier}: {tierPrice}, z czego {fee} to rejestracja, a {tierPoints} to punkty na konto Travel Advantage; dalej abonament {sub}. Polecać należy to, co pasuje klientowi, a nie droższe.",
    open: {
      call: "Halo? Tak. To w sprawie tego droższego poziomu?",
      chat: "Cześć. Proponowano mi jakieś Turbo, orientujesz się w temacie?",
      meeting: "Dzień dobry. Umawialiśmy się na omówienie poziomów członkostwa.",
      zoom: "Dzień dobry. Opowiedz o poziomach Elite i Turbo.",
    },
  },
  recruiting: {
    label: "Zaproszenie do biznesu (budowa sieci)",
    product: "biznes z MWR Life", productAcc: "biznes z MWR Life", proof: PROOF,
    next: "spotkanie, na którym zobaczysz, jak wygląda praca z siecią, i zdecydujesz, czy jej potrzebujesz",
    third: "z rodziną", thirdWho: "rodzinę",
    brief: "Zapraszasz do biznesu: wejście to {tier} ({tierPrice}, z czego {fee} to rejestracja, a {tierPoints} to punkty na konto Travel Advantage) i abonament {sub}. Dochód jest możliwy tylko z rozwijania własnej sieci; gwarancji nie ma.",
    open: {
      call: "Halo? Tak. To w sprawie dorywczej pracy?",
      chat: "Cześć. Dostał{em|am} wiadomość o jakimś biznesie na podróżach. Co to jest?",
      meeting: "Dzień dobry. Miało być o możliwości zarobku?",
      zoom: "Dzień dobry. Opowiedz o swoim biznesie z podróżami.",
    },
  },
  cold: {
    label: "Zimny kontakt",
    product: "członkostwo MWR Life", productAcc: "członkostwo MWR Life", proof: PROOF,
    next: "krótka rozmowa na 15 minut, w której odpowiem na twoje pytania",
    third: "ze współpracownikami", thirdWho: "współpracowników",
    brief: "Ta osoba cię nie oczekuje. Proponujesz {tier} ({tierPrice}: {fee} rejestracja i {tierPoints} punktami na konto Travel Advantage; dalej abonament {sub}), ale celem rozmowy jest zasłużenie na prawo do następnego kroku.",
    open: {
      call: "Halo? Kto mówi? Skąd macie mój numer?",
      chat: "Dzień dobry. A czy się znamy? O co chodzi?",
      meeting: "Dzień dobry. Czy się znamy?",
      zoom: "Dzień dobry. Nie zapisywał{em|am} się na tę rozmowę.",
    },
  },
  repeat: {
    label: "Obecny klient: abonament i wątpliwości",
    product: "twoje konto Travel Advantage", productAcc: "twoje konto Travel Advantage", proof: PROOF,
    next: "rozmowa, w której omówimy twoją sytuację z abonamentem i kontem",
    third: "z rodziną", thirdWho: "rodzinę",
    brief: "Klient jest już zarejestrowany ({tier}), płaci abonament {sub} i wątpi, czy kontynuować. Celem jest uczciwe wyjaśnienie sprawy i zachowanie zaufania, a nie zatrzymanie za wszelką cenę.",
    open: {
      call: "Halo? Tak. To w sprawie mojego konta?",
      chat: "Dzień dobry. Dostał{em|am} wiadomość o moim koncie, akurat chciał{em|am} wyjaśnić sprawę abonamentu.",
      meeting: "Dzień dobry. Umawialiśmy się na omówienie mojego konta.",
      zoom: "Dzień dobry. Wyjaśnimy sprawę mojego konta?",
    },
  },
  family: {
    label: "Rodzina i urlop",
    product: "członkostwo MWR Life", productAcc: "członkostwo MWR Life", proof: PROOF,
    next: "rodzinna rozmowa, w której razem obejrzycie liczby",
    third: "z rodziną", thirdWho: "rodzinę",
    brief: "Ta osoba myśli o rodzinnych podróżach. Proponujesz {tier}: {tierPrice}, z czego {fee} to rejestracja, a {tierPoints} to punkty na konto Travel Advantage; dalej abonament {sub}. Decyzja zapada razem z rodziną.",
    open: {
      call: "Halo? Tak, słucham. To w sprawie podróży dla rodziny?",
      chat: "Dzień dobry. Dostał{em|am} wiadomość o podróżach dla rodziny. Co dokładnie jest w ofercie?",
      meeting: "Dzień dobry. Opowiedz, jak pomagacie w rodzinnych podróżach.",
      zoom: "Dzień dobry. Planujemy z rodziną urlop, opowiedz o klubie.",
    },
  },
  business: {
    label: "Przedsiębiorca i kierownik",
    product: "członkostwo MWR Life", productAcc: "członkostwo MWR Life", proof: PROOF,
    next: "analiza liczb: twoje podróże i podróże zespołu wobec punktów i abonamentu",
    third: "z partnerem lub zarządem", thirdWho: "partnera lub zarząd",
    brief: "Rozmówca to zajęty kierownik lub właściciel firmy. Proponujesz {tier}: {tierPrice}, z czego {fee} to rejestracja, a {tierPoints} to punkty na konto Travel Advantage; dalej abonament {sub}. Ważne są dla niego liczby i czas.",
    open: {
      call: "Dzień dobry. Słucham, mam dziesięć minut.",
      chat: "Dzień dobry. Przeczytał{em|am} wiadomość. Co dokładnie proponujesz?",
      meeting: "Dzień dobry. Proszę rzeczowo, mam napięty grafik.",
      zoom: "Dzień dobry. Pokaż krótko, co masz.",
    },
  },
  social: {
    label: "Media społecznościowe i blogerzy",
    product: "członkostwo MWR Life", productAcc: "członkostwo MWR Life", proof: PROOF,
    next: "transmisja z omówieniem: jak wygląda konto Travel Advantage i praca z siecią w praktyce",
    third: "z publicznością i rodziną", thirdWho: "publiczność i rodzinę",
    brief: "Rozmówca żyje w mediach społecznościowych i dba o swoją publiczność. Proponujesz {tier}: {tierPrice}, z czego {fee} to rejestracja, a {tierPoints} to punkty na konto Travel Advantage; dalej abonament {sub}. Reputacja wobec obserwujących jest ważniejsza niż szybka sprzedaż.",
    open: {
      call: "Halo? Tak, pisaliśmy na priv.",
      chat: "Cześć! Widział{em|am} twój post o podróżach. Co to za projekt?",
      meeting: "Cześć! Od dawna chciał{em|am} się poznać na żywo.",
      zoom: "Cześć! Opowiadaj, co to za projekt z podróżami.",
    },
  },
};
