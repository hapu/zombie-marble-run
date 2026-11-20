#!/usr/bin/env python3
"""Bundle the module graph and Rapier engine into one self-contained HTML file."""

from pathlib import Path
import base64
import re


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "dist" / "zombie-marble-run.html"


def strip_module_source(source: str) -> str:
    source = re.sub(
        r"(?ms)^import\s+(?:\{.*?\}|[^;]+?)\s+from\s+[\"'][^\"']+[\"'];",
        "",
        source,
    )
    source = re.sub(r"^export\s+(?=(?:async\s+)?function\b)", "", source, flags=re.MULTILINE)
    source = re.sub(r"^export\s+(?=(?:const|let|var|class)\b)", "", source, flags=re.MULTILINE)
    source = re.sub(r"(?ms)^export\s*\{.*?\};", "", source)
    return source.strip()


def inline_html_assets(html: str) -> str:
    def replace_asset(match):
        attribute, quote, path = match.group(1), match.group(2), match.group(3)
        if path.startswith(("data:", "http:", "https:", "#")):
            return match.group(0)
        asset = (ROOT / path).resolve()
        if not asset.is_file():
            return match.group(0)
        mime = (
            "image/png" if asset.suffix.lower() == ".png"
            else "image/jpeg" if asset.suffix.lower() in (".jpg", ".jpeg")
            else "image/svg+xml" if asset.suffix.lower() == ".svg"
            else "audio/mpeg" if asset.suffix.lower() == ".mp3"
            else "application/octet-stream"
        )
        data = base64.b64encode(asset.read_bytes()).decode("ascii")
        return f"{attribute}={quote}data:{mime};base64,{data}{quote}"

    return re.sub(
        r'\b(src|href)\s*=\s*(["\'])([^"\']+)\2',
        replace_asset,
        html,
    )


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = html.replace(
        '<script type="module" src="src/main.js"></script>',
        "__SCRIPT_PLACEHOLDER__",
    )
    html = inline_html_assets(html)

    rapier = (ROOT / "vendor" / "rapier.mjs").read_text(encoding="utf-8")
    rapier = re.sub(r"(?m)^//# sourceMappingURL=.*$", "", rapier)
    rapier = re.sub(r"(?ms)export\s*\{.*?\};\s*$", "", rapier).strip()

    modules = [
        ROOT / "src" / "gameConfig.js",
        ROOT / "src" / "physicsUnits.js",
        ROOT / "src" / "world.js",
        ROOT / "src" / "entities.js",
        ROOT / "src" / "combat.js",
        ROOT / "src" / "render.js",
        ROOT / "src" / "input.js",
        ROOT / "src" / "main.js",
    ]

    bundle = [
        "{\n" + rapier + "\nglobalThis.__RAPIER__ = BC;\n}",
        "const RAPIER = globalThis.__RAPIER__;\ndelete globalThis.__RAPIER__;",
        *[strip_module_source(path.read_text(encoding="utf-8")) for path in modules],
    ]

    script = "\n;\n".join(bundle)
    html = html.replace(
        "__SCRIPT_PLACEHOLDER__",
        "<script>\n" + script + "\n</script>",
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
