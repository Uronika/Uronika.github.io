import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/works/", "/resume/", "/contact/", "/works/development-01/"];

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
    for (const route of ["/", "/works/", "/resume/", "/contact/"]) {
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

test("desktop home uses five snap sections and an active section navigator", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop-only section navigation");
  await page.goto("/");

  await expect(page.locator("[data-home-section]")).toHaveCount(5);
  const snapType = await page.locator("html").evaluate((element) => getComputedStyle(element).scrollSnapType);
  expect(snapType).toContain("y");

  const sectionLinks = page.locator("[data-home-section-nav] [data-section-link]");
  await expect(sectionLinks).toHaveCount(5);
  await expect(page.locator('[data-section-link="home"]')).toHaveAttribute("aria-current", "step");

  await page.locator('[data-section-link="contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('[data-section-link="contact"]')).toHaveAttribute("aria-current", "step");
});

test("desktop hero collage is enlarged, overlaps the copy, and stays behind text", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop-only collage composition");
  await page.goto("/");

  const composition = await page.evaluate(() => {
    const copy = document.querySelector<HTMLElement>(".hero-copy")!;
    const collage = document.querySelector<HTMLElement>("[data-parallax-root]")!;
    const copyBox = copy.getBoundingClientRect();
    const collageBox = collage.getBoundingClientRect();
    return {
      collageWidth: collageBox.width,
      overlap: copyBox.right - collageBox.left,
      copyZ: Number(getComputedStyle(copy).zIndex),
      collageZ: Number(getComputedStyle(collage).zIndex)
    };
  });

  expect(composition.collageWidth).toBeGreaterThan(800);
  expect(composition.overlap).toBeGreaterThan(100);
  expect(composition.copyZ).toBeGreaterThan(composition.collageZ);
});

test("mobile home keeps natural scrolling and the existing compact collage", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only layout behavior");
  await page.goto("/");

  const snapType = await page.locator("html").evaluate((element) => getComputedStyle(element).scrollSnapType);
  expect(snapType).toBe("none");
  await expect(page.locator("[data-home-section-nav]")).not.toBeVisible();

  const collage = await page.locator("[data-parallax-root]").boundingBox();
  expect(collage).not.toBeNull();
  expect(collage!.width).toBeLessThanOrEqual(390);
});

test("contact replaces the account index and retains account details", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.getByRole("heading", { name: "机会、合作， 或者一次有意思的交流。" })).toBeVisible();
  await expect(page.locator(".account-card")).toHaveCount(3);
  await expect(page.getByText("邮箱待补充").first()).toBeVisible();

  const header = page.locator("[data-site-header]");
  await expect(header.getByRole("link", { name: "账号" })).toHaveCount(0);
  await expect(header.locator(".nav-contact")).toHaveAttribute("href", "/contact/");
});

test("legacy accounts page is noindex, redirects, and is excluded from sitemap", async ({ page, request }) => {
  const legacyResponse = await request.get("/accounts/");
  const legacyHtml = await legacyResponse.text();
  expect(legacyHtml).toContain('name="robots" content="noindex"');
  expect(legacyHtml).toContain('href="https://uronika.github.io/contact/"');
  expect(legacyHtml).toContain('http-equiv="refresh"');

  await page.goto("/accounts/");
  await page.waitForURL("**/contact/");

  const sitemapResponse = await request.get("/sitemap-0.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain("https://uronika.github.io/contact/");
  expect(sitemap).not.toContain("https://uronika.github.io/accounts/");
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
  const snapType = await page.locator("html").evaluate((element) => getComputedStyle(element).scrollSnapType);
  expect(snapType).toBe("none");
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
