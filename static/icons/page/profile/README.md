# Profile Page Icons

This directory is for page-specific PNG icons used by the profile page.

Directory:

```text
static/icons/page/profile/
```

Source SVG directory:

```text
tools/icon-export/source/page/profile/
```

Manifest:

```text
static/icons/page/profile/icon-spec.json
```

## Required Icons

F28 uses these icons as small scanning anchors for the six profile-page layers. Icons support structure; they must not replace text labels.

| PNG | Source SVG | Use |
|---|---|---|
| `grass.png` | `grass.svg` | Avatar greeting strip |
| `goal.png` | `goal.svg` | Current goal section marker |
| `goal-hero.png` | `goal-hero.svg` | Larger current-goal card visual |
| `calendar.png` | `calendar.svg` | Deadline / remaining days |
| `suggestion.png` | `suggestion.svg` | Default planning preference marker and bottom suggestion entry |
| `clock.png` | `clock.svg` | Daily available time |
| `sun.png` | `sun.svg` | Preferred working time |
| `bar-chart.png` | `bar-chart.svg` | Plan intensity |
| `smile.png` | `smile.svg` | Energy state |
| `sparkle.png` | `sparkle.svg` | AI expression and ritual section marker |
| `chat.png` | `chat.svg` | Suggestion style |
| `star.png` | `star.svg` | Daily keyword |
| `tarot.png` | `tarot.svg` | Tarot inspiration |
| `mbti.png` | `mbti.svg` | MBTI expression preference |
| `progress-chart.png` | `progress-chart.svg` | Recent progress section marker |
| `folder.png` | `folder.svg` | Goal management |
| `document.png` | `document.svg` | Review records |
| `setting.png` | `setting.svg` | Preference settings |

## Optional Reserved Icon

| PNG | Source SVG | Use |
|---|---|---|
| `preference.png` | `preference.svg` | Reserved preference marker. Not required by the F28 six-layer layout. |

## CSS-Owned States

Use CSS instead of separate SVG icons for:

- Avatar placeholder.
- Status chip.
- Progress bar.
- Preference tile selected/default state.
- Recent-progress inner stat markers.
- Right chevrons.
- Card shadows, borders, and rounded corners.
- Bottom TabBar icons.

Bottom TabBar icons are handled by F29 and must not be mixed into this folder.

## Style Rules

- Use one icon family for all profile page icons.
- Prefer simple line icons or lightly filled icons.
- Keep stroke width, corner radius, and visual weight consistent.
- Use icons as small visual anchors, not as decorative illustrations.
- Do not use emoji, multi-color, gradient, shadow-heavy, or illustration-style icons as final assets.
- SVG source colors are ignored by the export tool. Final PNG colors come from `icon-spec.json`.

## Runtime Rule

When these icons are used in mini-program pages or components, prefer static image paths:

```vue
<image src="/static/icons/page/profile/goal.png" />
```

Avoid runtime object bindings such as `:src="icon.path"` for official page icons unless tests explicitly verify the compiled mp-weixin output keeps valid string paths.
