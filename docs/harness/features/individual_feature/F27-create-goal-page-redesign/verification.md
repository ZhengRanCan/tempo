# F27 Verification

## 1. Required Commands

| Level | Command | Required |
|---|---|---|
| L1 static | `npm.cmd run verify:static` | yes |
| L2 feature | `npm.cmd run test -- goal-create user-profile ui-components data-layer navigation-shell` | yes |
| L3 system | `npm.cmd run verify:system` | yes |
| Harness | `npm.cmd run verify:harness` | yes |

## 2. Build Entry Check

The executor must confirm the manual check uses the current build output.

Check:

- `project.config.json.miniprogramRoot`
- `dist/dev/mp-weixin/pages/goal-create/`
- `dist/build/mp-weixin/pages/goal-create/`

If WeChat DevTools is not using the current build output, F27 cannot be judged visually.

## 3. Reference Image Evidence

Reference image:

```text
docs/design/page/reference_image/创建目标.jpeg
```

F27 cannot pass from automated tests alone. The final evidence must include either:

- user manual confirmation that the create goal page is visually close enough to the reference image, or
- a checkable screenshot path plus notes comparing it with the reference image.

The comparison must mention:

- first-screen information order,
- step-card input structure,
- card density and spacing,
- selected chip style,
- personalized preference panel,
- primary generate button,
- whether the result still looks like the old form.

## 4. Icon Resource Check

If official create-page PNG icons are used, verify they come from:

```text
static/icons/page/create/
```

Prefer static image paths:

```vue
<image src="/static/icons/page/create/calendar.png" />
```

Do not treat placeholder icons as final evidence. If SVG/PNG resources are missing, record the gap and risk in `docs/progress.md`.

## 5. Manual Smoke Checklist

- [ ] The first screen starts with the goal creation flow, not a large repeated page title.
- [ ] Goal title, deadline, and daily available time are the first three core inputs.
- [ ] Inputs are presented as step cards.
- [ ] Personalized preferences are expanded but visually secondary.
- [ ] Tarot, MBTI, ritual, and daily keywords are not written as task-decision inputs.
- [ ] The generate plan button is the strongest action.
- [ ] The page does not show the task calendar or execute today's task.
- [ ] The page has no repeated large title, pill label, long subtitle, or large empty top area.
- [ ] Out-of-scope code was not modified.

## 6. Passing Evidence Format

Record in `docs/progress.md` or feature evidence:

- modified files,
- visible changes compared with F24,
- reference image comparison result,
- user manual confirmation or screenshot path,
- command results,
- build entry confirmation,
- missing icon resources, if any,
- confirmation that models, services, storage, planner, replanner, AI/tarot, and other Tab page structures were not modified.
