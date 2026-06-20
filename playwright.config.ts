import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

function findCachedChromium(): string | undefined {
  if (process.env.CI || !process.env.LOCALAPPDATA) return undefined;
  const browserRoot = path.join(process.env.LOCALAPPDATA, "ms-playwright");
  if (!existsSync(browserRoot)) return undefined;

  const candidates = readdirSync(browserRoot)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((left, right) => Number(right.split("-")[1]) - Number(left.split("-")[1]));

  for (const candidate of candidates) {
    const executable = path.join(browserRoot, candidate, "chrome-win64", "chrome.exe");
    if (existsSync(executable)) return executable;
  }
  return undefined;
}

const cachedChromium = findCachedChromium();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: cachedChromium ? { executablePath: cachedChromium } : undefined
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }
    }
  ],
  webServer: {
    command: "pnpm preview --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
