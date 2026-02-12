from pathlib import Path
import json
import re
import yaml

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"
CONTENT_DIR = BASE_DIR / "content" / "blog"
PUBLIC_DIR = BASE_DIR / "public"

# Load main templates
BLOG_LIST_TEMPLATE = (TEMPLATES_DIR / "blog-list.html").read_text(encoding="utf-8")
BLOG_DETAIL_TEMPLATE = (TEMPLATES_DIR / "blog-detail.html").read_text(encoding="utf-8")

# Load partials (AFTER TEMPLATES_DIR is defined)
HEADER_HTML = (TEMPLATES_DIR / "partials" / "header.html").read_text(encoding="utf-8")
FOOTER_HTML = (TEMPLATES_DIR / "partials" / "footer.html").read_text(encoding="utf-8")


def split_frontmatter(md: str):
    if not md.startswith("---"):
        return {}, md
    parts = md.split("---", 2)
    if len(parts) < 3:
        return {}, md
    fm_text = parts[1]
    body = parts[2].lstrip("\n")
    fm = yaml.safe_load(fm_text) or {}
    return fm, body


def strip_html(html: str) -> str:
    # remove tags + collapse whitespace
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def excerpt(text: str, n: int = 180) -> str:
    if len(text) <= n:
        return text
    return text[:n].rsplit(" ", 1)[0] + "…"


def parse_date(d: str) -> str:
    # keep YYYY-MM-DD; if missing or invalid, return ""
    try:
        datetime.strptime(d, "%Y-%m-%d")
        return d
    except Exception:
        return ""


def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)



def render_detail(fm: dict, body_html: str) -> str:
    # Start from the base template string
    html = BLOG_DETAIL_TEMPLATE

    # Inject header/footer partials
    html = html.replace("<!--HEADER-->", HEADER_HTML)
    html = html.replace("<!--FOOTER-->", FOOTER_HTML)

    # Fill page variables
    html = html.replace("{{TITLE}}", fm.get("title", ""))
    html = html.replace("{{META_DESC}}", fm.get("meta_desc", "") or "")
    html = html.replace("{{CATEGORY_NAME}}", (fm.get("category", {}) or {}).get("name", "General"))
    html = html.replace("{{CATEGORY_SLUG}}", (fm.get("category", {}) or {}).get("slug", "general"))
    html = html.replace("{{AUTHOR}}", fm.get("author", "admin"))
    html = html.replace("{{DATE}}", fm.get("date", ""))

    hero = fm.get("image", "") or "/static/img/blog.jpeg"
    html = html.replace("{{HERO_IMAGE}}", hero)

    # Optional author image snippet
    author_img = fm.get("author_image", "") or ""
    author_img_html = f'<img src="{author_img}" alt="{fm.get("author","")}" />' if author_img else ""
    html = html.replace("{{AUTHOR_IMAGE_HTML}}", author_img_html)

    # Body HTML
    html = html.replace("{{BODY_HTML}}", body_html)

    return html

def build():
    posts = []

    for md_path in CONTENT_DIR.rglob("*.md"):
        md = md_path.read_text(encoding="utf-8")
        fm, body_html = split_frontmatter(md)

        cat = fm.get("category", {}) or {}
        category_slug = cat.get("slug", "general") or "general"
        slug = fm.get("slug") or md_path.stem
        url = f"/blog/{category_slug}/{slug}/"

        body_text = strip_html(body_html)
        posts.append({
            "title": fm.get("title", ""),
            "slug": slug,
            "category": {"name": cat.get("name", "General"), "slug": category_slug},
            "date": parse_date(fm.get("date", "")),
            "author": fm.get("author", "admin"),
            "author_image": fm.get("author_image", ""),
            "image": fm.get("image", "/static/img/blog.jpeg") or "/static/img/blog.jpeg",
            "meta_desc": fm.get("meta_desc", ""),
            "meta_tags": fm.get("meta_tags", ""),
            "featured": bool(fm.get("featured", False)),
            "url": url,
            "body_text": body_text,
            "excerpt": excerpt(body_text),
        })

        # write detail page
        out_dir = PUBLIC_DIR / "blog" / category_slug / slug
        ensure_dir(out_dir)
        (out_dir / "index.html").write_text(render_detail(fm, body_html), encoding="utf-8")

    # sort newest first (string compare works for YYYY-MM-DD)
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)

    # write search.json (include text for search)
    search_index = [{
        "title": p["title"],
        "category": p["category"],
        "date": p["date"],
        "author": p["author"],
        "url": p["url"],
        "excerpt": p["excerpt"],
        "image": p["image"],
        "author_image": p["author_image"],
        "body_text": p["body_text"],
    } for p in posts]

    (PUBLIC_DIR / "search.json").write_text(
        json.dumps(search_index, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    # render blog list shell (JS fills posts)
    blogs_dir = PUBLIC_DIR / "blogs"
    ensure_dir(blogs_dir)

    list_html = BLOG_LIST_TEMPLATE
    list_html = list_html.replace("<!--HEADER-->", HEADER_HTML)
    list_html = list_html.replace("<!--FOOTER-->", FOOTER_HTML)

    # IMPORTANT: write list_html (not BLOG_LIST_TEMPLATE)
    (blogs_dir / "index.html").write_text(list_html, encoding="utf-8")

    print(f"Built {len(posts)} posts.")
    print("Wrote public/blogs/index.html, public/search.json, and all detail pages.")


if __name__ == "__main__":
    build()

