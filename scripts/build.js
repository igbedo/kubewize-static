// scripts/build.js
const fs = require("fs");
const path = require("path");

// Always resolve project root as: (repo)/scripts/build.js -> repo root
const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const out = path.join(root, "public");

function rm(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  mkdirp(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function injectPartials(html, { header, footer }) {
  if (header) html = html.replace(/<!--\s*HEADER\s*-->/g, header);
  if (footer) html = html.replace(/<!--\s*FOOTER\s*-->/g, footer);
  return html;
}

function buildPages() {
  const pagesDir = path.join(src, "pages");
  if (!fs.existsSync(pagesDir)) {
    throw new Error(`Missing pages directory: ${pagesDir}`);
  }

  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".html"));
  if (!files.length) {
    throw new Error(`No .html files found in: ${pagesDir}`);
  }

  const header = readIfExists(path.join(src, "partials", "header.html"));
  const footer = readIfExists(path.join(src, "partials", "footer.html"));

  for (const file of files) {
    const inPath = path.join(pagesDir, file);
    const raw = fs.readFileSync(inPath, "utf8");
    const html = injectPartials(raw, { header, footer });

    if (file.toLowerCase() === "index.html") {
      mkdirp(out);
      fs.writeFileSync(path.join(out, "index.html"), html);
      continue;
    }

    const name = file.replace(/\.html$/i, "");
    const destDir = path.join(out, name);
    mkdirp(destDir);
    fs.writeFileSync(path.join(destDir, "index.html"), html);
  }
}

// ---- Build pipeline ----
console.log("Build root:", root);
console.log("Src:", src);
console.log("Out:", out);

rm(out);
mkdirp(out);

// Copy assets (if present)
copyDir(path.join(src, "assets"), path.join(out, "assets"));

// Build pages
buildPages();

console.log("✅ Build complete → public/");

