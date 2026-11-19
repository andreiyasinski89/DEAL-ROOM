import { defineConfig } from "@playwright/test";

// Uses the Chrome already installed on the machine (no browser download).
// Runs against the production build so the service worker / offline mode is tested for real.
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    channel: "chrome",
    locale: "ru-RU",
    viewport: { width: 1280, height: 800 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
