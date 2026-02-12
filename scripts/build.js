// scripts/build.js
const fs = require("fs");
const path = require("path");

const root = process.cwd();
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

function buildPages() {
  const pagesDir = path.join(src, "pages");
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith(".html"));

  for (const file of files) {
    const html = fs.readFileSync(path.join(pagesDir, file), "utf8");

    if (file === "index.html") {
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

rm(out);
mkdirp(out);

// Copy assets and partials
copyDir(path.join(src, "assets"), path.join(out, "assets"));
copyDir(path.join(src, "partials"), path.join(out, "partials"));

// Build pages
buildPages();

console.log("✅ Build complete → public/");

