// src/assets/js/inject-partials.js
(async function () {
  async function inject(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;

    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.warn(`Partial failed: ${url} (${res.status})`);
      return;
    }

    el.innerHTML = await res.text();
  }

  // IMPORTANT: absolute paths so it works from / and /about/ etc.
  await Promise.all([
    inject("#site-header", "/partials/header.html"),
    inject("#site-footer", "/partials/footer.html"),
  ]);

  // If your nav needs initialization after injection, do it here:
  if (window.initNav) window.initNav();
})();

