#!/usr/bin/env python3
"""Validate icon manifests and export SVG assets to PNG icons."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple

from icon_converter import IconConverter, parse_hex_color


ROOT = Path(__file__).resolve().parents[2]
STATIC_ICONS_ROOT = (ROOT / "static" / "icons").resolve()


@dataclass(frozen=True)
class OutputPlan:
    source_svg: Path
    output_png: Path
    color: str
    variant: str
    semantic: str


def read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8-sig") as fh:
        return json.load(fh)


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def manifest_for_group(group: str) -> Path:
    group_path = Path(group)
    if group_path.is_absolute() or ".." in group_path.parts:
        raise ValueError(f"invalid group: {group}")

    manifest = (STATIC_ICONS_ROOT / group_path / "icon-spec.json").resolve()
    try:
        manifest.relative_to(STATIC_ICONS_ROOT)
    except ValueError as exc:
        raise ValueError(f"group must resolve under static/icons/: {group}") from exc
    return manifest


def resolve_manifest(args: argparse.Namespace) -> Path:
    if args.group and args.manifest:
        raise ValueError("use either --group or --manifest, not both")
    if args.manifest:
        path = Path(args.manifest)
        return (path if path.is_absolute() else ROOT / path).resolve()
    if args.group:
        return manifest_for_group(args.group).resolve()
    raise ValueError("missing target: pass --group <name> or --manifest <path>")


def canvas_size(manifest: dict) -> Tuple[int, int]:
    canvas = manifest.get("canvasPx")
    if isinstance(canvas, int):
        return canvas, canvas
    if isinstance(canvas, dict):
        width = canvas.get("width")
        height = canvas.get("height")
        if isinstance(width, int) and isinstance(height, int):
            return width, height
    raise ValueError("manifest must define canvasPx.width and canvasPx.height")


def glyph_target(manifest: dict) -> int:
    value = manifest.get("glyphTargetPx")
    if isinstance(value, int) and value > 0:
        return value
    legacy = manifest.get("visualGlyphPx")
    if isinstance(legacy, dict) and isinstance(legacy.get("max"), int) and legacy["max"] > 0:
        return int(legacy["max"])
    raise ValueError("manifest must define glyphTargetPx or visualGlyphPx.max")


def source_dir(manifest: dict) -> Path:
    explicit = manifest.get("sourceDir")
    if explicit:
        path = Path(explicit)
        return (path if path.is_absolute() else ROOT / path).resolve()

    scope = require_str(manifest, "scope")
    return (ROOT / "tools" / "icon-export" / "source" / Path(scope)).resolve()


def output_dir(manifest: dict) -> Path:
    directory = require_str(manifest, "directory")
    path = (ROOT / directory).resolve()
    try:
        path.relative_to(STATIC_ICONS_ROOT)
    except ValueError as exc:
        raise ValueError("manifest directory must point under static/icons/") from exc
    return path


def validate_format_and_background(manifest: dict) -> None:
    fmt = str(manifest.get("format", "png"))
    if fmt != "png":
        raise ValueError("manifest format must be png")

    background = str(manifest.get("background", "transparent"))
    if background != "transparent":
        raise ValueError("manifest background must be transparent")


def require_str(manifest: dict, field: str) -> str:
    value = manifest.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"manifest must define {field}")
    return value.strip()


def resolve_color(icon: dict, palette: dict, variant_palette_ref: str | None = None) -> str:
    if variant_palette_ref:
        if variant_palette_ref not in palette:
            raise ValueError(f"paletteRef not found: {variant_palette_ref}")
        return str(palette[variant_palette_ref])

    palette_ref = icon.get("paletteRef")
    if palette_ref:
        if palette_ref not in palette:
            raise ValueError(f"paletteRef not found: {palette_ref}")
        return str(palette[palette_ref])

    color = icon.get("color")
    if color:
        return str(color)

    raise ValueError(f"icon {icon.get('source', '<unknown>')} must define paletteRef or color")


def variant_output_name(base_name: str, variant: str, icon: dict) -> str:
    if variant == "default":
        return base_name

    stem = Path(base_name).stem
    suffix = Path(base_name).suffix or ".png"
    if variant == "active":
        active_suffix = str(icon.get("activeSuffix", "-active"))
        return f"{stem}{active_suffix}{suffix}"
    return f"{stem}-{variant}{suffix}"


def planned_outputs(manifest: dict) -> List[OutputPlan]:
    palette = manifest.get("palette", {})
    if not isinstance(palette, dict):
        raise ValueError("manifest palette must be an object")

    src_dir = source_dir(manifest)
    out_dir = output_dir(manifest)
    icons = manifest.get("icons")
    if not isinstance(icons, list) or not icons:
        raise ValueError("manifest icons must be a non-empty list")

    plans: List[OutputPlan] = []
    for icon in icons:
        if not isinstance(icon, dict):
            raise ValueError("each icon entry must be an object")
        source = require_icon_str(icon, "source")
        name = require_icon_str(icon, "name")
        semantic = str(icon.get("semantic", ""))
        source_path = (src_dir / source).resolve()

        variants = icon.get("variants")
        if isinstance(variants, dict) and variants:
            for variant, palette_ref in variants.items():
                color = resolve_color(icon, palette, str(palette_ref))
                plans.append(
                    OutputPlan(
                        source_svg=source_path,
                        output_png=out_dir / variant_output_name(name, str(variant), icon),
                        color=color,
                        variant=str(variant),
                        semantic=semantic,
                    )
                )
        else:
            color = resolve_color(icon, palette)
            plans.append(
                OutputPlan(
                    source_svg=source_path,
                    output_png=out_dir / name,
                    color=color,
                    variant="default",
                    semantic=semantic,
                )
            )
    return plans


def require_icon_str(icon: dict, field: str) -> str:
    value = icon.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"each icon must define {field}")
    return value.strip()


def validate_manifest(manifest_path: Path) -> Tuple[dict, List[OutputPlan], List[str]]:
    if not manifest_path.exists():
        raise ValueError(f"manifest not found: {rel(manifest_path)}")

    manifest = read_json(manifest_path)
    require_str(manifest, "scope")
    validate_format_and_background(manifest)
    output_dir(manifest)
    canvas_size(manifest)
    glyph_target(manifest)

    palette = manifest.get("palette", {})
    if not isinstance(palette, dict):
        raise ValueError("manifest palette must be an object")
    for name, color in palette.items():
        parse_hex_color(str(color))

    src_dir = source_dir(manifest)
    if not src_dir.exists():
        raise ValueError(f"source directory not found: {rel(src_dir)}")

    plans = planned_outputs(manifest)
    out_dir = output_dir(manifest)
    output_keys = [plan.output_png.relative_to(out_dir).as_posix() for plan in plans]
    duplicates = sorted({key for key in output_keys if output_keys.count(key) > 1})
    if duplicates:
        raise ValueError(f"duplicate output path(s): {', '.join(duplicates)}")

    for plan in plans:
        parse_hex_color(plan.color)
        if not plan.source_svg.exists():
            raise ValueError(f"missing source SVG: {rel(plan.source_svg)}")

    registered_sources = {plan.source_svg.resolve() for plan in plans}
    source_svgs = {path.resolve() for path in src_dir.rglob("*.svg")}
    unregistered = sorted(path for path in source_svgs if path not in registered_sources)
    warnings = [f"WARNING: unregistered SVG in source directory: {rel(path)}" for path in unregistered]
    return manifest, plans, warnings


def run_validate(manifest_path: Path) -> int:
    try:
        _manifest, plans, warnings = validate_manifest(manifest_path)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print(f"Validated manifest: {rel(manifest_path)}")
    print(f"Planned output count: {len(plans)}")
    for warning in warnings:
        print(warning)
    return 0


def run_export(manifest_path: Path, dry_run: bool) -> int:
    try:
        manifest, plans, warnings = validate_manifest(manifest_path)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    for warning in warnings:
        print(warning)

    render_px = int(manifest.get("renderPx", 1024))
    max_file_kb = int(manifest.get("maxFileKB", 40))
    width, height = canvas_size(manifest)
    target_px = glyph_target(manifest)
    converter = IconConverter(render_px=render_px)

    for plan in plans:
        if dry_run:
            print(
                f"DRY RUN {rel(plan.source_svg)} -> {rel(plan.output_png)} "
                f"({plan.color}, {plan.variant})"
            )
            continue

        try:
            result = converter.convert(
                plan.source_svg,
                plan.output_png,
                color=plan.color,
                canvas_width=width,
                canvas_height=height,
                glyph_target_px=target_px,
            )
        except Exception as exc:
            print(f"ERROR: failed to export {rel(plan.source_svg)}: {exc}", file=sys.stderr)
            return 1

        size_kb = result.size_bytes / 1024
        warning = f" WARNING: exceeds {max_file_kb}KB" if size_kb > max_file_kb else ""
        print(
            f"{rel(plan.source_svg)} -> {rel(result.output_path)} "
            f"({plan.color}, {plan.variant}, {size_kb:.1f}KB){warning}"
        )

    action = "planned" if dry_run else "written"
    print(f"Done: {len(plans)} PNG output(s) {action}.")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate icon manifests and export SVG icons.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    for command in ("validate", "export"):
        sub = subparsers.add_parser(command)
        sub.add_argument("--group", help="Manifest group under static/icons/, e.g. tab, page/today, page/calendar.")
        sub.add_argument("--manifest", help="Direct path to an icon manifest JSON.")
        if command == "export":
            sub.add_argument("--dry-run", action="store_true", help="Preview output paths without writing PNG files.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        manifest_path = resolve_manifest(args)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if args.command == "validate":
        return run_validate(manifest_path)
    if args.command == "export":
        return run_export(manifest_path, bool(getattr(args, "dry_run", False)))
    parser.error(f"unknown command: {args.command}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
