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

test("capability cards share aligned headings, bottom content, and the programming label", async ({ page }, testInfo) => {
  await page.goto("/");

  const cards = page.locator(".skill-card");
  await expect(cards).toHaveCount(3);
  expect(await cards.locator("h3").allTextContents()).toEqual(["编程开发", "游戏创作", "影像与视觉"]);
  await expect(page.getByText("软件开发", { exact: true })).toHaveCount(0);

  if (!testInfo.project.name.includes("mobile")) {
    const metrics = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const card = element.getBoundingClientRect();
        const number = element.querySelector<HTMLElement>(".skill-card__number")!.getBoundingClientRect();
        const title = element.querySelector<HTMLElement>("h3")!.getBoundingClientRect();
        const description = element.querySelector<HTMLElement>("p")!.getBoundingClientRect();
        const footer = element.querySelector<HTMLElement>(".skill-card__footer")!.getBoundingClientRect();
        const link = element.querySelector<HTMLElement>(".text-link")!.getBoundingClientRect();
        return {
          height: card.height,
          titleTop: title.top,
          titleInset: title.left - card.left,
          linkBottom: link.bottom,
          ordered: number.top < title.top && title.top < description.top && description.bottom < footer.top
        };
      })
    );

    const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
    expect(spread(metrics.map((item) => item.height))).toBeLessThan(2);
    expect(spread(metrics.map((item) => item.titleTop))).toBeLessThan(2);
    expect(spread(metrics.map((item) => item.titleInset))).toBeLessThan(2);
    expect(spread(metrics.map((item) => item.linkBottom))).toBeLessThan(2);
    expect(metrics.every((item) => item.ordered)).toBeTruthy();
  }

  await page.goto("/resume/");
  await expect(page.getByRole("heading", { name: "编程开发" })).toBeVisible();
  await expect(page.getByText("软件开发", { exact: true })).toHaveCount(0);
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

test("desktop hero uses a full-screen curtain, wall light, and enlarged composition", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop-only collage composition");
  await page.goto("/");

  const composition = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>("#home")!;
    const copy = document.querySelector<HTMLElement>(".hero-copy")!;
    const collage = document.querySelector<HTMLElement>("[data-parallax-root]")!;
    const title = hero.querySelector<HTMLElement>("h1")!;
    const capabilities = document.querySelector<HTMLElement>("#capabilities")!;
    const heroImage = hero.querySelector<HTMLImageElement>("[data-parallax-item] img")!;
    const copyBox = copy.getBoundingClientRect();
    const collageBox = collage.getBoundingClientRect();
    const curtain = getComputedStyle(hero, "::after");
    const spotlight = getComputedStyle(hero, "::before");
    const sectionLight = getComputedStyle(capabilities, "::after");
    return {
      collageWidth: collageBox.width,
      overlap: copyBox.right - collageBox.left,
      copyLeft: copyBox.left,
      copyZ: Number(getComputedStyle(copy).zIndex),
      collageZ: Number(getComputedStyle(collage).zIndex),
      titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
      curtainWidth: Number.parseFloat(curtain.width),
      curtainHeight: Number.parseFloat(curtain.height),
      curtainZ: Number(curtain.zIndex),
      spotlightZ: Number(spotlight.zIndex),
      curtainBackground: curtain.backgroundImage,
      spotlightBackground: spotlight.backgroundImage,
      sectionLightBackground: sectionLight.backgroundImage,
      heroImageFilter: getComputedStyle(heroImage).filter,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });

  expect(composition.collageWidth).toBeGreaterThan(1_000);
  expect(composition.overlap).toBeGreaterThan(100);
  expect(composition.titleFontSize).toBeGreaterThan(108);
  expect(composition.copyLeft).toBeGreaterThanOrEqual(50);
  expect(composition.copyLeft).toBeLessThanOrEqual(64);
  expect(composition.curtainWidth).toBeGreaterThanOrEqual(composition.viewportWidth - 1);
  expect(composition.curtainHeight).toBeGreaterThanOrEqual(composition.viewportHeight - 1);
  expect(composition.curtainBackground).toContain("linear-gradient");
  expect(composition.spotlightBackground).toContain("radial-gradient");
  expect(composition.spotlightBackground).toContain("conic-gradient");
  expect(composition.sectionLightBackground).toContain("radial-gradient");
  expect(composition.curtainZ).toBeLessThan(composition.spotlightZ);
  expect(composition.spotlightZ).toBeLessThan(composition.collageZ);
  expect(composition.collageZ).toBeLessThan(composition.copyZ);
  expect(composition.heroImageFilter).toContain("brightness(0.88)");
  expect(composition.heroImageFilter).toContain("saturate(0.92)");

  const hoverableTile = page.locator("[data-parallax-item]").nth(1);
  await hoverableTile.hover();
  await expect
    .poll(() => hoverableTile.locator("img").evaluate((image) => getComputedStyle(image).filter))
    .toContain("brightness(0.98)");
});

test("all pages use cinematic ambient lighting and warm glass reflection", async ({ page }, testInfo) => {
  await page.goto("/works/");

  const lighting = await page.evaluate(() => {
    const top = document.querySelector<HTMLElement>(".ambient--top")!;
    const bottom = document.querySelector<HTMLElement>(".ambient--bottom")!;
    const glass = document.querySelector<HTMLElement>(".glass")!;
    const topStyle = getComputedStyle(top);
    const bottomStyle = getComputedStyle(bottom);
    const glassStyle = getComputedStyle(glass);
    return {
      topPosition: topStyle.position,
      topWidth: Number.parseFloat(topStyle.width),
      topOpacity: Number.parseFloat(topStyle.opacity),
      topFilter: topStyle.filter,
      topBackground: topStyle.backgroundImage,
      bottomBackground: bottomStyle.backgroundImage,
      glassBackground: glassStyle.backgroundImage,
      glassShadow: glassStyle.boxShadow,
      viewportWidth: window.innerWidth
    };
  });

  expect(lighting.topPosition).toBe("fixed");
  expect(lighting.topWidth).toBeGreaterThan(lighting.viewportWidth * 0.75);
  expect(lighting.topFilter).toContain(testInfo.project.name.includes("mobile") ? "blur(60px)" : "blur(54px)");
  expect(lighting.topBackground).toContain("radial-gradient");
  expect(lighting.topBackground).toContain("conic-gradient");
  expect(lighting.bottomBackground).toContain("radial-gradient");
  expect(lighting.glassBackground).toContain("linear-gradient");
  expect(lighting.glassShadow).toContain("inset");
  expect(lighting.topOpacity).toBe(testInfo.project.name.includes("mobile") ? 0.6 : 1);
});

test("desktop wheel gesture pages symmetrically between hero and capabilities", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop-only hero paging");
  await page.goto("/");

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);

  await expect
    .poll(async () => {
      const box = await page.locator("#capabilities").boundingBox();
      return box?.y ?? Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(150);
  await expect(page.locator('[data-section-link="capabilities"]')).toHaveAttribute("aria-current", "step");

  await page.waitForTimeout(900);
  await page.mouse.wheel(0, -120);

  await expect
    .poll(async () => {
      const box = await page.locator("#home").boundingBox();
      return Math.abs(box?.y ?? Number.POSITIVE_INFINITY);
    })
    .toBeLessThan(12);
  await expect(page.locator('[data-section-link="home"]')).toHaveAttribute("aria-current", "step");
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

  const mobileHero = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>("#home")!;
    const title = hero.querySelector<HTMLElement>("h1")!;
    const copy = hero.querySelector<HTMLElement>(".hero-copy")!;
    return {
      titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
      copyLeft: copy.getBoundingClientRect().left,
      curtainDisplay: getComputedStyle(hero, "::after").display,
      spotlightOpacity: Number.parseFloat(getComputedStyle(hero, "::before").opacity)
    };
  });
  expect(mobileHero.titleFontSize).toBeLessThanOrEqual(68);
  expect(mobileHero.copyLeft).toBeGreaterThanOrEqual(13);
  expect(mobileHero.copyLeft).toBeLessThanOrEqual(20);
  expect(mobileHero.curtainDisplay).toBe("none");
  expect(mobileHero.spotlightOpacity).toBeGreaterThanOrEqual(0.59);
  expect(mobileHero.spotlightOpacity).toBeLessThanOrEqual(0.6);
});

test("print resume removes ambient lights and glass reflections", async ({ page }) => {
  await page.goto("/resume/");
  await page.emulateMedia({ media: "print" });

  const printStyles = await page.evaluate(() => {
    const ambient = document.querySelector<HTMLElement>(".ambient--top")!;
    const glass = document.querySelector<HTMLElement>(".resume-meta")!;
    const bodyStyle = getComputedStyle(document.body);
    return {
      ambientDisplay: getComputedStyle(ambient).display,
      bodyBackgroundImage: bodyStyle.backgroundImage,
      bodyBackgroundColor: bodyStyle.backgroundColor,
      glassShadow: getComputedStyle(glass).boxShadow
    };
  });

  expect(printStyles.ambientDisplay).toBe("none");
  expect(printStyles.bodyBackgroundImage).toBe("none");
  expect(printStyles.bodyBackgroundColor).toBe("rgb(255, 255, 255)");
  expect(printStyles.glassShadow).toBe("none");
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
