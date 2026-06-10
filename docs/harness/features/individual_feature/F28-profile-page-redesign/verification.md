# F28 Verification

## 1. Required Commands

| Level | Command | Required |
|---|---|---|
| L1 static | `npm.cmd run verify:static` | yes |
| L2 feature | `npm.cmd run test -- user-profile ui-components navigation-shell data-layer` | yes |
| L3 system | `npm.cmd run verify:system` | yes |
| Harness | `npm.cmd run verify:harness` | yes |

## 2. Build Entry Check

The executor must confirm the manual check uses the current build output.

Check:

- `project.config.json.miniprogramRoot`
- `dist/dev/mp-weixin/pages/profile/`
- `dist/build/mp-weixin/pages/profile/`

If WeChat DevTools is not using the current build output, F28 cannot be judged visually.

## 3. Visual Evidence Rule

Reference image:

```text
docs/design/page/reference_image/我的.png
```

Component layout contract:

```text
docs/harness/features/individual_feature/F28-profile-page-redesign/details/component-layout.md
```

F28 cannot pass from automated tests alone. Final evidence must include either:

- user manual confirmation that the profile page is visually close enough to the reference image and follows the component layout, or
- a checkable screenshot path plus notes comparing it with the reference image and component layout.

The comparison must mention:

- user greeting strip,
- current goal / no-goal card,
- default planning preferences card,
- AI expression and ritual preferences card,
- recent progress card,
- settings and management list,
- whether the page still looks like an old entry list.

## 4. Evidence Matrix

| Area | State | Required Evidence |
|---|---|---|
| Profile | Has current goal | Screenshot or manual record |
| Profile | No goal | Screenshot or manual record |
| Profile | Missing preference values | Test result or manual record |
| Profile | Settings entries are UI mock | Screenshot or manual record |
| Profile | AI/tarot/MBTI boundary | Source/test/manual record |

If a state cannot be constructed, record the reason, substitute evidence, and risk level.

## 5. Manual Smoke Checklist

- [ ] The first business focus is current goal when a goal exists.
- [ ] The first business action is create goal when no goal exists.
- [ ] Default planning preferences and AI expression preferences are separated.
- [ ] Tarot, MBTI, and daily keyword are not task-decision inputs.
- [ ] Recent progress is compact and does not outrank current goal.
- [ ] Settings entries are grouped at the bottom.
- [ ] Today, Calendar, and Create TabBar entries are not duplicated as large profile-page shortcuts.
- [ ] Page body has no repeated large title, pill label, long subtitle, or large empty top area.
- [ ] Out-of-scope code was not modified.

## 6. Passing Evidence Format

Record in `docs/progress.md` or feature evidence:

- modified files,
- visible changes compared with F24,
- reference image comparison result,
- component-layout comparison result,
- user manual confirmation or screenshot path,
- command results,
- build entry confirmation,
- unavailable states or data fallbacks,
- confirmation that models, services, storage, planner, replanner, AI/tarot, TabBar routes, and other Tab page structures were not modified.
