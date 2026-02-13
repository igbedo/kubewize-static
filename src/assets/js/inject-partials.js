// src/assets/js/inject-partials.js
(async function () {
  async function inject(selector, url) {
    const el = document.querySelector(selector);
    if (!el) {
      console.warn(`Missing placeholder: ${selector}`);
      return;
    }

    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.warn(`Partial failed: ${url} (${res.status})`);
      return;
    }

    el.innerHTML = await res.text();
  }

  const v = "v1"; // bump when you change partials
  await Promise.all([
    inject("#site-header", `/partials/header.html?${v}`),
    inject("#site-footer", `/partials/footer.html?${v}`),
  ]);

  // AFTER injection, initialize scripts
  if (window.initNav) window.initNav();
  if (window.setYear) window.setYear();
})();

