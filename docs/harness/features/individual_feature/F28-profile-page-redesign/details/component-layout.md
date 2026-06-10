# F28 Component Layout

## 1. Purpose

This document turns `docs/design/page/reference_image/我的.png` into an implementable six-layer layout for F28.

It is not a full product specification. It only defines:

- The six visible layers of the profile page.
- The component order inside each layer.
- The icon anchors required by each layer.
- Which visual elements should be implemented with CSS instead of SVG.
- Which parts must not expand into data/model/service work.

## 2. Page Structure

Recommended top-to-bottom structure:

```text
Native navigation title: 我的

Page body:
  1. Avatar greeting strip
  2. Current goal card / no-goal card
  3. Default planning preferences card
  4. AI expression and ritual preferences card
  5. Recent progress summary card
  6. Bottom management icon list

Bottom TabBar
```

The first screen should expose the avatar greeting strip, current goal card, and the start of the default preferences card when data exists.

## 3. Icon Resource Contract

F28 page icons should use the profile page icon group:

```text
tools/icon-export/source/page/profile/
static/icons/page/profile/
```

The implementation should use stable PNG output names from `static/icons/page/profile/icon-spec.json`, not raw provider filenames.

Runtime rule:

- Prefer static image paths such as `/static/icons/page/profile/goal.png`.
- Do not use runtime icon object bindings such as `:src="icon.path"` unless compiled mp-weixin output is explicitly verified.
- If an icon causes mp-weixin image-path pollution, replace that specific icon usage with a CSS marker and record the reason in `docs/progress.md`.

## 4. Layer 1: Avatar Greeting Strip

Role:

- Establish that this is a personal management page.
- Provide a light, friendly entry without turning into a marketing hero.

Required icon:

| PNG | Source SVG | Use |
|---|---|---|
| `grass.png` | `grass.svg` | Greeting strip visual marker |

Content:

- Avatar or CSS avatar placeholder.
- Short greeting.
- One short supporting sentence.
- Optional right arrow for profile/settings entry.
- `grass.png` as a small vitality marker, not a large illustration.

Rules:

- Do not repeat a large `我的` title in page body.
- Do not use a large hero section.
- Keep this strip visually lighter than the current goal card.
- The avatar itself can be a CSS placeholder; it does not need an SVG icon.

MVP:

- UI mock is acceptable.
- Avatar can use CSS placeholder if no asset exists.

## 5. Layer 2: Current Goal Card

Role:

- Main business focus when a goal exists.
- Tell the user what goal is active and what to do next.

Required icons:

| PNG | Source SVG | Use |
|---|---|---|
| `goal.png` | `goal.svg` | Section label / current goal marker |
| `goal-hero.png` | `goal-hero.svg` | Larger right-side goal illustration |
| `calendar.png` | `calendar.svg` | Deadline / remaining days |

Content:

- Section label: current goal.
- Goal title.
- Status chip, such as in progress.
- Deadline and remaining days.
- Overall progress text and progress bar.
- Primary action: view plan.
- Secondary action: manage goal.
- Larger `goal-hero.png` visual on the right side if space allows.

Rules:

- This card must have the strongest business visual weight.
- Progress means goal-level progress, not a single task status.
- Do not show raw naked numbers without labels.
- Do not put Today or Calendar duplicate TabBar entries here.
- `goal-hero.png` is decorative support; it must not push the goal title or primary actions below the first screen.

No-goal state:

- Replace this card with a focused create-goal entry.
- Primary action should be create goal.
- Do not show empty statistics as if they were real progress.

MVP:

- Use existing available goal/progress view data.
- If a field is missing, use a readable fallback and record the gap in `docs/progress.md`.
- Do not modify models/services to fill missing fields.

## 6. Layer 3: Default Planning Preferences Card

Role:

- Show scheduling preferences used for task arrangement.

Required icons:

| PNG | Source SVG | Use |
|---|---|---|
| `suggestion.png` | `suggestion.svg` | Section title marker |
| `clock.png` | `clock.svg` | Daily available time |
| `sun.png` | `sun.svg` | Preferred working time |
| `bar-chart.png` | `bar-chart.svg` | Plan intensity |
| `smile.png` | `smile.svg` | Energy state |

Content blocks:

- Daily available time.
- Preferred working time.
- Plan intensity.
- Current energy state.

Visual pattern:

- Compact horizontal preference tiles.
- Each tile has a small icon, label, and value.
- Include a lightweight edit entry.

Rules:

- This is not AI expression preference.
- Do not include tarot, MBTI, or daily keyword here.
- If plan intensity is not persisted in current data, use fallback/UI-only display and record the gap.
- `suggestion.svg` is only a section marker; it must not imply the app has made a scientific recommendation.

MVP:

- Read existing user profile fields where available.
- UI-only fallback is allowed for fields not currently supported.

## 7. Layer 4: AI Expression And Ritual Preferences Card

Role:

- Group expression style and ritual preferences separately from scheduling preferences.

Required icons:

| PNG | Source SVG | Use |
|---|---|---|
| `sparkle.png` | `sparkle.svg` | Section title marker |
| `chat.png` | `chat.svg` | Suggestion style |
| `star.png` | `star.svg` | Daily keyword |
| `tarot.png` | `tarot.svg` | Tarot inspiration |
| `mbti.png` | `mbti.svg` | MBTI expression preference |

Rows:

- Suggestion style.
- Daily keyword.
- Tarot inspiration.
- MBTI.

Visual pattern:

- Vertical list rows.
- Each row has a small icon, label, current value, and chevron.
- Include a short disclaimer: these only affect expression style and ritual feel, not scientific task decisions.

Rules:

- Do not write tarot, MBTI, or daily keyword as task decision inputs.
- Do not create a complex tarot spread.
- Do not introduce real AI/tarot network calls.

MVP:

- UI mock values are acceptable if no real preference field exists.
- Missing data must not trigger service/model changes in F28.

## 8. Layer 5: Recent Progress Summary Card

Role:

- Provide a quick progress snapshot.

Required icon:

| PNG | Source SVG | Use |
|---|---|---|
| `progress-chart.png` | `progress-chart.svg` | Recent progress section marker |

Content:

- Tasks completed this week.
- Accumulated focus time.
- Continuous progress days.

CSS-owned markers:

- The three inner stat markers should be implemented with CSS instead of separate SVG icons.
- Completion can use a CSS check mark or small dot.
- Focus time can use text + CSS marker.
- Continuous days can use a CSS accent marker.

Rules:

- Keep it compact.
- Do not let this card become the first visual focus when a current goal exists.
- Use labels with numbers; do not render naked statistics.

MVP:

- Use available progress data if present.
- Otherwise use fallback display and record data gap.

## 9. Layer 6: Bottom Management Icon List

Role:

- Collect low-frequency management entries at the bottom.

Required icons:

| PNG | Source SVG | Use |
|---|---|---|
| `folder.png` | `folder.svg` | Goal management |
| `document.png` | `document.svg` | Review records |
| `setting.png` | `setting.svg` | Preference settings |
| `suggestion.png` | `suggestion.svg` | About and feedback / suggestion entry |

Rows:

- Goal management.
- Review records.
- Preference settings.
- About and feedback.

Rules:

- Do not duplicate bottom TabBar entries such as Today, Calendar, or Create.
- Keep this as a plain list or light card, not a grid of large buttons.
- Entries can be UI mock if destination pages are not part of F28.
- The right chevron can be CSS/text; no separate SVG is required.

## 10. CSS-Owned Visuals

Use CSS instead of SVG for:

- Avatar placeholder.
- Status chip.
- Progress bar.
- Preference tile selected/default state.
- Recent-progress inner stat markers.
- Right chevrons.
- Card shadows, borders, and rounded corners.
- Bottom TabBar icons.

Bottom TabBar icons are not part of F28. They belong to F29.

## 11. Visual Constraints

- Cards should be visually related but not identical in content shape.
- Use compact spacing; avoid large top whitespace.
- Keep button hierarchy clear: primary action only for the most important operation in the current goal/no-goal card.
- Use icons as scanning anchors, not decorative clutter.
- Avoid runtime image binding patterns that previously caused mp-weixin image-path pollution.

## 12. Out Of Scope

F28 must not:

- Modify models or services.
- Add new persisted preference fields.
- Implement real settings pages.
- Add real AI/tarot/MBTI logic.
- Modify TabBar routes.
- Change today/calendar/create page structure.

## 13. Reference Check

After implementation, compare against `docs/design/page/reference_image/我的.png` and answer:

- Does the page read as "my goals and preferences"?
- Are the six layers visible in the intended order?
- Is the current goal/no-goal state the first business focus?
- Are scheduling preferences and expression preferences visually separated?
- Is recent progress compact?
- Are settings entries collected at the bottom?
- Did the implementation avoid becoming just a lightly restyled old entry list?
