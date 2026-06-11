# TabBar Icons

Place bottom TabBar icon assets in this directory:

```text
static/icons/tab/
```

## Naming

- `today.png`
- `today-active.png`
- `calendar.png`
- `calendar-active.png`
- `create.png`
- `create-active.png`
- `profile.png`
- `profile-active.png`

Default icons use the plain name. Selected icons use the `-active` suffix.

## Size

- Format: PNG.
- Background: transpare
- Canvas: `81px * 81px`.
- Visual glyph: about `54px - 60px` within the canvas.
- Runtime visual target: about `27px * 27px` in the mini-program TabBar.

## Color

- Default: `#8A8176`.
- Active: `#6B5BEA`.
- Background must be transparent.
- Do not use multi-color, emoji-like, gradient, or illustration-style icons.

## Style

- Use the same icon family/style for all four tabs.
- Prefer simple line icons or lightly filled icons.
- Keep stroke width and visual weight consistent.
- Default and active states SHOULD differ by color only, not by shape.
- If an active icon must change shape, record the reason and get user confirmation before treating it as final.

## Passing Boundary

The final icons should be provided or confirmed by the user. Agent-created rough placeholders cannot be treated as final passing evidence.

Machine-readable details are in `icon-spec.json`.

SVG sources can be exported into this directory with:

```powershell
python tools/icon-export/export_icons.py
```
