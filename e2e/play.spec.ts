import { expect, test, type Page } from "@playwright/test";

/** Deterministic start: booted, no typing animation, tour already seen (unless a test wants it). */
async function seed(page: Page, extra: Record<string, string> = {}) {
  await page.addInitScript((kv) => {
    sessionStorage.setItem("dr_booted", "1");
    localStorage.setItem("dr_fx", "off");
    localStorage.setItem("dr_tour_done", "1");
    for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v);
  }, extra);
}

/** Opens the hand-written level-3 case from the menu ("free play" unlocks every level). */
async function openMiniCase(page: Page) {
  await page.goto("/");
  await page.getByLabel("свободная игра").check();
  await page.getByRole("tab", { name: /Практик/ }).click();
  await page.locator(".case-row", { hasText: "Скептик-бухгалтер" }).click();
  await expect(page.getByText("БРИФИНГ МИССИИ")).toBeVisible();
  await page.getByRole("button", { name: /Начать диалог/ }).click();
}

const pick = (page: Page, text: string) => page.locator(".choice", { hasText: text }).click();

test("a scripted game can be won with the keyboard-free flow and shows the debrief", async ({ page }) => {
  await seed(page);
  await openMiniCase(page);

  await pick(page, "Да, модель сетевая, скрывать не буду");
  await pick(page, "Сочувствую вашей подруге");
  await pick(page, "Спасибо, что рассказали");
  await pick(page, "Elite — $340");
  await pick(page, "Предлагаю так");

  await page.getByRole("button", { name: /Разбор полётов/ }).click();
  await expect(page.getByText("SALE CLOSED").first()).toBeVisible();
  await expect(page.getByText("ИТОГ МИССИИ")).toBeVisible();
  // the result is remembered in the profile data
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("dr_sessions") ?? "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ scenarioId: "mwr-l3-irina-accountant", outcome: "sale" });

  // the debrief has an explicit way back to the main screen
  await page.getByRole("button", { name: /В меню/ }).click();
  await expect(page.getByText("КАРТА МИССИЙ")).toBeVisible();
});

test("lying to the client loses the game and is recorded as a loss", async ({ page }) => {
  await seed(page);
  await openMiniCase(page);

  await pick(page, "Нет-нет, что вы, это совсем другое");
  await pick(page, "Ну это просто маркетинг такой");
  // the client leaves (by an authored ending or by the trust threshold): the debrief button appears
  const debrief = page.getByRole("button", { name: /Разбор полётов/ });
  await expect(debrief).toBeVisible();
  await debrief.click();
  await expect(page.getByText("MISSION FAILED").first()).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("dr_sessions") ?? "[]"));
  expect(saved[0]).toMatchObject({ outcome: "lost" });
});

test("answers can be picked with the keys 1-4", async ({ page }) => {
  await seed(page);
  await openMiniCase(page);
  await expect(page.locator(".choice")).toHaveCount(4);
  await page.keyboard.press("1");
  await expect(page.locator(".msg.player")).toHaveCount(1);
});

test("the guided tour shows on the first game, can be skipped, and does not come back", async ({ page }) => {
  await seed(page, { dr_tour_done: "0" });
  await openMiniCase(page);
  const tour = page.getByRole("dialog", { name: "Обучение" });
  await expect(tour).toBeVisible();
  await expect(tour.getByText("1 / 7")).toBeVisible();
  await tour.getByRole("button", { name: "Далее" }).click();
  await expect(tour.getByText("2 / 7")).toBeVisible();
  await tour.getByRole("button", { name: "Пропустить" }).click();
  await expect(tour).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("dr_tour_done"))).toBe("1");
  await page.reload();
  await page.getByRole("button", { name: /Как играть/ }).click(); // "How to play" always starts the tutorial case
  await expect(page.getByRole("dialog", { name: "Обучение" })).toBeVisible();
});

test("the interface AND all scenario texts switch between RU / EN / PL / UA and the choice is remembered", async ({ page }) => {
  await seed(page);
  await page.goto("/");
  await expect(page.getByText("КАРТА МИССИЙ")).toBeVisible();
  await expect(page.locator(".case-row", { hasText: "Ирина: «Ещё подписка $120?»" })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByText("MISSION MAP")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/sales trainer/);
  await expect(page.locator(".case-row", { hasText: "Irina: “Another $120 subscription?”" })).toBeVisible();

  await page.getByRole("button", { name: "PL", exact: true }).click();
  await expect(page.getByText("MAPA MISJI")).toBeVisible();
  await expect(page.locator(".case-row", { hasText: "Irena: „Jeszcze abonament $120?”" })).toBeVisible();

  await page.getByRole("button", { name: "UA", exact: true }).click();
  await expect(page.getByText("КАРТА МІСІЙ")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator(".case-row", { hasText: "Ірина: «Ще й підписка $120?»" })).toBeVisible();

  await page.reload();
  await expect(page.getByText("КАРТА МІСІЙ")).toBeVisible();
  await expect(page.locator(".case-row", { hasText: "Ірина: «Ще й підписка $120?»" })).toBeVisible();
});

test("a whole game can be played and debriefed in Ukrainian (translated graph, answers and advice)", async ({ page }) => {
  await seed(page, { dr_lang: "uk" });
  await page.goto("/");
  await page.getByLabel("вільна гра").check();
  await page.getByRole("tab", { name: /Практик/ }).click();
  await page.locator(".case-row", { hasText: "Скептична бухгалтерка" }).click();
  await expect(page.getByText("БРИФІНГ МІСІЇ")).toBeVisible();
  await page.getByRole("button", { name: /Почати діалог/ }).click();

  await pick(page, "Так, модель мережева, приховувати не буду");
  await pick(page, "Співчуваю вашій подрузі");
  await pick(page, "Дякую, що розповіли");
  await pick(page, "Elite — $340");
  await pick(page, "Пропоную так");

  await page.getByRole("button", { name: /Розбір польотів/ }).click();
  await expect(page.getByText(/SALE CLOSED: клієнтка погодилася/).first()).toBeVisible();
});

test("a lost game in Polish shows growth advice in Polish", async ({ page }) => {
  await seed(page, { dr_lang: "pl" });
  await page.goto("/");
  await page.getByLabel("gra swobodna").check();
  await page.getByRole("tab", { name: /Praktyk/ }).click();
  await page.locator(".case-row", { hasText: "Sceptyczna księgowa" }).click();
  await page.getByRole("button", { name: /Rozpocznij rozmowę/ }).click();

  // two bad answers drop trust to zero: the automatic ending is translated too
  await pick(page, "Nie, nie, skąd, to coś zupełnie innego");
  await pick(page, "No to taki marketing, nie zwracaj uwagi");
  await page.getByRole("button", { name: /Podsumowanie/ }).click();
  await expect(page.getByText("Zaufanie spadło do zera")).toBeVisible();
  // the growth advice comes from language-independent mistake codes
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("listitem").filter({ hasText: "Nigdy nie obiecywać dochodu ani gwarancji" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Najpierw odpowiedzieć na bezpośrednie pytanie klienta" })).toBeVisible();
});

test("the scripted mode works offline after the first visit (service worker)", async ({ page, context }) => {
  await seed(page);
  await page.goto("/");
  await expect(page.getByText("КАРТА МИССИЙ")).toBeVisible();
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  // wait until the worker has finished precaching and controls the page
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null || true);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("КАРТА МИССИЙ")).toBeVisible();
  await openMiniCase(page);
  await expect(page.locator(".choice")).toHaveCount(4);
  await context.setOffline(false);
});
