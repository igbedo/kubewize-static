// src/assets/js/main.js

// Footer year
function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

// Mobile nav + active link
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  // Prevent multiple listeners if initNav is called more than once (e.g., after injection + DOMContentLoaded)
  if (toggle.dataset.bound === "1") return;
  toggle.dataset.bound = "1";

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    nav.classList.toggle("open", !open);
  });

  // Highlight active nav link (basic)
  const path = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.getAttribute("data-nav") === path) a.classList.add("active");
  });
}

// Expose to injector (so it can call after header/footer are injected)
window.setYear = setYear;
window.initNav = initNav;

// Run once on initial load (harmless even if header/footer inject later)
document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initNav();
});

