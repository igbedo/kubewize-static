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

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    nav.classList.toggle("open", !open);
  });

  // Highlight active nav link (basic)
  const path = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute("data-nav") === path) a.classList.add("active");
  });
}

window.initNav = initNav;

// If your header/footer are injected after load, call these after injection too.
document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initNav();
});

