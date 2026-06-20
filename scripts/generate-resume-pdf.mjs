import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const outputPath = path.join(root, "dist", "resume.pdf");
const port = 4322;
const url = `http://127.0.0.1:${port}/resume/`;
const astroCli = path.join(root, "node_modules", "astro", "astro.js");
const server = spawn(process.execPath, [astroCli, "preview", "--host", "127.0.0.1", "--port", String(port)], {
  cwd: root,
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"]
});

let serverError = "";
server.stderr.on("data", (chunk) => {
  serverError += chunk.toString();
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Preview server exited early. ${serverError}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for the preview server. ${serverError}`);
};

const findCachedChromium = () => {
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
};

let browser;
try {
  await waitForServer();
  const executablePath = findCachedChromium();
  browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" }
  });
  console.log("Resume PDF: dist/resume.pdf generated from /resume/.");
} finally {
  await browser?.close();
  if (server.exitCode === null) server.kill();
}
