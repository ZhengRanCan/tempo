# Common Icons

Place shared UI icon assets in this directory when they are used by more than one page or component:

```text
static/icons/common/
```

## Naming

Use semantic lowercase kebab-case names:

- `chevron-right.png`
- `info.png`
- `close.png`
- `check.png`
- `warning.png`
- `settings.png`

Only place an icon here after it is reused by more than one page or component. If an icon is page-specific, keep it under `static/icons/page/<page-name>/`.

## Size

- Format: PNG.
- Background: transparent.
- Canvas: `64px * 64px`.
- Visual glyph: about `40px - 48px` within the canvas.
- Runtime visual target: `16px - 24px`.

## Color

- Neutral icon: `#77716A`.
- Primary icon: `#6B5BEA`.
- Muted icon: `#B8B0A6`.
- Warning icon: `#D97706`.
- Error icon: `#DC2626`.

Use warning and error colors only for warning/error semantics.

## Style

- Shared icons should be plain and reusable.
- Use one icon family where possible.
- Keep stroke width, corner radius, and visual weight consistent.
- Do not put page-specific meaning into common icons.

Machine-readable details are in `icon-spec.json`.

SVG sources can be exported into this directory with:

```powershell
python tools/icon-export/export_icons.py
```
