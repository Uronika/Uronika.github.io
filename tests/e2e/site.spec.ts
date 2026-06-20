import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/works/", "/resume/", "/accounts/", "/works/development-01/"];

test.describe("site shell", () => {
  for (const route of routes) {
    test(`${route} renders without browser errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("main")).toBeVisible();
      expect(errors).toEqual([]);
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(hasOverflow).toBeFalsy();
    });
  }

  test("critical routes have no serious accessibility violations", async ({ page }) => {
    for (const route of ["/", "/works/", "/resume/", "/accounts/"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
      expect(serious, `${route}: ${serious.map((item) => item.id).join(", ")}`).toEqual([]);
    }
  });
});

test("home displays exactly six featured placeholders", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#featured-works [data-work-card]");
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toContainText("待补充");
});

test("work filters expose all four categories", async ({ page }) => {
  await page.goto("/works/");
  for (const category of ["development", "game", "video", "image"]) {
    await page.locator(`[data-filter="${category}"]`).click();
    const visibleCards = page.locator(`[data-work-card]:visible`);
    await expect(visibleCards.first()).toHaveAttribute("data-category", category);
    expect(await visibleCards.count()).toBeGreaterThan(0);
  }
});

test("gallery opens as a keyboard-aware dialog", async ({ page }) => {
  await page.goto("/works/development-01/");
  await page.locator("[data-gallery-open]").first().click();
  const dialog = page.locator("[data-lightbox]");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("[data-lightbox-image]")).toHaveAttribute("src", /detail\.svg/);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("resume PDF is available after the production build", async ({ request }) => {
  const response = await request.get("/resume.pdf");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).byteLength).toBeGreaterThan(10_000);
});

test("reduced motion disables hero parallax", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const root = page.locator("[data-parallax-root]");
  const tile = page.locator("[data-parallax-item]").first();
  await root.dispatchEvent("pointermove", { clientX: 10, clientY: 10 });
  const parallaxX = await tile.evaluate((element) => getComputedStyle(element).getPropertyValue("--parallax-x").trim());
  const parallaxY = await tile.evaluate((element) => getComputedStyle(element).getPropertyValue("--parallax-y").trim());
  expect(parallaxX).toBe("0px");
  expect(parallaxY).toBe("0px");
});

test("mobile navigation opens and closes", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only navigation behavior");
  await page.goto("/");
  const toggle = page.locator("[data-menu-toggle]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("[data-mobile-menu]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-mobile-menu]")).not.toBeVisible();
});
