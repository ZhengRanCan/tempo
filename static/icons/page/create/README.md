# Create Goal Page Icons

This directory is for page-specific PNG icons used by the create goal page.

Directory:

```text
static/icons/page/create/
```

Source SVG directory:

```text
tools/icon-export/source/page/create/
```

Manifest:

```text
static/icons/page/create/icon-spec.json
```

## Required Icons

F27 should keep icon usage small. The reference image mainly relies on step numbers, cards, selected chips, and button hierarchy; those should be implemented with CSS, not extra SVG files.

| PNG | Source SVG | Use |
|---|---|---|
| `sparkle.png` | `sparkle.svg` | Top lightweight guide / atmosphere anchor |
| `calendar.png` | `calendar.svg` | Deadline input |
| `clock.png` | `clock.svg` | Daily available time input |
| `edit.png` | `编辑.svg` | Custom minutes edit entry |
| `note.png` | `补充说明.svg` | Optional note input |
| `preference.png` | `preference.svg` | Personalized arrangement preferences |
| `lock.png` | `lock.svg` | Bottom safety note |

Source SVG filenames may keep the names exported from the icon provider, including Chinese filenames. Output PNG names must stay stable and ASCII because page code should reference PNG paths directly.

## CSS-Owned States

The following must usually be CSS, not SVG:

- Step number badges.
- Selected / default / disabled chip states.
- Input borders and focus states.
- Primary button gradient.
- Card borders, shadows, and spacing.
- Required / optional labels.

## Style Rules

- Use one icon family for all create-goal page icons.
- Keep icons small; they are scanning anchors, not decoration.
- SVG source colors are ignored by the export tool. Final PNG colors come from `icon-spec.json`.
- Prefer static image paths in mini-program pages:

```vue
<image src="/static/icons/page/create/calendar.png" />
```

Avoid runtime object bindings such as `:src="icon.path"` for official page icons unless tests verify the compiled mp-weixin output keeps valid string paths.
