import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf-8")) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const netlify = readFileSync(join(root, "netlify.toml"), "utf-8");

const policyOf = () =>
  vercel.headers.flatMap((h) => h.headers).find((h) => h.key === "Permissions-Policy")?.value ?? "";

describe("hosting headers", () => {
  it("allow the microphone for the site itself (voice dictation) and nothing else sensitive", () => {
    for (const policy of [policyOf(), netlify.match(/Permissions-Policy\s*=\s*"([^"]+)"/)?.[1] ?? ""]) {
      expect(policy).toContain("microphone=(self)");
      expect(policy).toContain("camera=()");
      expect(policy).toContain("geolocation=()");
    }
  });
  it("keep the other security headers", () => {
    const keys = vercel.headers.flatMap((h) => h.headers.map((x) => x.key));
    for (const k of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy"]) expect(keys).toContain(k);
    expect(netlify).toContain("X-Frame-Options");
  });
  it("never cache the service worker", () => {
    expect(JSON.stringify(vercel)).toMatch(/sw\\\\\.js/);
    expect(netlify).toMatch(/for = "\/sw\.js"[\s\S]*no-cache/);
  });
});
