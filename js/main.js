/* ================================================
   Uronika v2 — Crossfade Navigation
   Motion One · MPA crossfade · pure CSS hover only
   ================================================ */

const { animate } = Motion;

const MAIN = "main";
const OUT_DURATION = 0.25;
const IN_DURATION = 0.35;
const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.65, 0, 0.35, 1];

/* ---- Entry: fade in on page load ---- */
const entry = document.querySelector(MAIN);
if (entry) {
  document.documentElement.classList.add("is-loading");
  animate(entry, { opacity: [0, 1] }, { duration: IN_DURATION, easing: EASE_OUT }).finished.then(() => {
    document.documentElement.classList.remove("is-loading");
  });
}

/* ---- Exit: intercept internal links for crossfade ---- */
document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href") ?? "";
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

  // Only intercept same-origin, non-download links
  try {
    const target = new URL(href, window.location.origin);
    if (target.origin !== window.location.origin) return;
  } catch {
    return; // invalid URL — let browser handle
  }

  event.preventDefault();

  const current = document.querySelector(MAIN);
  if (!current) {
    window.location.href = href;
    return;
  }

  animate(current, { opacity: 0 }, { duration: OUT_DURATION, easing: EASE_IN_OUT }).finished.then(() => {
    window.location.href = href;
  });
});

/* ---- Handle back/forward (bfcache restore) ---- */
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // Page restored from bfcache — ensure main is visible
    const main = document.querySelector(MAIN);
    if (main) {
      main.style.opacity = "1";
      document.documentElement.classList.remove("is-loading");
    }
  }
});
