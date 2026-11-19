import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Deal Room — тренажёр продаж",
        short_name: "Deal Room",
        description: "Тренажёр продаж и работы с возражениями. Скриптовый режим работает без интернета.",
        lang: "ru",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#05070D",
        theme_color: "#05070D",
        categories: ["education", "business"],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // the app shell, scripts, styles and self-hosted fonts are cached: scripted mode works offline.
        // Cloud calls (Supabase, the AI function) are never cached: they always go to the network.
        globPatterns: ["**/*.{js,css,html,woff2,woff,png,svg,webmanifest}"],
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { port: 5173 },
  // e2e tests are run by Playwright, not Vitest
  test: { exclude: ["node_modules/**", "dist/**", "e2e/**"] },
});
