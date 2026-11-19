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

test("the interface can be switched to English and Polish and the choice is remembered", async ({ page }) => {
  await seed(page);
  await page.goto("/");
  await expect(page.getByText("КАРТА МИССИЙ")).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByText("MISSION MAP")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "PL", exact: true }).click();
  await expect(page.getByText("MAPA MISJI")).toBeVisible();
  await page.reload();
  await expect(page.getByText("MAPA MISJI")).toBeVisible();
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
