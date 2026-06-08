# Calendar Page Icons

This directory is for page-specific PNG icons used by the task calendar page.

Directory:

```text
static/icons/page/calendar/
```

Source SVG directory:

```text
tools/icon-export/source/page/calendar/
```

Manifest:

```text
static/icons/page/calendar/icon-spec.json
```

## Required Icons

The F26 calendar redesign should use only these SVG-backed icons as scanning anchors. Icons support meaning and rhythm; they must not replace text labels.

| PNG | Source SVG | Use |
|---|---|---|
| `target.png` | `target.svg` | Current goal / goal plan card |
| `calendar.png` | `calendar.svg` | Deadline and selected date |
| `week.png` | `week.svg` | Future 7-day overview / week view |
| `adjust.png` | `adjust.svg` | Adjust plan entry |
| `sparkle.png` | `sparkle.svg` | AI plan suggestion |
| `clock.png` | `clock.svg` | Estimated minutes / remaining time |
| `priority.png` | `priority.svg` | Task priority |

## CSS-Owned States

The following visual states should usually be represented with CSS badges, dots, progress bars, chips, borders, or text instead of separate SVG icons:

- Overall progress.
- Time pressure severity.
- Completed state.
- No-task / buffer day state.
- Overdue risk / overloaded day.
- Long-term stage grouping.
- Selected-date task-list container marker.

## Style Rules

- Use one icon family for all calendar page icons.
- Prefer simple line icons or lightly filled icons.
- Keep stroke width, corner radius, and visual weight consistent.
- Use icons as small visual anchors, not as decorative illustrations.
- Do not use emoji, multi-color, gradient, shadow-heavy, or illustration-style icons as final assets.
- SVG source colors are ignored by the export tool. Final PNG colors come from `icon-spec.json`.

## Runtime Rule

When these icons are used in mini-program pages or components, prefer static image paths:

```vue
<image src="/static/icons/page/calendar/target.png" />
```

Avoid runtime object bindings such as `:src="icon.path"` for official page icons unless tests explicitly verify the compiled mp-weixin output keeps valid string paths.
