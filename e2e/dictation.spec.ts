import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// The live screen needs a signed-in user and the cloud function. Both are faked here:
// a session in localStorage, the function answered by page.route, speech recognition by a fake class.
// The build must have the Supabase variables (from .env.local); without them the test is skipped.
function supabaseRef(): string | null {
  try {
    const env = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    const m = env.match(/VITE_SUPABASE_URL=https?:\/\/([a-z0-9]+)\.supabase\.co/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

test("voice dictation fills the answer field and is sent with the message", async ({ page }) => {
  const ref = supabaseRef();
  test.skip(!ref, "needs .env.local with VITE_SUPABASE_URL (the build must know the cloud)");

  await page.addInitScript((r) => {
    sessionStorage.setItem("dr_booted", "1");
    localStorage.setItem("dr_fx", "off");
    localStorage.setItem("dr_tour_done", "1");
    // fake signed-in session
    const exp = Math.floor(Date.now() / 1000) + 86_400;
    const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "00000000-0000-0000-0000-0000000000aa", exp, role: "authenticated" })}.sig`;
    localStorage.setItem(
      `sb-${r}-auth-token`,
      JSON.stringify({ access_token: jwt, refresh_token: "x", expires_at: exp, expires_in: 86_400, token_type: "bearer", user: { id: "00000000-0000-0000-0000-0000000000aa", email: "t@example.com", aud: "authenticated" } }),
    );
    // fake speech recognition (like Chrome's webkitSpeechRecognition)
    const w = window as unknown as Record<string, unknown>;
    w.__recs = [];
    const Fake = class {
      lang = "";
      onresult: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        (w.__recs as unknown[]).push(this);
      }
      start() {}
      stop() {
        this.onend?.();
      }
      abort() {
        this.onend?.();
      }
    };
    // Chrome has both the standard and the prefixed name: override both so the fake is always used
    for (const name of ["SpeechRecognition", "webkitSpeechRecognition"]) Object.defineProperty(window, name, { value: Fake, configurable: true, writable: true });
    w.__emit = (parts: { t: string; final: boolean }[], resultIndex = 0) => {
      const recs = w.__recs as { onresult: (e: unknown) => void }[];
      recs[recs.length - 1].onresult({ resultIndex, results: parts.map((p) => ({ isFinal: p.final, 0: { transcript: p.t } })) });
    };
  }, ref);

  const sent: { player?: string; turn?: number }[] = [];
  await page.route("**/functions/v1/live-client", async (route) => {
    sent.push(JSON.parse(route.request().postData() ?? "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        sessionsLeft: 9,
        eval: { reply: "Слушаю вас.", trustDelta: 5, interestDelta: 3, irritationDelta: -2, quality: "good", coachNote: "ок", isEnding: false },
      }),
    });
  });

  await page.goto("/");
  await page.getByLabel("свободная игра").check();
  await page.getByRole("tab", { name: /Практик/ }).click();
  await page.locator(".case-row", { hasText: "Скептик-бухгалтер" }).click();
  const live = page.getByRole("button", { name: /Живой клиент/ });
  await expect(live).toBeEnabled({ timeout: 10_000 });
  await live.click();

  const field = page.getByLabel("Ваш ответ клиенту");
  const mic = page.getByRole("button", { name: /Диктовать голосом/ });
  await expect(mic).toBeVisible();

  // start dictation with the hotkey
  await page.keyboard.press("Alt+m");
  await expect(page.getByRole("button", { name: /Остановить диктовку/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/Слушаю/)).toBeVisible();

  // a finished phrase lands in the field (capitalised); the running one is shown as interim text
  await page.evaluate(() => (window as unknown as { __emit: (p: unknown) => void }).__emit([{ t: "добрый день ирина", final: true }]));
  await expect(field).toHaveValue("Добрый день ирина");
  await page.evaluate(() => (window as unknown as { __emit: (p: unknown, i?: number) => void }).__emit([{ t: "добрый день ирина", final: true }, { t: " хочу рассказать про членство", final: false }], 1));
  await expect(page.getByText("хочу рассказать про членство")).toBeVisible();

  // sending takes the interim words along and stops listening
  await page.getByRole("button", { name: "Отправить" }).click();
  await expect(page.locator(".msg.player")).toHaveCount(1);
  expect(sent[0].player).toBe("Добрый день ирина хочу рассказать про членство");
  expect(sent[0].turn).toBe(0);
  await expect(page.getByRole("button", { name: /Диктовать голосом/ })).toHaveAttribute("aria-pressed", "false");
  await expect(field).toHaveValue("");
});
