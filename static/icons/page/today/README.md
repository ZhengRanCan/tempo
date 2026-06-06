# Today Page Icons

Place today-page module icons in this directory when a feature explicitly requires local image assets:

```text
static/icons/page/today/
```

## Naming

- `star.png`
- `clock.png`
- `flag.png`
- `list.png`
- `status-wave.png`
- `sparkle.png`
- `moon.png`

## Size

- Format: PNG.
- Background: transparent.
- Canvas: `64px * 64px`.
- Visual glyph: about `40px - 48px` within the canvas.
- Runtime visual target: `16px - 22px`, depending on where the icon is used.

## Color

- Warm accent icons: `#F47A3D`.
- Primary accent icons: `#6B5BEA`.
- Neutral metadata icons: `#77716A`.
- Soft disabled icons: `#B8B0A6`.
- Background must be transparent.

Recommended mapping:

- `star.png`: `#F47A3D`.
- `clock.png`: `#77716A`.
- `flag.png`: `#77716A`.
- `list.png`: `#6B5BEA`.
- `status-wave.png`: `#6B5BEA`.
- `sparkle.png`: `#6B5BEA`.
- `moon.png`: `#6B5BEA`.

## Style

- Use one icon family for all today-page icons.
- Prefer simple line icons or lightly filled icons.
- Keep stroke width consistent.
- Icons should guide scanning, not become decorative clutter.
- Do not use emoji or colorful illustration assets as final icons.

Machine-readable details are in `icon-spec.json`.
