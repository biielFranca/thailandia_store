"""
Remove the dark navy background from public/brand/logo-source.png and write
public/brand/logo.png with full transparency.

Strategy: the logo is high-contrast (white/light foreground on dark navy bg).
We compute per-pixel "darkness" and map it to alpha — fully dark pixels go
transparent, fully light pixels stay opaque, mid-tones get a soft alpha so
edges anti-alias instead of looking jagged.

Run from repo root:
    python scripts/remove-logo-bg.py
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image

SRC = Path("public/brand/logo-source.png")
DST = Path("public/brand/logo.png")

# Tunables. The background is roughly RGB ~(10, 18, 60). Pixels darker than
# DARK_THRESHOLD become fully transparent; pixels brighter than LIGHT_THRESHOLD
# stay fully opaque; the band between is alpha-blended for a clean edge.
DARK_THRESHOLD = 70   # luminance below this → alpha 0
LIGHT_THRESHOLD = 180  # luminance above this → alpha 255


def luminance(r: int, g: int, b: int) -> int:
    # Rec. 709 luma — matches human perception of brightness.
    return int(0.2126 * r + 0.7152 * g + 0.0722 * b)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source file not found: {SRC.resolve()}")

    img = Image.open(SRC).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            lum = luminance(r, g, b)
            if lum <= DARK_THRESHOLD:
                alpha = 0
            elif lum >= LIGHT_THRESHOLD:
                alpha = 255
            else:
                # Linear ramp through the transition band.
                ratio = (lum - DARK_THRESHOLD) / (LIGHT_THRESHOLD - DARK_THRESHOLD)
                alpha = int(round(ratio * 255))
            # Force foreground to white so the asset reads cleanly on any
            # surface color in the storefront. Comment this out if you want to
            # preserve the original logo color.
            pixels[x, y] = (255, 255, 255, alpha)

    DST.parent.mkdir(parents=True, exist_ok=True)
    img.save(DST, format="PNG", optimize=True)
    print(f"Wrote {DST} ({DST.stat().st_size:,} bytes, {w}x{h})")


if __name__ == "__main__":
    main()
