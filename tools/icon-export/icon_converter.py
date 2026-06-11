"""Low-level SVG to PNG icon conversion."""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover - environment failure path
    raise SystemExit(
        "Missing dependency: Pillow. Install with: pip install -r tools/icon-export/requirements.txt"
    ) from exc


@dataclass(frozen=True)
class ConversionResult:
    output_path: Path
    size_bytes: int


def parse_hex_color(color: str) -> Tuple[int, int, int]:
    value = color.strip().lstrip("#")
    if len(value) != 6:
        raise ValueError(f"Invalid hex color: {color}")
    try:
        return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))
    except ValueError as exc:
        raise ValueError(f"Invalid hex color: {color}") from exc


def require_cairosvg():
    try:
        import cairosvg  # type: ignore
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: cairosvg. Install with: pip install -r tools/icon-export/requirements.txt"
        ) from exc
    return cairosvg


class IconConverter:
    """Convert a single SVG shape into one recolored, centered PNG."""

    def __init__(self, render_px: int = 1024):
        self.render_px = render_px

    def convert(
        self,
        source_svg: Path,
        output_png: Path,
        *,
        color: str,
        canvas_width: int,
        canvas_height: int,
        glyph_target_px: int,
    ) -> ConversionResult:
        rendered = self._render_svg(source_svg)
        image = self._recolor_and_center(
            rendered,
            color=color,
            canvas_width=canvas_width,
            canvas_height=canvas_height,
            glyph_target_px=glyph_target_px,
        )
        output_png.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_png, format="PNG", optimize=True)
        return ConversionResult(output_path=output_png, size_bytes=output_png.stat().st_size)

    def _render_svg(self, source_svg: Path) -> Image.Image:
        cairosvg = require_cairosvg()
        png_bytes = cairosvg.svg2png(
            url=str(source_svg),
            output_width=self.render_px,
            output_height=self.render_px,
        )
        return Image.open(io.BytesIO(png_bytes)).convert("RGBA")

    def _recolor_and_center(
        self,
        rendered: Image.Image,
        *,
        color: str,
        canvas_width: int,
        canvas_height: int,
        glyph_target_px: int,
    ) -> Image.Image:
        alpha = rendered.getchannel("A")
        bbox = alpha.getbbox()
        if bbox is None:
            raise ValueError("SVG rendered to an empty transparent image")

        cropped_alpha = alpha.crop(bbox)
        width, height = cropped_alpha.size
        scale = glyph_target_px / max(width, height)
        target_size = (
            max(1, round(width * scale)),
            max(1, round(height * scale)),
        )
        mask = cropped_alpha.resize(target_size, Image.Resampling.LANCZOS)

        rgb = parse_hex_color(color)
        icon = Image.new("RGBA", target_size, (*rgb, 0))
        icon.putalpha(mask)

        canvas = Image.new("RGBA", (canvas_width, canvas_height), (255, 255, 255, 0))
        offset = ((canvas_width - target_size[0]) // 2, (canvas_height - target_size[1]) // 2)
        canvas.alpha_composite(icon, offset)
        return canvas
