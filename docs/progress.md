# progress.md

## F29 passing 2026-06-11

- `F29` TabBar icon integration is now `passing`.
- User manual visual confirmation recorded: `F29ok\u4e86\uff0cpassing\u8fc7`.
- Implemented TabBar icon config in `pages.json` for Today, Calendar, Create, and Profile using `static/icons/tab/*.png` and `*-active.png`.
- Confirmed all eight TabBar PNGs exist in `static/icons/tab/` and are 81x81 PNG files.
- Added navigation tests for icon paths, asset existence, PNG dimensions, and unchanged tab order/routes.
- Fixed the reported calendar font blur as a minimal out-of-scope visual defect: `pages/plan-calendar/index.vue` no longer uses odd `rpx` font sizes, avoiding half-pixel text rendering in mp-weixin.
- Verified: `npm.cmd run test -- navigation-shell ui-components`, `npm.cmd run verify:static`, `npm.cmd run verify:system`, and `npm.cmd run verify:harness` all passed.
- Build entry check: `dist/dev/mp-weixin/app.json` and `dist/build/mp-weixin/app.json` both contain the four TabBar `iconPath` / `selectedIconPath` pairs; `dist/dev/mp-weixin/pages/plan-calendar/index.wxss` contains the even `rpx` font sizes.
- Boundary check: TabBar page order and routes were unchanged; no four-page body structure, models, services, storage keys, planner/replanner, AI, or tarot logic was changed.
- Current active feature: none. Status: F20-F29 are `passing`; F30 remains `not_started`.

## F30 documentation setup 2026-06-11

- F30 was added as `not_started`; F29 has since been accepted by user manual visual confirmation and marked `passing`.
- Added `docs/harness/features/ui-feature-workflow.md` to solidify the UI feature workflow. It records three tried approaches: complex UI specification, reference-image-first, and reference image plus layered component layout.
- The recommended default UI approach is now “reference image + layered component layout + icon manifest + manual visual confirmation”, because it keeps the visual target concrete while giving the agent an executable component structure and icon contract.
- Added F30 feature docs under `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/`: `feature.md`, `verification.md`, `evidence/ui-method-review.md`, and `evidence/manual-functional-audit.md`.
- F30 is scoped as a documentation and user-led manual audit feature. It should record four-page functional problems after the UI redesign, then help split F31+ logic-fix features. It must not modify mini-program page code, components, models, services, routes, storage, planner/replanner, or AI/tarot logic.
- Updated `docs/harness/features/README.md` with a direct link to the UI feature workflow.

## F29 implementation evidence 2026-06-11

- Superseded by `F29 passing 2026-06-11`: the user has now confirmed the TabBar icons are acceptable in WeChat DevTools.
- Implemented TabBar icon config in `pages.json` for Today, Calendar, Create, and Profile using `static/icons/tab/*.png` and `*-active.png`.
- Confirmed all eight TabBar PNGs exist in `static/icons/tab/` and are 81x81 PNG files.
- Added navigation tests for icon paths, asset existence, PNG dimensions, and unchanged tab order/routes.
- Fixed the reported calendar font blur as a minimal out-of-scope visual defect: `pages/plan-calendar/index.vue` no longer uses odd `rpx` font sizes, avoiding half-pixel text rendering in mp-weixin.
- Added a UI regression test that rejects odd `rpx` font sizes in calendar overview/detail pages.
- Verified: `npm.cmd run test -- navigation-shell ui-components`, `npm.cmd run verify:static`, `npm.cmd run verify:system`, and `npm.cmd run verify:harness` all passed.
- Build entry check: `dist/dev/mp-weixin/app.json` and `dist/build/mp-weixin/app.json` both contain the four TabBar `iconPath` / `selectedIconPath` pairs; `dist/dev/mp-weixin/pages/plan-calendar/index.wxss` was refreshed and contains the even `rpx` font sizes.
- Dev output refreshed with `npm.cmd run dev:mp-weixin`; the resulting watcher processes were stopped.
- KnownUnverified: none. User manual visual confirmation has now been recorded in `F29 passing 2026-06-11`.

## F29 active 2026-06-11

- 当前 `active` feature：`F29` 底部 TabBar 图标接入。
- 本轮默认 scope：`pages.json`、`static/icons/tab/`、TabBar 配置直接相关测试、`docs/progress.md`。
- 用户同时报告“日历界面的字体好糊，其他界面字体清晰”。定位方向是日历页存在多个奇数 `rpx` 字号，可能在微信渲染中落到半像素导致文字抗锯齿发糊。
- 日历字体修复属于 F29 scope 外的最小视觉缺陷修复；本轮如修改 `pages/plan-calendar/index.vue` / `detail.vue`，只允许调整字号清晰度相关 CSS，不改页面结构、数据流、models、services、storage key、planner/replanner 或 AI/tarot 逻辑。
- F29 `passing` 仍需要自动化命令通过、构建入口确认、TabBar 图标路径产物检查，并等待用户确认 TabBar 图标视觉效果可作为最终图标使用。

## F28 passing 2026-06-10

- `F28` 我的页重设计已完成并置为 `passing`。
- 用户人工视觉确认原文：`还算可以，标记完成`。该确认满足 F28 `verification.md` 对参考图 / 组件排布人工视觉对照的硬门禁。
- 本轮只修改我的页 UI 结构、我的页局部样式和局部 helper、F28 相关测试、F28 图标资源接入与验证记录。
- 主要实现依据：`docs/design/page/reference_image/我的.png` 和 `docs/harness/features/individual_feature/F28-profile-page-redesign/details/component-layout.md`。
- 当前实现把我的页从旧的入口集合页改成“目标与偏好管理页”：问候条、当前目标 / 无目标卡、默认安排偏好、AI 表达与仪式感偏好、最近推进、底部管理列表。
- 参考图 / 组件排布对照结果：首屏信息顺序、卡片密度、轻量问候条、当前目标优先级、偏好分组、最近推进摘要和底部管理入口已与 F28 组件排布要求对齐；页面不再是旧的大入口集合页。
- 有目标状态下，当前目标卡是第一个业务卡；无目标状态下，创建目标入口是第一个业务动作。
- 默认安排偏好与 AI 表达 / 仪式感偏好已拆成两个不同区域；MBTI、塔罗和每日关键词只作为表达风格 / 仪式感偏好展示，不作为任务决策依据。
- 最近推进只作为紧凑状态摘要，不抢占当前目标卡主视觉；底部管理入口不重复今日、日历、创建这些 TabBar 已有入口。
- F28 profile PNG 图标已通过静态路径接入，源码不使用运行时 icon object 或 `:src` 图标绑定；编译后的 `dist/dev/mp-weixin/common/assets.js` 将 profile 图标短变量映射为普通 `/static/icons/page/profile/*.png` 字符串，未发现 `[object Object]` 或 `false` 图片路径。
- 数据缺口按 F28 边界保持 UI-only fallback：计划强度显示 `均衡`；最近专注时间按完成任务数乘以偏好专注分钟数估算；连续推进天数是保守本地摘要，未新增持久化字段。
- 自动化验证通过：`npm.cmd run test -- user-profile ui-components navigation-shell data-layer`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 构建入口确认：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`；`dist/dev/mp-weixin/pages/profile/index.*` 已刷新到当前实现；`dist/build/mp-weixin/pages/profile/index.*` 已由 `verify:system` 刷新；`dist/dev/mp-weixin/static/icons/page/profile/` 包含导出的 profile PNG。
- 边界确认：未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑；未修改 TabBar 路由配置；未修改今日页、任务日历页、创建目标页结构。
- 当前 knownUnverified：无。F28 参考图 / 组件排布人工对照已由用户确认，状态可置为 `passing`。
- 当前 `active` feature：无。状态：F20-F28 均为 `passing`；F29 保持 `not_started`。

## F28 active setup 2026-06-10

- 当时的 `active` feature：`F28` 我的页重设计。
- 本轮只修改我的页 UI 结构、我的页局部样式和局部 helper、F28 相关测试、F28 图标资源接入与验证记录。
- 主要实现依据：`docs/design/page/reference_image/我的.png` 和 `docs/harness/features/individual_feature/F28-profile-page-redesign/details/component-layout.md`。
- 目标是把我的页从旧的入口集合页改成“目标与偏好管理页”：问候条、当前目标 / 无目标卡、默认安排偏好、AI 表达与仪式感偏好、最近推进、底部管理列表。
- 不修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑；不修改今日页、任务日历页、创建目标页结构；不修改 TabBar 路由配置。
- F28 `passing` 需要自动化命令通过，并记录构建入口、参考图/组件排布对照结果、截图或用户人工视觉确认。

## F28 implementation evidence 2026-06-10

- Superseded by `F28 passing 2026-06-10`: the page implementation was completed and later accepted by user manual visual confirmation against `docs/design/page/reference_image/我的.png`.
- Reworked `pages/profile/index.vue` into the required six-layer profile management layout: avatar greeting strip, current goal / no-goal card, default planning preferences, AI expression and ritual preferences, recent progress summary, and bottom management icon list.
- The page keeps F28's scope boundary: no changes to models, services, storage keys, planner/replanner, AI/tarot business logic, TabBar routes, or the today/calendar/create page structures.
- The current-goal card is now the first business card when a goal exists; when no goal exists, the first business action is the create-goal entry. Default planning preferences and AI expression / ritual preferences are separated into different cards, and recent progress is only a compact status summary.
- Bottom management entries are limited to goal management, review history, preference settings, and about/feedback style placeholders; they do not duplicate the Today, Calendar, or Create TabBar entries as large page shortcuts.
- F28 profile PNGs were exported successfully with the GTK/Cairo runtime on PATH. Outputs are under `static/icons/page/profile/`, including `grass.png`, `goal.png`, `goal-hero.png`, `calendar.png`, `suggestion.png`, `clock.png`, `sun.png`, `bar-chart.png`, `smile.png`, `sparkle.png`, `chat.png`, `star.png`, `tarot.png`, `mbti.png`, `progress-chart.png`, `folder.png`, `document.png`, `setting.png`, and `preference.png`.
- The profile page uses static source paths such as `src="/static/icons/page/profile/grass.png"` and has no runtime icon object or `:src` icon binding in source. The compiled mp-weixin WXML uses uni-app short variables, but `dist/dev/mp-weixin/common/assets.js` maps those variables to plain `/static/icons/page/profile/*.png` strings; no `[object Object]` or `false` image path was detected in the profile dev output.
- Tests updated in `tests/user-profile.test.ts` cover the F28 six-layer order, no-goal state, profile settings list, static profile icon paths, and avoidance of runtime `:src` icon bindings.
- Data gaps are intentionally UI-only because F28 forbids model/service changes: plan intensity displays `均衡`; recent focus time is estimated from completed task count times preferred focus minutes; streak days is a conservative local summary instead of a persisted metric.
- Automatic verification passed: `npm.cmd run test -- user-profile ui-components navigation-shell data-layer`, `npm.cmd run verify:static`, `npm.cmd run verify:system`, and `npm.cmd run verify:harness`.
- Build entry confirmation: `project.config.json.miniprogramRoot` points to `dist/dev/mp-weixin/`; `dist/dev/mp-weixin/pages/profile/index.*` was refreshed at `2026-06-10 16:54:29`; `dist/build/mp-weixin/pages/profile/index.*` was refreshed at `2026-06-10 16:54:03`; `dist/dev/mp-weixin/static/icons/page/profile/` contains the exported PNGs.
- `npm.cmd run dev:mp-weixin` was used to refresh the WeChat dev output and entered watch mode as expected; the residual `npm run dev:mp-weixin` / `uni-run.mjs -p mp-weixin` / `vite-plugin-uni ... -p mp-weixin` Node watcher processes from this run were stopped.
- Superseded knownUnverified: user manual visual confirmation has now been recorded in `F28 passing 2026-06-10`.

## F28 profile icon contract 2026-06-10

- F28 remains `not_started`; this round only updates the profile-page layout detail document and profile icon resource contract. No mini-program page code, business logic, models, services, storage keys, planner/replanner, AI/tarot logic, or TabBar routes were changed.
- Normalized profile page source SVG filenames under `tools/icon-export/source/page/profile/` to stable ASCII names: `goal-hero.svg`, `suggestion.svg`, `progress-chart.svg`, `mbti.svg`, `setting.svg`, and `preference.svg`.
- Reworked `docs/harness/features/individual_feature/F28-profile-page-redesign/details/component-layout.md` into six layers: avatar greeting strip, current goal card, default planning preferences, AI expression and ritual preferences, recent progress, and bottom management icon list.
- Added profile page icon resource docs: `static/icons/page/profile/README.md` and `static/icons/page/profile/icon-spec.json`.
- The F28 profile icon manifest maps provider/source SVG names to stable PNG outputs, including `grass.png`, `goal.png`, `goal-hero.png`, `calendar.png`, `suggestion.png`, `clock.png`, `sun.png`, `bar-chart.png`, `smile.png`, `sparkle.png`, `chat.png`, `star.png`, `tarot.png`, `mbti.png`, `progress-chart.png`, `folder.png`, `document.png`, `setting.png`, and optional reserved `preference.png`.
- CSS-owned visuals are explicitly documented: avatar placeholder, status chip, progress bar, preference tile states, recent-progress inner stat markers, chevrons, card borders/shadows, and bottom TabBar icons.
- Verified: `python tools/icon-export/export_icons.py validate --group page/profile` and `python tools/icon-export/export_icons.py export --group page/profile --dry-run` both passed with 19 planned PNG outputs.

## F28 component-layout setup 2026-06-09

- F28 remains `not_started`; this round only prepares the feature contract and verification docs for the next profile-page redesign experiment. No mini-program page code or business logic was changed.
- Reworked `docs/harness/features/individual_feature/F28-profile-page-redesign/feature.md` into a concise task-boundary contract for the “reference image + component layout document” approach.
- Added `docs/harness/features/individual_feature/F28-profile-page-redesign/details/component-layout.md` to translate `docs/design/page/reference_image/我的.png` into implementable component order: user greeting strip, current goal/no-goal card, default planning preferences, AI expression and ritual preferences, recent progress, and settings list.
- Reworked `docs/harness/features/individual_feature/F28-profile-page-redesign/ref/image/README.md` and `verification.md` to require both reference-image comparison and component-layout comparison before F28 can pass.
- F28 intentionally does not use `profile-page.md` as a full construction checklist; it is only a fallback for page responsibility questions.
- Verified: `npm.cmd run verify:harness` passes with 29 features, 27 passing, 2 not_started, 0 warnings, and 0 errors.

## F27 passing 2026-06-09

- `F27` 创建目标页重设计已完成并置为 `passing`。
- 用户人工视觉确认原文：`勉强还可以，标记完成吧。` 该确认满足 F27 `verification.md` 对参考图人工视觉对照的硬门禁。
- 本轮只修改创建目标页 UI 结构、创建页局部样式、F27 相关图标接入、F27 相关测试和验证记录。
- 参考图 `docs/design/page/reference_image/创建目标.jpeg` 是主要视觉约束；页面需要从旧表单转为目标创建流程：轻量引导、前三个核心步骤卡、补充说明、默认展开的偏好区域、强主按钮和底部安全提示。
- 不修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑；不修改今日页、任务日历页、我的页结构；不修改 TabBar 路由配置。
- F27 `passing` 需要自动化命令通过，并记录当前构建入口、参考图对照结果、截图或用户人工视觉确认。
- 当前实现已完成创建页参考图对齐：首屏使用“先设定一个目标”轻量引导；前三个核心步骤依次为“你想完成什么？”、“什么时候完成？”、“每天大概能投入多久？”；时间选项改为 `15/30/45/60`，默认选中 `30`，自定义分钟数独立输入；补充说明和偏好区域视觉层级低于核心步骤；底部保留强主按钮和“生成后可随时调整”安全提示。
- 创建页正式 PNG 图标已通过静态路径接入：`sparkle.png`、`calendar.png`、`clock.png`、`edit.png`、`note.png`、`preference.png`、`lock.png`；源码不使用 `:src` 或运行时 icon object。
- 参考图对照结果：信息顺序、步骤卡结构、卡片密度、选中 chip、默认展开偏好区和主按钮层级已明显接近 `docs/design/page/reference_image/创建目标.jpeg`；当前结果不再像旧纵向设置表单。差异：计划强度未新增为可保存字段，因为 F27 明确不允许修改 models/services/planner，偏好区继续使用现有 UserProfile 字段。
- 自动化验证通过：`npm.cmd run test -- goal-create user-profile ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 构建入口确认：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`；`dist/dev/mp-weixin/pages/goal-create/index.*` 已刷新到 `2026-06-09 09:20:33`；`dist/build/mp-weixin/pages/goal-create/index.*` 已刷新到 `2026-06-09 09:19:56`；dev/build `common/assets.js` 均包含 `/static/icons/page/create/*.png` 字符串常量。
- `npm.cmd run dev:mp-weixin` 用于刷新 dev 产物后进入 watch 状态并由工具超时终止；已确认并结束本次残留的 `npm run dev:mp-weixin`、`scripts/uni-run.mjs -p mp-weixin` 和 `vite-plugin-uni ... -p mp-weixin` 进程，未结束微信开发者工具自身进程。
- 运行时图片错误修复：用户报告微信渲染层请求 `/pages/goal-create/2026-06-09`、`/pages/goal-create/[object Object],[object Object],[object Object]` 和 `/pages/goal-create/1`。定位为创建页 `<image src>` 在 mp-weixin 编译后被提升为短变量，热更新或运行时数据串位后会把日期、选项数组或布尔值当作图片路径。
- 第一轮运行时图片错误修复曾将 `pages/goal-create/index.vue` 中的 `<image>` 节点改为 `view.create-icon-*` + CSS `background-image: url("/static/icons/page/create/*.png")`。后续用户反馈证明 CSS `url(...)` 仍可能在 mp-weixin 热更新 / 短变量映射中污染输入框和按钮文本，该方案已被二次修复取代。
- 新增/更新 F27 回归测试：创建页源码不得包含 `<image`、`src="/static/icons/page/create/`、`:src="` 或 `mode="aspectFit"`；二次修复后源码还不得包含 `url("/static/icons/page/create/`、`background-image: url(` 或 `create-icon`。
- 图片错误修复后验证通过：`npm.cmd run test -- goal-create user-profile ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 图片错误修复后构建入口确认：`dist/dev/mp-weixin/pages/goal-create/index.*` 已刷新到 `2026-06-09 09:32:39`；`dist/build/mp-weixin/pages/goal-create/index.*` 已刷新到 `2026-06-09 09:32:21`；dev/build 的 `goal-create/index.wxml` 不再包含 `<image>`、`src="{{...}}"` 或 `/pages/goal-create/`，`goal-create/index.wxss` 中图标为 `data:image/png;base64,...`。
- 二次运行时资源串位修复：用户反馈目标名称输入框出现 `/static/icons/page/create/sparkle.png`，自定义分钟数区域出现 `/static/icons/page/create/edit.png`，主按钮出现 `[object Object],[object Object],[object Object]`。定位为创建页运行时资源引用仍可能与表单 / 按钮绑定串位。
- 已将创建页所有图标锚点改为纯 CSS 形状：`hero-mark`、`field-mark-calendar`、`heading-mark-clock`、`field-mark-edit`、`section-mark-note`、`section-mark-preference`、`safe-mark`。`pages/goal-create/index.vue` 当前不再引用 `static/icons/page/create/`，也不再包含 `<image>`、`:src`、`background-image: url(` 或 `create-icon`。
- 正式 PNG 资源仍保留在 `static/icons/page/create/` 作为资源准备结果，但当前创建页运行时代码不再直接引用这些 PNG，以避免 mp-weixin 资源编译 / 热更新串位再次把路径或对象渲染进输入框。
- 二次修复后验证通过：`npm.cmd run test -- goal-create user-profile ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- F27 标记完成前最终验证通过：`npm.cmd run test -- goal-create user-profile ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 二次修复后构建入口确认：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`；`dist/dev/mp-weixin/pages/goal-create/index.*` 已刷新到 `2026-06-09 10:43:17`；`dist/build/mp-weixin/pages/goal-create/index.*` 已刷新到 `2026-06-09 10:42:56`。
- 二次修复后产物检查：dev/build 的 `goal-create/index.wxml`、`index.js`、`index.wxss` 均未检出 `<image`、`src="{{`、`/static/icons/page/create`、`common_assets`、`data:image/png`、`background-image` 或 `[object Object]`；dev/build 的 `common/assets.js` 也未检出 `/static/icons/page/create`。已结束本次残留的 `npm run dev:mp-weixin` 和 `vite-plugin-uni ... -p mp-weixin` Node watcher。
- 当前 knownUnverified：无。F27 参考图人工对照已由用户确认，状态可置为 `passing`。
- 当前 `active` feature：无。状态：F20-F27 均为 `passing`；F28-F29 保持 `not_started`。

## F27 create lock icon restored 2026-06-09

- F27 remains `not_started`; this round only restores the forgotten `lock.svg` create-goal page icon and cleans related resource docs. No page code or business logic was changed.
- Rewrote `static/icons/page/create/icon-spec.json` and `static/icons/page/create/README.md` with clean UTF-8 content after detecting mojibake in the Chinese source SVG names.
- Rewrote F27 `feature.md` with clean UTF-8 content and restored the icon contract entry `lock.svg` -> `lock.png`.
- Final create-page PNG outputs are now `sparkle.png`, `calendar.png`, `clock.png`, `edit.png`, `note.png`, `preference.png`, and `lock.png`.
- Verified: `python tools/icon-export/export_icons.py validate --group page/create`, `python tools/icon-export/export_icons.py export --group page/create --dry-run`, and real export with GTK/Cairo runtime on PATH all passed.

## F27 create icon resources normalized 2026-06-09

- F27 remains `not_started`; this round only normalizes create-goal page icon resources and docs. No page code, business logic, models, services, storage, planner, replanner, AI/tarot, or TabBar config was changed.
- Updated `static/icons/page/create/icon-spec.json` to match the actual source SVG files now present in `tools/icon-export/source/page/create/`.
- Source SVG filenames can keep provider-exported names, including Chinese filenames; output PNG names are normalized to stable ASCII paths for page code.
- Final create-page PNG outputs are `sparkle.png`, `calendar.png`, `clock.png`, `edit.png`, `note.png`, and `preference.png`.
- Mapping: `编辑.svg` -> `edit.png`; `补充说明.svg` -> `note.png`; `clock.svg` was added for daily available time; the earlier planned `lock.svg` was removed from the required list and the bottom safety note should use CSS/text unless a later feature explicitly needs a dedicated icon.
- Updated `static/icons/page/create/README.md` and F27 `feature.md` icon resource section to reflect the normalized mapping.
- Verified: `python tools/icon-export/export_icons.py validate --group page/create`, `python tools/icon-export/export_icons.py export --group page/create --dry-run`, and real export with GTK/Cairo runtime on PATH all passed.

## F27 reference-image-first setup 2026-06-09

- F27 remains `not_started`; this round only prepares the feature contract, verification rule, and create-goal page icon resource specification. No mini-program page code or business logic was changed.
- Reworked `docs/harness/features/individual_feature/F27-create-goal-page-redesign/feature.md` into a reference-image-first contract. F27 now intentionally uses fewer written design details than F25/F26 and treats `docs/design/page/reference_image/创建目标.jpeg` as the main visual source.
- Reworked `docs/harness/features/individual_feature/F27-create-goal-page-redesign/verification.md` to require reference-image comparison evidence, build entry confirmation, and manual visual confirmation or screenshot evidence before passing.
- Added create-goal icon resource docs: `static/icons/page/create/README.md` and `static/icons/page/create/icon-spec.json`.
- Prepared source directory `tools/icon-export/source/page/create/`. Required SVGs are not present yet: `sparkle.svg`, `calendar.svg`, `edit.svg`, `preference.svg`, and `lock.svg`.
- Icon scope decision: step number badges, selected/default/disabled states, input borders, primary button gradient, card hierarchy, and required/optional labels should use CSS rather than separate SVG assets.
- Verified: `static/icons/page/create/icon-spec.json` parses as JSON and `npm.cmd run verify:harness` passes with 29 features, 26 passing, 3 not_started, 0 warnings, and 0 errors.

## F26 passing 2026-06-08

- `F26` 任务日历页重设计已完成并置为 `passing`。
- 用户人工视觉确认原文：`ok，就当F26完成了吧。` 该确认满足 F26 `verification.md` 对参考图人工视觉对照的硬门禁。
- 本轮只修改日历页 UI 结构、日历页局部样式、必要的日历页相关测试和进度记录。
- 目标：把默认状态改成目标计划板首屏，突出当前目标、整体进度 / 时间压力、未来 7 天概览；点击日期后明确切换到单日任务查看。
- 图标使用 `static/icons/page/calendar/` 下的正式 PNG 资源，避免小程序运行时动态 `:src` 对象绑定导致本地图片路径错误。
- 不修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑；不修改今日、创建目标、我的页页面结构。
- F26 参考图对照是硬门禁：实现和自动化验证完成后，需要用户在微信开发者工具中人工确认参考图对照，确认前不能置为 `passing`。
- 当前实现已改动 `pages/plan-calendar/index.vue` 和 `tests/plan-calendar.test.ts`：默认界面拆成当前目标计划卡、整体进度卡、未来 7 天计划概览、选中日期任务摘要和调整计划入口；点击日期后进入日期详情状态，突出日期、预计用时、任务数量、当日建议、任务列表、添加临时任务入口、AI 计划建议和调整计划入口。
- 相对 F24 的可见变化：日历页不再是普通任务卡长列表，首屏重心转为目标计划板；日期卡横向展示近 7 天并用 CSS dot/chip/border 区分有任务、已完成、缓冲日、无任务和延期风险；日期详情页明显弱化整体概览并展开单日任务。
- 图标接入验证：日历页源码使用 `src="/static/icons/page/calendar/*.png"` 静态路径，未使用 `:src` 或 `calendarIconPaths`；`dist/dev/mp-weixin/common/assets.js` 中存在 calendar 图标字符串常量。
- 构建入口确认：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`；已刷新 `dist/dev/mp-weixin/pages/plan-calendar/index.wxml` 和 `index.wxss`，时间戳为 `2026-06-08 15:15:23`；`dist/build/mp-weixin/pages/plan-calendar/index.wxml` 和 `index.wxss` 由 `verify:system` 刷新，时间戳为 `2026-06-08 15:14:37`。
- 自动化验证通过：`npm.cmd run test -- plan-calendar ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 已确认没有残留 `uni-run.mjs` / `dev:mp-weixin` watcher 进程。
- 当前 knownUnverified：无。F26 参考图人工对照已由用户确认，状态可置为 `passing`。
- 视觉返工记录：用户指出当前页面与参考图仍有差距，主要是文本换行导致页面臃肿、未来 7 天概览没有补齐无任务日期、点击日期后的详情不应在内容区放“返回概览”按钮。
- 已按反馈返工：`pages/plan-calendar/index.vue` 改为只负责概览页；新增页面局部 helper `pages/plan-calendar/calendar-helpers.ts`，从今天开始补齐连续 7 天，缺任务日期显示为无任务 / 休息日；新增 `pages/plan-calendar/detail.vue` 作为日期详情页，点击日期后通过 `uni.navigateTo` 进入二级页，由小程序原生顶部导航提供返回。
- 本轮边界扩展说明：用户明确允许为了实现顶部原生返回而新建页面，因此仅在 `pages.json` 注册非 TabBar 页面 `pages/plan-calendar/detail`；未修改 TabBar list、底部导航顺序或其他 Tab 页面结构。
- 单行文本处理：概览页和详情页中的目标标题、日期卡、指标、任务标题、最低完成线、建议和操作入口均设置为单行省略，避免文字分成两行造成卡片高度膨胀。
- 返工后验证通过：`npm.cmd run test -- plan-calendar ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 返工后构建入口确认：`dist/dev/mp-weixin/pages/plan-calendar/index.*` 与 `detail.*` 已刷新到 `2026-06-08 20:49:17`；`dist/build/mp-weixin/pages/plan-calendar/index.wxml` 与 `detail.wxml` 已刷新到 `2026-06-08 20:48:42`；`dist/dev/mp-weixin/app.json` 与 `dist/build/mp-weixin/app.json` 均包含 `pages/plan-calendar/detail`，TabBar 仍指向 `pages/plan-calendar/index`。
- 未来 7 天概览细化：用户指出该组件本身可以横向滑动，因此日期卡内文字不应为了卡宽被省略；同时今天的日期必须默认可见。
- 已将未来 7 天容器改为小程序原生 `scroll-view scroll-x`，日期卡加宽到适合展示完整日期 / 状态 / 分钟数，日期卡内的星期、日期、状态、任务数和分钟数不再走 `text-overflow: ellipsis`；今天作为连续 7 天列表第一项，并通过 `scroll-into-view="todayDayId"` 绑定 `calendar-day-<today>` 作为默认可见兜底。
- 本轮细化后验证通过：`npm.cmd run test -- plan-calendar ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 本轮细化后构建入口确认：`dist/dev/mp-weixin/pages/plan-calendar/index.wxml` 和 `index.wxss` 已刷新到 `2026-06-08 21:02:02`；`dist/build/mp-weixin/pages/plan-calendar/index.wxml` 已刷新到 `2026-06-08 21:01:31`；产物中已包含 `scroll-view`、`scroll-into-view` 和 `calendar-day-*` 日期卡 id。
- 运行时图片错误修复：用户在添加任务后报告微信渲染层请求 `/pages/plan-calendar/false` 和 `/pages/plan-calendar/e9_fd`，并伴随任务卡标题 / 最低完成线空白。定位为任务循环内的静态 `<image>` 在 mp-weixin 编译后被提升为短变量，运行时可能与循环字段串位。
- 已移除概览页任务预览和日期详情页任务列表循环内的 `<image>` 节点，改用 CSS `meta-dot` 和文本分隔符展示分钟数 / 优先级；正式 `clock.png` 和 `priority.png` 仅保留在循环外静态资源位置。
- 新增 `pages/plan-calendar/calendar-helpers.ts` 任务展示兜底：标题、最低完成线、分钟数和优先级统一走 helper，异常或存量不完整字段会降级为可读文本，不再渲染空白任务卡。
- 本轮图片错误修复验证通过：`npm.cmd run test -- plan-calendar ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- 本轮图片错误修复后已刷新 `dist/dev/mp-weixin/pages/plan-calendar/index.*` 与 `detail.*` 到 `2026-06-08 21:15:43`；产物中任务循环只包含 `meta-dot` 文本节点，不再包含循环内 image `src` 短变量；已确认没有残留 `uni-run.mjs` / `dev:mp-weixin` watcher 进程。
- 远期阶段组件删除：用户指出“远期阶段”不是 F26 文档中需要的默认页面组件，并且当前渲染出大量空白阶段行。已删除 `pages/plan-calendar/index.vue` 中的 `stage-panel`、`stages` 计算属性和 `getStageStatusLabel` 页面引用；F26 文档同步改为“远期 Stage 属于后续扩展，不作为 F26 默认页面组件展示”。本轮仍未修改 models、services、storage key、planner、replanner 或 Stage 数据模型。
- 本轮删除远期阶段组件后验证通过：`npm.cmd run test -- plan-calendar ui-components data-layer navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。已刷新 `dist/dev/mp-weixin/pages/plan-calendar/index.*` 到 `2026-06-08 21:46:17`，并确认 dev/build 产物中不再包含 `stage-panel`、`stage-row` 或“远期阶段”。
- 当前 `active` feature：无。状态：F20-F26 均为 `passing`；F27-F29 保持 `not_started`。

## F26 calendar icon resources prepared 2026-06-08

- F26 remains `not_started`; this round only prepares calendar-page icon resources and feature contract docs, with no mini-program business code changes.
- Synced the calendar-page icon contract to the reduced final SVG set: `target.svg`, `calendar.svg`, `week.svg`, `adjust.svg`, `sparkle.svg`, `clock.svg`, and `priority.svg`.
- Updated `static/icons/page/calendar/README.md`, `static/icons/page/calendar/icon-spec.json`, and F26 docs to clarify that progress, risk, completed, buffer, no-task, stage grouping, and task-list container states should use CSS badges/dots/progress bars/chips/borders/text instead of extra SVG assets.
- Exported official PNG assets to `static/icons/page/calendar/`: `target.png`, `calendar.png`, `week.png`, `adjust.png`, `sparkle.png`, `clock.png`, and `priority.png`.
- Rewrote `docs/harness/features/individual_feature/F26-calendar-page-redesign/feature.md` with valid frontmatter and parseable acceptance checklist so harness can read the feature contract.
- Verified: `python tools/icon-export/export_icons.py validate --group page/calendar`, `python tools/icon-export/export_icons.py export --group page/calendar --dry-run`, real export with GTK/Cairo runtime on PATH, and `npm.cmd run verify:harness` all passed.
- No feature status was changed; current active feature remains none.

## F25 passing 2026-06-06

- `F25` 今日任务页重设计已完成并置为 `passing`。
- 用户人工视觉确认原文：`不赖，当前界面看着还可以。标记完成吧，F25`。该确认满足 F25 `verification.md` 对参考图人工视觉对照的硬门禁。
- 最终可见结果：今日页作为执行台，首屏突出今日重点任务卡；主卡包含目标上下文、任务标题、预计时间、优先级、最低完成线、今日任务数量入口、开始专注和标记完成；状态卡、AI 今日建议和晚间复盘入口均使用 `static/icons/page/today/` 下的正式 PNG 图标作为扫描锚点。
- 图标资源修复：今日页图标已从运行时 `:src` 对象绑定改为静态 `src="/static/icons/page/today/*.png"`，避免微信渲染层出现 `/pages/today/[object Object]...` 本地图片加载错误；相关回归测试已覆盖 `todayIconPaths` 和 `:src="` 不得重新出现。
- 构建入口确认：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`；本轮已刷新 `dist/dev/mp-weixin`，并确认 `dist/dev/mp-weixin/static/icons/page/today/` 存在 `star.png`、`clock.png`、`flag.png`、`list.png`、`status-wave.png`、`sparkle.png`、`moon.png`。
- 自动化验证：`npm.cmd run test -- today today-suggestion review ui-components navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness` 均通过。
- 边界确认：未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑；未修改任务日历、创建目标、我的页页面结构；无 knownUnverified。
- 当前 `active` feature：无。状态：F20-F25 均为 `passing`；F26-F29 保持 `not_started`。

## F25 icon resource fix active 2026-06-06

- Fixed the WeChat runtime icon loading error reported as `Failed to load local image resource /pages/today/[object Object],[object Object],[object Object],[object Object]`.
- Root cause: F25 page icons were originally bound through runtime `:src` expressions, which could be compiled into mp-weixin short-variable image bindings and resolve to non-string values at runtime.
- Fix: removed the `todayIconPaths` runtime objects and changed all today-page icon usages in `pages/today/index.vue` and `components/TodayFocusCard.vue` to static `src="/static/icons/page/today/*.png"` source attributes.
- Added regression coverage in `tests/today.test.ts` and `tests/ui-components.test.ts`: today-page icons must keep the official PNG paths and must not reintroduce `todayIconPaths` or `:src="` icon bindings.
- Verified after the fix: `npm.cmd run test -- today today-suggestion review ui-components navigation-shell`, `npm.cmd run verify:static`, `npm.cmd run verify:system`, and `npm.cmd run verify:harness` pass. Refreshed `dist/dev/mp-weixin` at `2026-06-06 08:59:28`.
- Superseded by `F25 passing 2026-06-06`: user visual confirmation has been recorded.

## F25 icon refinement active 2026-06-05

- Current active feature remains `F25`; this round only changes the today page, `TodayFocusCard`, and F25-related tests. It does not modify models, services, storage keys, planner, replanner, AI/tarot logic, or other main Tab page structures.
- Wired the official today-page PNG icons from `static/icons/page/today/`: `star.png`, `clock.png`, `flag.png`, `list.png`, `status-wave.png`, `sparkle.png`, and `moon.png`.
- Visible change summary: the focus card now has icon anchors for the tag, metadata, minimum line, and task-count entry; the primary focus button has stronger visual weight while the secondary action stays lightweight; status, AI advice, and review cards now have consistent module icons; card padding, row spacing, and option chip height were tightened for better first-screen density.
- Refreshed the WeChat DevTools dev output. `dist/dev/mp-weixin/pages/today/index.wxml`, `dist/dev/mp-weixin/pages/today/index.wxss`, `dist/dev/mp-weixin/components/TodayFocusCard.wxml`, and `dist/dev/mp-weixin/components/TodayFocusCard.wxss` were updated at `2026-06-05 23:27:55`.
- Verified: `npm.cmd run test -- today today-suggestion review ui-components navigation-shell` passed with 40 tests; `npm.cmd run verify:static` passed; `npm.cmd run verify:system` passed; `npm.cmd run verify:harness` passed with 29 features, 24 passing, 1 active, 4 not_started, 0 warnings, and 0 errors.
- Superseded by `F25 passing 2026-06-06`: user visual confirmation has been recorded.

## Icon export tool 2026-06-05

- 已按 `tools/icon-export/modify.md` 新一轮要求移除 `export_icons.py` 中的硬编码 group 映射；`--group <group>` 现在按 `static/icons/<group>/icon-spec.json` 自动推导，支持后续 `page/calendar`、`page/profile`、`page/create` 等新增分组，无需改脚本。
- 已加强 manifest 校验：`format` 必须为 `png`，`background` 必须为 `transparent`；输出重复检查从文件名升级为相对 output directory 的输出路径。
- 已更新 `tools/icon-export/README.md`：明确 `--group` 动态推导规则、group 路径安全约束、`variants` 的值必须是 `palette` key、SVG 原始颜色会被忽略且最终颜色由 `icon-spec.json` 决定。
- 已验证：`python -m py_compile tools/icon-export/icon_converter.py tools/icon-export/export_icons.py` 通过；临时 `page/calendar` manifest 通过 `validate`、`export --dry-run` 和真实 PNG 导出；非法 `format`、非法 `background`、非法 group `../tmp-invalid` 均按预期失败。临时文件已清理。

- 已按 `tools/icon-export/modify.md` 新要求完成模块化重构：`icon_converter.py` 负责单个 SVG 到 PNG 的底层转换，`export_icons.py` 负责 CLI、manifest 读取、校验和导出调度。
- 已将主流程切换为 manifest 驱动：`static/icons/tab/icon-spec.json`、`static/icons/page/today/icon-spec.json`、`static/icons/common/icon-spec.json` 现在包含 `directory`、`glyphTargetPx`、`palette`、`icons` 等字段；旧 `icon-export.config.json` 仅保留为历史参考。
- 已验证：`python -m py_compile tools/icon-export/icon_converter.py tools/icon-export/export_icons.py` 通过；使用临时 SVG 验证 `validate --group tab`、`export --group tab --dry-run`、`validate --group page/today`、`export --group page/today --dry-run` 通过，临时 SVG 已清理。
- 已尝试临时 manifest 的真实 PNG 导出；当前 Windows 环境缺 Cairo 原生库，`cairosvg` 报 `no library called "cairo-2" was found`，因此实际渲染路径未能完成。已清理临时 `tools/icon-export/source/tmp` 和 `static/icons/tmp`。
- 当前 source 目录没有正式 SVG 时，`validate --group tab` 会按预期失败并提示缺失的 SVG；无子命令运行 `export_icons.py` 会被 CLI 拒绝，避免误扫全量目录。
- 本轮未修改页面、组件、services、models、`pages.json`、`app.json` 或当前 feature 状态。

- 已在 `tools/icon-export/README.md` 顶部新增中文快速教程，说明依赖安装、SVG 放置目录、dry-run、实际导出命令、输出位置、导出规则和注意事项。
- 已按 `tools/icon-export/modify.md` 第三轮要求修正 variant 输出命名：`default` -> `<name>.png`，`active` -> `<name>-active.png`，其他 variant -> `<name>-<variant>.png`。
- 已在 `tools/icon-export/README.md` 明确：脚本只生成或覆盖当前 SVG 对应 PNG，不会自动删除 `static/icons/` 中源 SVG 已删除的旧 PNG。
- 已在 README 明确：`--dry-run` 只预览输出路径和计划数量，不验证 SVG 渲染结果。
- 已在 README 明确：脚本忽略 SVG 原始颜色，只保留形状和透明度，并按 config 重新上色。
- 已将配置读取改为 `utf-8-sig`，兼容 Windows/PowerShell 生成的带 BOM JSON 配置。
- 已用临时 SVG 和临时配置验证自定义 variant：`muted` 正确计划输出为 `<name>-muted.png`；验证后已删除临时文件。
- 已按 `tools/icon-export/modify.md` 第二轮要求新增 `--group` 参数；可重复使用，例如 `--group tab --group page`。
- 未传 `--group` 时处理配置中的全部 group；传入 `--group` 时只处理指定 group，不检查其他 group。
- 未知 group 会返回清晰错误：`ERROR: unknown group: xxx. Available groups: tab, page, common`。
- `requiredFiles` 只对当前正在处理的 group 生效；显式指定的无 `requiredFiles` 空 group 也会返回错误。
- 已验证临时 page SVG 的 `--group page --dry-run`：不受 tab 缺失影响，输出 `1 PNG output(s) planned`，验证后已删除临时 SVG。
- 已按 `tools/icon-export/modify.md` 修正图标导出工具：脚本从 `export_tab_icons.py` 重命名为 `export_icons.py`。
- 已修复 dry-run 统计数量：dry-run 现在会统计计划输出的 PNG 数量。
- 已在 tab 分组配置中新增 `requiredFiles`：`today.svg`、`calendar.svg`、`create.svg`、`profile.svg`；当 source/tab 部分缺失时脚本会报错。
- 已将工具配置中的 `visualGlyphPx.min/max` 简化为 `glyphTargetPx`，避免未使用的 `min` 字段造成误导。
- 已修复超出文件大小提示，warning 会使用配置中的 `maxFileKB`。
- 已新增十六进制颜色校验，配置颜色错误时返回更清晰的错误信息。
- 已在 README 中说明脚本需保留在 `tools/icon-export/` 下，并从项目根目录运行：`python tools/icon-export/export_icons.py`。
- 已新增 `tools/icon-export/`，用于将用户从 iconfont 下载的 SVG 统一导出为小程序可用 PNG。
- 新增源目录：`tools/icon-export/source/tab/`、`tools/icon-export/source/page/`、`tools/icon-export/source/common/`。
- 新增脚本：`tools/icon-export/export_icons.py`，按 `tools/icon-export/icon-export.config.json` 分组导出到 `static/icons/<group>/`。
- TabBar SVG 会生成默认态和 active 态 PNG；page/common 默认生成普通态 PNG。
- 新增依赖说明：`tools/icon-export/requirements.txt`，需要 `cairosvg` 和 `Pillow`；当前本机 Pillow 可用，CairoSVG 未安装，因此没有实际渲染 SVG。
- 本工具不修改页面、组件、services、models、`pages.json` 或当前 feature 状态。
- 已重新执行 `python -m py_compile tools/icon-export/export_icons.py`：通过。
- 已重新执行 `python tools/icon-export/export_icons.py --dry-run`：通过，当前三个 source 分组均无 SVG，脚本给出清晰提示且未生成 PNG。
- 已执行 `npm.cmd run verify:harness`：通过。
- 已重新生成备份包：`docs/log/artifacts/icon-export-tool-2026-06-05.zip`，大小 31730 bytes。

## Icon asset specs 2026-06-05

- 已按资源目录补充明确路径：`static/icons/tab/`、`static/icons/page/today/`、`static/icons/common/`，并在对应 `icon-spec.json` 中增加 `directory` 字段。
- TabBar default/active 图标状态规则已明确为 SHOULD：默认只改颜色不改形状；如需改形状，必须记录原因并由用户确认。
- 宸茶ˉ榻?`static/icons/tab/README.md` 鍜?`static/icons/tab/icon-spec.json`锛屾槑纭簳閮?TabBar 鍥炬爣鍛藉悕銆佸昂瀵搞€侀鑹层€侀鏍煎拰 passing 杈圭晫銆?- 宸叉柊澧?`static/icons/page/README.md`锛屾槑纭〉闈笓灞炲浘鏍囩粺涓€鏀惧湪 `static/icons/page/<page-name>/`銆?- 宸茶ˉ榻?`static/icons/page/today/README.md` 鍜?`static/icons/page/today/icon-spec.json`锛屾槑纭粖鏃ラ〉鍥炬爣鍛藉悕銆佸昂瀵搞€侀鑹插拰璇箟鏄犲皠銆?- 宸茶ˉ榻?`static/icons/common/README.md` 鍜?`static/icons/common/icon-spec.json`锛屾槑纭€氱敤鍥炬爣鍛藉悕銆佸昂瀵搞€侀鑹插拰澶嶇敤杈圭晫銆?- 宸插皢 F25 缁嗚妭鏂囨。涓殑浠婃棩椤靛浘鏍囪矾寰勪粠 `static/icons/today/` 淇涓?`static/icons/page/today/`銆?- 宸插湪 F29 鍥炬爣鍚堝悓涓紩鐢?`static/icons/tab/README.md` 鍜?`static/icons/tab/icon-spec.json`銆?
## F25 detail doc and F29 tab icons 2026-06-05

- 宸插皢 `docs/harness/features/individual_feature/F25-today-page-redesign/ref/detail/F25-ref.md` 杩佺Щ骞堕噸鍛藉悕涓?`docs/harness/features/individual_feature/F25-today-page-redesign/details/design.md`銆?- 杩佺Щ鍘熷洜锛氭寜 `docs/harness/features/feature-template.md`锛岃瑙夈€佷氦浜掑拰椤甸潰缁嗚妭鏂囨。搴旀斁鍦?feature 鐨?`details/` 涓嬶紱`ref/image/` 鍙繚鐣欏弬鑰冨浘璇存槑銆?- 宸插湪 F25 `feature.md` 鐨?Required Reading 涓姞鍏?`details/design.md`銆?- 宸叉柊澧炲浘鏍囪祫婧愮洰褰曡鏄庯細`static/icons/README.md`銆乣static/icons/tab/README.md`銆乣static/icons/page/today/README.md`銆乣static/icons/common/README.md`銆?- 宸叉柊澧?`F29`锛歚docs/harness/features/individual_feature/F29-tabbar-icons/`锛岀敤浜庡悗缁帴鍏ュ簳閮?TabBar 鍥炬爣銆?- `F29` 褰撳墠涓?`not_started`锛屼緷璧?`F28`锛岄伩鍏嶆墦鏂綋鍓?active 鐨?`F25` 椤甸潰鏀归€犮€?
## F25 active 2026-06-04

- 褰撳墠 `active` feature锛歚F25` 浠婃棩浠诲姟椤甸噸璁捐銆?- 鏈疆鍙慨鏀逛粖鏃ラ〉鍜?F25 scope 鍏佽鐨勫叡浜?UI 缁勪欢/娴嬭瘯/杩涘害璁板綍锛屼笉淇敼 models銆乻ervices銆乻torage key銆乸lanner銆乺eplanner銆丄I/tarot 涓氬姟閫昏緫锛屼笉鏀逛换鍔℃棩鍘嗐€佸垱寤虹洰鏍囥€佹垜鐨勯〉椤甸潰缁撴瀯銆?- F25 鍙傝€冨浘瀵圭収鏄‖闂ㄧ锛氬畬鎴愬疄鐜板拰鑷姩鍖栧悗锛岄渶瑕佺敤鎴锋槑纭‘璁も€淔25 鍙傝€冨浘瀵圭収閫氳繃鈥濇垨鎻愪緵鍙鏌ユ埅鍥撅紝鎵嶈兘灏?F25 缃负 `passing`銆?
## F25-F28 visual verifier rule 2026-06-04

- 宸插湪 F25-F28 鐨?`verification.md` 涓柊澧?`Visual Verifier Rule`銆?- 褰撳墠椤圭洰娌℃湁灏忕▼搴忔埅鍥?MCP 鎴栧井淇″紑鍙戣€呭伐鍏疯嚜鍔ㄥ寲鑳藉姏鏃讹紝鍙傝€冨浘瀵圭収蹇呴』鐢辩敤鎴蜂汉宸ュ畬鎴愩€?- Agent 鍙兘鎻愰啋鐢ㄦ埛鎵撳紑瀵瑰簲椤甸潰銆佹彁渚涘弬鑰冨浘璺緞鍜屾鏌ョ偣锛屽苟鍦ㄧ敤鎴风‘璁ゅ悗璁板綍缁撴灉锛涗笉鑳戒粎鍑簮鐮併€佹瀯寤轰骇鐗╂垨鑷姩娴嬭瘯鑷澹版槑鈥滃弬鑰冨浘瀵圭収閫氳繃鈥濄€?- F25-F28 缃负 `passing` 鍓嶅繀椤昏褰曠敤鎴蜂汉宸ョ‘璁ゅ師鏂囨垨鍙鏌ユ埅鍥捐矾寰勶紱缂哄皯璇ヨ瘉鎹椂涓嶈兘 passing銆?- 宸叉墽琛?`npm.cmd run verify:harness`锛岀粨鏋滈€氳繃锛?8 涓?feature锛?4 涓?passing锛? 涓?not_started锛? warning锛? error銆?
## F25-F28 reference-image gate 2026-06-04

- 宸插皢鈥滃弬鑰冨浘鏁堟灉鈥濆崌绾т负 F25-F28 鐨勭‖楠屾敹瑕佹眰锛屼笉鍐嶅彧鏄緟鍔╁弬鑰冦€?- F25-F28 鐨?`feature.md` acceptance 鍧囪姹傞灞忔晥鏋滄槑鏄炬帴杩戝搴斿弬鑰冨浘鐨勪俊鎭眰绾с€佷富瑙嗚鏉冮噸銆佸崱鐗囧瘑搴︺€佹寜閽眰绾у拰鏁翠綋姘旇川銆?- F25-F28 鐨?`verification.md` manual smoke 鍜?passing evidence 鍧囪姹傝褰曞弬鑰冨浘瀵圭収缁撴灉锛涘鏋滄病鏈夋帴杩戝弬鑰冨浘锛屽繀椤昏鏄庡師鍥犲拰椋庨櫓锛屼笖涓嶈兘鐩存帴 passing銆?- F25-F28 鐨?`ref/image/README.md` 鍧囨槑纭細涓嶈姹傞€愬儚绱犺繕鍘燂紝浣嗚交寰牱寮忚皟鏁翠笉鑳介€氳繃楠屾敹銆?
## F25-F28 feature contract thinning 2026-06-04

- 宸叉敹钖?F25-F28 鐨?`feature.md`锛氶〉闈㈢粏鑺傜粺涓€浠?`docs/design/page/pages/` 涓搴旈〉闈㈡枃妗ｄ负鍑嗐€?- `feature.md` 鐜板湪鍙繚鐣欎换鍔¤竟鐣屻€佺敤鎴风粨鏋溿€乻cope銆佹潈濞佽璁℃枃妗ｆ寚鍚戙€侀€氱敤楠屾敹鍙ｅ緞鍜?completion rule銆?- F25 鎸囧悜 `docs/design/page/pages/today-page.md`锛汧26 鎸囧悜 `docs/design/page/pages/calendar-page.md`锛汧27 鎸囧悜 `docs/design/page/pages/create-goal-page.md`锛汧28 鎸囧悜 `docs/design/page/pages/profile-page.md`銆?- 杩欐牱閬垮厤 feature 鍚堝悓鍜岄〉闈㈣璁℃枃妗ｉ噸澶嶅畾涔夐〉闈㈢粏鑺傦紝鍚庣画椤甸潰鏀瑰姩浠ヨ璁℃枃妗ｄ负鍞竴椤甸潰缁嗚妭鏉ユ簮銆?
## F25-F28 page redesign feature planning 2026-06-04

- 鏂板鍥涗釜椤甸潰绾?UI feature锛屽潎涓?`not_started`锛岀敤浜庡湪 F24 鏍峰紡鍩虹嚎涔嬪悗閫愰〉閲嶈璁″皬绋嬪簭涓?Tab 椤甸潰銆?- `F25`锛氫粖鏃ヤ换鍔￠〉閲嶈璁★紝鍚堝悓鐩綍 `docs/harness/features/individual_feature/F25-today-page-redesign/`銆?- `F26`锛氫换鍔℃棩鍘嗛〉閲嶈璁★紝鍚堝悓鐩綍 `docs/harness/features/individual_feature/F26-calendar-page-redesign/`銆?- `F27`锛氬垱寤虹洰鏍囬〉閲嶈璁★紝鍚堝悓鐩綍 `docs/harness/features/individual_feature/F27-create-goal-page-redesign/`銆?- `F28`锛氭垜鐨勯〉閲嶈璁★紝鍚堝悓鐩綍 `docs/harness/features/individual_feature/F28-profile-page-redesign/`銆?- 鍥涗釜 feature 涓茶渚濊禆锛歚F24 -> F25 -> F26 -> F27 -> F28`銆傚悗缁墽琛屾椂涓嶅緱鍚屾椂鏀瑰涓〉闈?feature銆?- 鍙傝€冩枃妗ｅ彧鎸囧悜 `docs/design/page/pages/` 涓搴旈〉闈㈡枃妗ｏ紱`style-baseline.md` 宸茬敱 F24 浣跨敤锛屾湰杞〉闈?feature 涓嶉粯璁よ鍙栥€?- 鍙傝€冨浘鐗囬€氳繃鍚?feature 鐨?`ref/image/README.md` 鎸囧悜 `docs/design/page/reference_image/`銆?- 鏈鍙柊澧?feature 鍚堝悓锛屼笉淇敼灏忕▼搴忎笟鍔′唬鐮併€?
## Feature template 2026-06-04

- 鏂板 `docs/harness/features/feature-template.md`锛岀敤浜庤鏄庡悗缁?`docs/harness/features/individual_feature/` 涓嬬殑鏂?feature 搴斿浣曠紪鍐欍€?- 妯℃澘鏄庣‘ `feature.md` 绠′换鍔¤竟鐣屻€乣verification.md` 绠″畬鎴愯瘉鏄庛€乨esign docs 绠＄粏鑺傝璁°€?- 鏈鍙慨鏀?harness 鏂囨。锛屼笉鍒涘缓鏂扮殑涓氬姟 feature锛屼笉淇敼灏忕▼搴忎笟鍔′唬鐮併€?
## F24 passing 2026-06-03

- `F24` UI 缁熶竴鏍峰紡鍩虹嚎宸插畬鎴愬苟缃负 `passing`銆?- 鏂板 `styles/ui.scss` 浣滀负鍏变韩 Sass 鍩虹嚎锛岀粺涓€ canvas/surface/accent token銆乸age-shell銆乧ard銆乸rimary/secondary/text button銆乻tatus-tag銆乷ption-chip銆乻oft-block 绛夎鍒欙紱`App.vue`銆佸洓涓富 Tab 椤靛拰 `AppPageHeader`銆乣TaskCard`銆乣TodayFocusCard`銆乣EmptyState`銆乣EnergySelector` 宸叉帴鍏ヨ鍩虹嚎銆?- `pages.json` 浠呰皟鏁村師鐢熻瑙夎壊鍊硷細navigation/background 瀵归綈 `#faf8f3`锛孴abBar background 瀵归綈 `#ffffff`锛涙湭淇敼椤甸潰椤哄簭銆乀abBar list 鎴栬矾鐢便€?- 鐩稿 F20-F23 鐨勫彲瑙佸彉鍖栵細浠婃棩椤电殑閲嶇偣浠诲姟鍗°€佺姸鎬佸崱銆丄I 寤鸿鍜屽鐩樺叆鍙ｇ粺涓€涓哄悓涓€濂楀崱鐗囧澹筹紝鏂囨湰鎸夐挳闄嶇骇涓洪€忔槑鍏ュ彛锛涙棩鍘嗛〉鐨勭洰鏍囪鍒掋€佽繘搴︺€? 澶╅€夋嫨銆佽繙鏈熼樁娈靛拰寤鸿鍗＄粺涓€鍦嗚/杈规/闃村奖锛涘垱寤虹洰鏍囬〉鐨勬楠ゅ崱銆佽緭鍏ユ銆佹椂闂撮€夐」鍜屽亸濂介€夐」浣跨敤缁熶竴鍗＄墖涓?option chip锛涙垜鐨勯〉鐨勭洰鏍囥€佸亸濂姐€佽〃杈俱€佹渶杩戞帹杩涘拰璁剧疆鍏ュ彛缁熶竴 panel銆佹寜閽拰鐘舵€佹爣绛惧眰绾с€?- 瑙嗚妫€鏌ョ煩闃碉細Today 鏈変换鍔＄姸鎬佹鏌?`<TodayFocusCard>` 浠嶄负棣栦釜涓氬姟鐒︾偣锛汿oday 鏃犵洰鏍?鏃犱换鍔＄姸鎬佹鏌?`EmptyState` 鍔ㄤ綔鍏ュ彛锛汣alendar DDL 7 澶╁唴鐘舵€佺敱 `tests/plan-calendar.test.ts` 鐨?tight pressure case 鍜?`progress-card` 浜х墿瑕嗙洊锛汣alendar DDL 瓒呰繃 7 澶?杩滄湡闃舵鐢?long bundle case 涓?`stage-panel` 浜х墿瑕嗙洊锛汣reate Goal 鍒濆杈撳叆鐘舵€佹鏌?`step-list`銆佽緭鍏ユ鍜岀鐢ㄤ富鎸夐挳锛汣reate Goal 鍋忓ソ灞曞紑鐘舵€佹鏌?`preference-step`銆乣EnergySelector` 鍜?option chip锛汸rofile 鏈夌洰鏍囩姸鎬佹鏌?`goal-card`銆佽繘搴﹀拰涓?娆℃寜閽紱Profile 鏃犵洰鏍囩姸鎬佹鏌?`profile-empty` + `EmptyState`銆?- 鏋勫缓鍏ュ彛妫€鏌ワ細`project.config.json.miniprogramRoot` 褰撳墠涓?`dist/dev/mp-weixin/`锛岀幇鏈?dev watcher 宸插湪 `2026-06-03 19:26:12` 鍒锋柊 dev 浜х墿锛沗npm.cmd run verify:system` 宸插湪 `2026-06-03 19:26:35` 鍒锋柊 `dist/build/mp-weixin`銆備袱杈?`app.json` 鍧囧寘鍚?`navigationBarBackgroundColor: "#faf8f3"`銆乣backgroundColor: "#faf8f3"` 鍜?TabBar `backgroundColor: "#ffffff"`锛屽洓涓富 Tab WXSS 鍧囧寘鍚?F24 page/card 鍩虹嚎銆?- 鑷姩鍖栫粨鏋滐細`npm.cmd run test -- ui-components navigation-shell today plan-calendar goal-create user-profile` 閫氳繃锛?4 涓祴璇曢€氳繃锛沗npm.cmd run verify:static` 閫氳繃锛沗npm.cmd run verify:system` 閫氳繃锛屼粎鏈?Sass legacy JS API warning锛沗npm.cmd run verify:harness` 閫氳繃锛屼粛鏈?F01-F07 legacy `completionGate` warning銆?- 鏈疆娌℃湁浣跨敤寰俊寮€鍙戣€呭伐鍏锋埅鍥撅紱鎸?F24 `verification.md` 鍏佽鐨勨€滀汉宸ヨ褰曗€濇柟寮忥紝鐢ㄦ簮鐮併€佹祴璇曞拰 dev/build mp-weixin 浜х墿瀹屾垚瑙嗚鐭╅樀妫€鏌ャ€傛墍鏈夌煩闃电姸鎬佸潎鍙瀯閫狅紝鏈褰曟棤娉曢獙璇佺姸鎬併€?- 宸茬‘璁ゆ湭淇敼 `models/`銆乣services/`銆乣schemas/`銆乻torage key銆乸lanner銆乺eplanner銆丄I/tarot 涓氬姟閫昏緫銆傚綋鍓嶅伐浣滄爲涓?`docs/harness/verification-policy.md` 涓?`docs/harness/instrumentation.md` 宸蹭笉瀛樺湪锛孎24 鏈疆鎸?feature 鑷甫 `verification.md` 鎵ц闂ㄧ銆?
## F24 feature design 2026-06-03

- ??? F24?`docs/harness/features/individual_feature/F24-ui-overall-design/feature.md`?
- F24 ?? Markdown feature ?????`feature.md` ????????????? acceptance?`verification.md` ????????????? passing ?????`ref/image/README.md` ???????????
- `docs/harness/features/feature-index.json` ??? F24???? `not_started`???? `v0.3`?
- F24 ???? UI ?????????? UI ???????????????????? F24 ?? `active`??? `verification.md` ?????????
- `scripts/harness-gate.mjs` ??? feature registry ????? legacy `feature.json` ??? Markdown feature ???

## Feature registry migration 2026-06-01

- 宸插垱寤?`docs/harness/features/feature-index.json` 浣滀负褰撳墠 feature 杞婚噺绱㈠紩銆?- 宸插皢 F01-F23 鎷嗗垎鍒?`docs/harness/features/individual_feature/<feature-id>/feature.json`銆?- 鏉ユ簮鏄犲皠锛欶01-F07 鏉ヨ嚜 `docs/log/v0.1/feature_list_v0.1.json`锛汧08-F11 鏉ヨ嚜 `docs/log/v0.2/feature_list_v0.2.json`锛汧12-F19 鏉ヨ嚜 `docs/log/v0.3/feature_list.json`锛汧20-F23 鏉ヨ嚜 `docs/log/v0.2/feature_list_v3_v2.json`銆?- `docs/log/v0.1/feature_list.json` 褰撳墠涓嶅寘鍚?F01-F07锛屽洜姝?v0.1 杩佺Щ婧愪互 `docs/log/v0.1/feature_list_v0.1.json` 涓哄噯銆?- `AGENTS.md` 宸插垏鎹负鍏堣 feature index锛屽啀璇诲彇褰撳墠 feature 鐨?`feature.json`銆?- `scripts/harness-gate.mjs` 宸叉敮鎸?feature index 骞跺睍寮€鍗曚釜 feature 鍚堝悓锛沗npm.cmd run verify:harness` 榛樿鏍￠獙鏂?registry銆?
## UI visibility fix 2026-06-01

- 鍙戠幇寰俊寮€鍙戣€呭伐鍏峰叆鍙?`project.config.json.miniprogramRoot` 鎸囧悜 `dist/dev/mp-weixin/`锛岃€屽綋鍓嶇郴缁熼獙璇佸拰瀹為檯鏋勫缓鍛戒护 `npm.cmd run verify:system` / `build:mp-weixin` 鐢熸垚鐨勬槸 `dist/build/mp-weixin/`銆?- `dist/dev/mp-weixin/` 浠嶆槸 2026-05-24 鍒?2026-05-26 鐨勬棫浜х墿锛屽鑷村紑鍙戣€呭伐鍏蜂腑鐪嬩笉鍒?F20-F23 鐨勬柊鐗?UI銆?- 宸插皢 `project.config.json.miniprogramRoot` 瀵归綈鍒?`dist/build/mp-weixin/`锛屽苟鍦?`tests/navigation-shell.test.ts` 澧炲姞閰嶇疆涓€鑷存€ф祴璇曪紝閬垮厤鍚庣画鍐嶆鍑虹幇鈥滄瀯寤烘垚鍔熶絾寮€鍙戣€呭伐鍏风湅鏃х洰褰曗€濈殑闂銆?
## Native navigation duplicate title fix 2026-06-01

- 瀹炴満鎴浘纭 F23 姝ラ寮忓崱鐗囧凡缁忕敓鏁堬紝浣嗗井淇″師鐢熷鑸爮鏍囬鍜屾鏂?`AppPageHeader` 鏍囬閲嶅锛屼笖椤甸潰椤堕儴浠嶄繚鐣?`96rpx` 澶х暀鐧斤紝瑙嗚涓婂儚鏃х増澶村浘鍖轰粛瀛樺湪銆?- 宸插皢 `AppPageHeader` 鏀跺彛涓烘鏂囪交鎻愮ず鍜屽彲閫?action锛屼笉鍐嶆覆鏌撳悓鍚嶅ぇ鏍囬锛涗簲涓〉闈㈢殑椤堕儴 padding 璋冩暣涓?`32rpx 32rpx 48rpx`锛岃鍘熺敓瀵艰埅鏍忎笅鏂圭洿鎺ヨ繘鍏ラ〉闈㈡牳蹇冨唴瀹广€?- 鏈湴寮€鍙戝叆鍙ｉ噸鏂板榻愬埌 `dist/dev/mp-weixin/`锛屽尮閰?`npm.cmd run dev:mp-weixin` 鐨勮緭鍑虹洰褰曪紱`tests/navigation-shell.test.ts` 澧炲姞璇ョ害鏉熴€?- 宸查€氳繃 `npm.cmd run test -- ui-components navigation-shell`銆乣npm.cmd run verify:static`銆乣npm.cmd run verify:system`銆乣npm.cmd run verify:harness`锛沝ev/build 浜х墿鍧囩‘璁や笉鍐嶅寘鍚鏂?title銆?
## F23 update 2026-05-31

- `F23` 鍒涘缓鐩爣涓庢垜鐨勯〉鏀跺彛宸插畬鎴愬苟缃负 `passing`锛汧20-F23 褰撳墠杞婚噺 UI 娓呭崟宸插叏閮ㄥ畬鎴愩€?- `pages/goal-create/index.vue` 宸叉敼涓烘楠ゅ紡鍗＄墖锛屾寜鐩爣鍚嶇О銆佹埅姝㈡棩鏈熴€佹瘡鏃ュ彲鐢ㄦ椂闂淬€佽ˉ鍏呰鏄庛€佷釜鎬у寲瀹夋帓鍋忓ソ缁勭粐杈撳叆锛涘亸濂介粯璁ゅ睍寮€锛屽寘鍚伐浣滄椂娈点€佽兘閲忕姸鎬併€佷华寮忔劅琛ㄨ揪鍜?MBTI銆?- 鍒涘缓椤典粛鍙礋璐ｅ垱寤?Goal銆佷繚瀛?UserProfile銆佺敓鎴愬苟淇濆瓨 PlanBundle锛屽悓鏃跺啓鍏?legacy DailyPlan[] 鍏煎瑙嗗浘锛涢〉闈笉灞曠ず浠诲姟鏃ュ巻鎴栨墽琛屼换鍔°€?- `pages/profile/index.vue` 宸叉敹鍙ｄ负褰撳墠鐩爣銆侀粯璁ゅ畨鎺掑亸濂姐€丄I 琛ㄨ揪涓庝华寮忔劅銆佹渶杩戞帹杩涘拰璁剧疆鍏ュ彛锛涙湁鐩爣鏃舵彁渚涙煡鐪嬭鍒?绠＄悊鐩爣鍔ㄤ綔锛屾棤鐩爣鏃剁獊鍑哄垱寤虹洰鏍囥€?- 杈圭晫锛氫笉鏂板澶氱洰鏍囧畬鏁寸鐞嗐€佷笉鏂板瀹屾暣璁剧疆椤点€佷笉鎺ュ叆鐪熷疄 Deepseek锛屼笉鏀瑰彉 PlanBundle銆丟oal銆乁serProfile 鎸佷箙鍖栫粨鏋勬垨 storage key銆?- 宸查€氳繃 `npm.cmd run test -- goal-create user-profile ui-components navigation-shell data-layer`銆乣npm.cmd run verify:static`銆乣npm.cmd run verify:system`銆乣npm.cmd run verify:harness`銆?
## F22 update 2026-05-31

- `F22` 浠诲姟鏃ュ巻璁″垝鏉垮凡瀹屾垚骞剁疆涓?`passing`锛涗笅涓€姝ユ寜渚濊禆鍚姩 `F23` 鍒涘缓鐩爣涓庢垜鐨勯〉鏀跺彛銆?- `pages/plan-calendar/index.vue` 宸叉敹鍙ｄ负鐩爣璁″垝鏉匡紝灞曠ず褰撳墠鐩爣銆佹暣浣撹繘搴︺€佹椂闂村帇鍔涖€佽繎 7 澶╀换鍔°€佽繙鏈熼樁娈靛拰杞婚噺璋冩暣璁″垝鍏ュ彛銆?- 杈圭晫锛氱户缁€氳繃 `migrateLegacyDailyPlans()`銆乣buildPlanBundleCalendarView()` 鍜?plan-view 瑙嗗浘妯″瀷璇诲彇 Goal/Plan/Stage/Task锛屼笉鏀?PlanBundle 鎸佷箙鍖栫粨鏋勩€乻torage key 鎴?replanner 椤哄欢绛栫暐銆?- 宸查€氳繃 `npm.cmd run test -- plan-calendar ui-components data-layer`銆乣npm.cmd run verify:static`銆乣npm.cmd run verify:system`銆乣npm.cmd run verify:harness`銆?
## F21 update 2026-05-31

- `F21` 浠婃棩浠诲姟鎵ц鍙版敼閫犲凡瀹屾垚骞剁疆涓?`passing`锛涗笅涓€姝ユ寜渚濊禆鍚姩 `F22` 浠诲姟鏃ュ巻璁″垝鏉裤€?- 浠婃棩椤甸灞忔敼涓烘墽琛屽彴淇℃伅灞傜骇锛歚TodayFocusCard` 鏄湁浠诲姟鐘舵€佷笅鐨勭涓€寮犳牳蹇冨崱锛屽彧绐佸嚭涓€涓?focus task锛涘浠诲姟閫氳繃鈥滀粖鏃ュ叡 N 涓换鍔?/ 鏌ョ湅鍏ㄩ儴鈥濈殑杞婚噺灞曞紑鍏ュ彛澶勭悊銆?- 浠婃棩鐘舵€佸崱灞曠ず鑳介噺銆佸彲鐢ㄦ椂闂淬€佸綋鍓嶇姸鎬佸拰绠＄悊鍏ュ彛锛汚I 浠婃棩寤鸿闄愬埗涓烘渶澶?3 鏉＄煭鍙ワ紱鏅氶棿澶嶇洏淇濈暀涓鸿交閲忓叆鍙ｅ苟璺宠浆鍒?`pages/review/index`銆?- 鏁版嵁璇诲彇缁х画缁忕敱 `migrateLegacyDailyPlans()` 涓?`buildTodaySuggestionFromPlanBundle()` / `TodaySuggestionView`锛岄〉闈㈡湭鐩存帴鎷艰搴曞眰 Plan/Stage/Task 瀛樺偍缁撴瀯锛屼篃鏈慨鏀?planner銆乺eplanner銆乻torage key 鎴栦换鍔＄姸鎬佸啓鍥為€昏緫銆?- 宸查€氳繃 `npm.cmd run test -- today today-suggestion review ui-components`銆乣npm.cmd run verify:static`銆乣npm.cmd run verify:system`銆乣npm.cmd run verify:harness`銆?
## Current handoff 2026-05-31

- `2026-05-31` 鏂板 `docs/design/page/02-f20-page-shell-component-baseline.md`锛岀敤浜庢妸 F20 鐨勯〉闈㈠３銆乀abBar 鍗忓悓銆佺粍浠跺熀绾裤€佺姝㈤」鍜岄獙鏀剁偣鍐欐垚鎵ц绾ц璁″悎绾︺€?- `F20` 鐨?behavior 涓?docs 寮曠敤宸插悓姝ユ洿鏂板埌 `docs/log/v0.2/feature_list_v3_v2.json` 鍜?`docs/log/v0.3/feature_list_v0.3.json`銆?
- 褰撳墠 UI 鏀归€犲叆鍙ｅ凡鍒囨崲涓?`docs/harness/features/feature-index.json`銆?- `docs/log/v0.2/feature_list_v3_v2.json` 鍙繚鐣?F20-F23锛岀敤浜庨檷浣庡悗缁?UI 浠诲姟鐨勪笂涓嬫枃鍗犵敤銆?- `docs/log/v0.3/feature_list_v0.3.json` 淇濈暀涓?F12-F23 鐨勫畬鏁村巻鍙叉竻鍗曪紝涓嶅啀浣滀负榛樿浠诲姟鍏ュ彛銆?- 褰撳墠 `active` feature锛氭棤銆?- `npm.cmd run verify:harness` 榛樿鏍￠獙杞婚噺娓呭崟锛涘闇€鏍￠獙瀹屾暣鍘嗗彶娓呭崟锛屽彲璁剧疆 `HARNESS_FEATURE_LIST=docs/log/v0.3/feature_list_v0.3.json` 鍚庤繍琛屻€?
## 褰撳墠 feature

- 褰撳墠 `active` feature锛欶25
- 鐘舵€侊細F20-F24 鍧囦负 `passing`锛孎25 涓?`active`

## 褰撳墠鐘舵€?
- 椤圭洰闃舵锛欰pp v0.3 鏁版嵁妯″瀷涓庢湇鍔¤縼绉诲凡瀹屾垚锛孶I 鏀归€犲凡瀹屾垚 F20 椤甸潰澹充笌缁勪欢鍩虹嚎銆丗21 浠婃棩浠诲姟鎵ц鍙般€丗22 浠诲姟鏃ュ巻璁″垝鏉裤€丗23 鍒涘缓鐩爣涓庢垜鐨勯〉鏀跺彛銆丗24 UI 缁熶竴鏍峰紡鍩虹嚎銆?- Harness 鐘舵€侊細F12-F24 宸?`passing`锛涘綋鍓?feature registry 涓?F01-F24 鍧囦负 `passing`銆?- 褰撳墠宸ヤ綔鍔熻兘娓呭崟浣嶇疆锛歚docs/harness/features/feature-index.json`

## 鍔熻兘鐘舵€佹憳瑕?
- `F12` passing
- `F13` passing
- `F14` passing
- `F15` passing
- `F16` passing
- `F17` passing
- `F18` passing
- `F19` passing
- `F20` passing
- `F21` passing
- `F22` passing
- `F23` passing
- `F24` passing
- v0.3 鐗堟湰鍖栧姛鑳芥竻鍗曚綅缃細`docs/log/v0.3/feature_list_v0.3.json`
- v0.2 鐗堟湰鍖栧姛鑳芥竻鍗曚綅缃細`docs/log/v0.2/feature_list_v0.2.json`
- v0.1 褰掓。鍔熻兘娓呭崟浣嶇疆锛歚docs/log/v0.1/feature_list.json`

## 鏈€杩戝畬鎴?
- `2026-05-31` F20 宸插畬鎴愰〉闈㈠３涓庡叏灞€缁勪欢鍩虹嚎锛氫簲涓〉闈娇鐢?`AppPageHeader`锛岀Щ闄ゆ鏂囬噸澶嶆爣棰?eyebrow 鏍峰紡鍜?today/calendar/profile 鐨勫悓绾?TabBar 鍏ュ彛鎸夐挳锛岀粍浠跺澹虫牱寮忔敹鏁涘埌鍏变韩缁勪欢锛涙湭淇敼鏁版嵁銆乻torage銆乸lanner銆乺eplanner 鎴?AI/tarot 閫昏緫銆?- `npm.cmd run test -- ui-components navigation-shell today plan-calendar review` 閫氳繃锛?6 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static` 閫氳繃銆?- `npm.cmd run verify:system` 閫氳繃锛宮p-weixin 鏋勫缓鎴愬姛锛屼粎鏈?Sass legacy API warning銆?- `npm.cmd run verify:harness` 閫氳繃锛? 涓?feature锛? 涓?passing锛? 涓?not_started锛? warning / 0 error銆?- `2026-05-31` 宸插湪 `docs/log/v0.3/feature_list_v0.3.json` 杩藉姞 UI 鏀归€犱换鍔?F20-F23銆?- F20锛氶〉闈㈠３涓庡叏灞€缁勪欢鍩虹嚎銆?- F21锛氫粖鏃ヤ换鍔℃墽琛屽彴銆?- F22锛氫换鍔℃棩鍘嗚鍒掓澘銆?- F23锛氬垱寤虹洰鏍囦笌鎴戠殑椤垫敹鍙ｃ€?- 杩欎簺浠诲姟鎸?F20 -> F21 -> F22 -> F23 涓茶渚濊禆锛屽悗缁?agent 涓嶅簲鍚屾椂瀹炵幇澶氫釜 UI feature銆?
- 灏嗙孩妗嗕腑鐨勯」鐩湴鍥俱€佺害鏉熴€佽鏍煎拰鍒濆鍖栨枃妗ｇЩ鍔ㄥ埌 `docs/harness/`
- 淇濈暀 `docs/progress.md` 鍜?`docs/decisions.md` 浣滀负涓绘枃浠?- 灏嗗悗缁祦姘磋褰曠洰褰曡皟鏁翠负 `docs/log/`
- 鍚屾 `AGENTS.md` 鍜?harness 鏂囨。涓殑璺緞寮曠敤
- 瀹炵幇 F01 鍒涘缓鐩爣椤甸潰锛氱洰鏍囧悕绉般€佹埅姝㈡棩鏈熴€佹瘡鏃ュ彲鐢ㄦ椂闂淬€佸彲閫夎鏄庛€佹牎楠屾彁绀哄拰淇濆瓨鍙嶉
- 鍦?`models/goal.ts` 澧炲姞鍒涘缓鐩爣杈撳叆鏍￠獙涓庣洰鏍囨瀯寤洪€昏緫
- 鏂板 `tests/goal-create.test.ts` 瑕嗙洊蹇呭～鏍￠獙銆佹棤鏁堟椂闂存牎楠屽拰缁熶竴 storage 淇濆瓨鍏ュ彛
- 淇 F01 鎵嬪姩鍐掔儫鍙戠幇鐨勯棶棰橈細鎴鏃ユ湡涓嶈兘鏃╀簬浠婂ぉ锛岄〉闈㈡寜 `docs/harness/DESIGN.md` 鍜?`docs/design/visual-system.md` 璋冩暣涓烘殩鐧界敾甯冦€乻urface 琛ㄥ崟鍖恒€乤ccent 涓绘寜閽拰浣庡帇鍔涙彁绀?
## 褰撳墠楠岃瘉鐘舵€?
- `docs/log/v0.2/feature_list_v0.2.json`锛歷0.2 褰掓。鍔熻兘娓呭崟锛? 涓?feature锛? 涓?active锛? 涓?passing锛? 涓?not_started
- `npm.cmd run test -- goal-create`锛氶€氳繃锛? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€? 涓祴璇曢€氳繃
- `2026-05-23` 鐢ㄦ埛纭 F01 鏈€缁堟墜鍔ㄥ啋鐑熼€氳繃
- `2026-05-23` F02 宸叉寜鍔熻兘閫夋嫨瑙勫垯鍚姩骞跺畬鎴愰獙璇?- `npm.cmd run test -- user-profile`锛氶€氳繃锛? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?1 涓祴璇曢€氳繃
- F02 mixed verification锛氶〉闈㈠凡鎻愪緵鍋忓ソ宸ヤ綔鏃舵銆佸綋鍓嶈兘閲忕姸鎬併€佸彲閫?MBTI 鍜屼繚瀛樺亸濂藉姩浣滐紱鑷姩鍖栨祴璇曡鐩栫粺涓€ storage 淇濆瓨鍜岀害鏉熻竟鐣?- `2026-05-23` F03 宸叉寜鍔熻兘閫夋嫨瑙勫垯鍚姩骞跺畬鎴愰獙璇?- `npm.cmd run test -- planner`锛氶€氳繃锛? 涓?planner 娴嬭瘯鏂囦欢銆? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃
- F03 瀹炵幇纭畾鎬у垵濮嬫媶瑙ｏ細涓嶈皟鐢ㄧ湡瀹?AI锛涙寜鏃ユ湡鐢熸垚 DailyPlan锛涙瘡鏃ヤ换鍔℃€绘椂闀夸笉瓒呰繃 dailyAvailableMinutes锛涙瘡涓换鍔″寘鍚爣棰樸€侀璁℃椂闀裤€佷紭鍏堢骇鍜屾渶浣庡畬鎴愮嚎锛涗笉鍙鏃惰繑鍥?infeasible
- `2026-05-23` 鎵嬪姩娴嬭瘯鍙戠幇 F03 闆嗘垚缂哄彛锛氱偣鍑?goal-create 鐨勨€滅敓鎴愯鍒掆€濆彧淇濆瓨鐩爣鍜屽亸濂斤紝鏈皟鐢?planner 鐢熸垚骞朵繚瀛?DailyPlan锛涘凡瀹氫綅涓洪〉闈㈠叆鍙ｆ湭涓茶仈 planner
- `2026-05-23` F03 闆嗘垚缂哄彛宸蹭慨澶嶏細goal-create 鐨勨€滅敓鎴愯鍒掆€濈幇鍦ㄤ細鏋勫缓 UserProfile銆佽皟鐢?buildStarterPlan锛屽苟閫氳繃 saveDailyPlans 淇濆瓨 DailyPlan[]
- `2026-05-23` F04 宸叉寜鍔熻兘閫夋嫨瑙勫垯鍚姩骞跺畬鎴愰獙璇侊紝鐢ㄦ埛纭鏈€缁堟墜鍔ㄥ啋鐑熼€氳繃
- `npm.cmd run test -- plan-calendar`锛氶€氳繃锛? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?3 涓祴璇曢€氳繃
- F04 鑷姩鍖栧疄鐜板凡瀹屾垚锛氫换鍔℃棩鍘嗛〉璇诲彇褰撳墠鐩爣涓?DailyPlan锛岄粯璁ゅ睍绀烘渶杩?7 澶╋紝浠诲姟鍗＄墖鏄剧ず鐘舵€併€侀璁℃椂闀裤€佷紭鍏堢骇鍜屾渶浣庡畬鎴愮嚎锛涙棤璁″垝鏃舵樉绀轰綆鍘嬪姏绌虹姸鎬侊紱浠婃棩浠诲姟鍏ュ彛娉ㄥ唽涓哄崰浣嶉〉
- `2026-05-23` 鐢ㄦ埛纭 F04 鏈€缁堟墜鍔ㄥ啋鐑熼€氳繃
- `2026-05-23` F05 宸叉寜鍔熻兘閫夋嫨瑙勫垯鍚姩骞跺畬鎴愰獙璇?- `npm.cmd run test -- today`锛氶€氳繃锛? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃
- F05 瀹炵幇浠婃棩浠诲姟椤碉細璇诲彇褰撳墠鐩爣銆丏ailyPlan 鍜?UserProfile锛涙樉绀轰粖鏃ユ渶閲嶈浠诲姟銆佹渶浣庡畬鎴愮嚎銆佹帹鑽愪笓娉ㄦ椂娈点€佽兘閲忕姸鎬佹彁绀哄拰浠婃棩浠诲姟鍒楄〃锛涗綆鑳介噺鐘舵€佷紭鍏堥檷浣庡帇鍔?- `2026-05-23` F06 宸叉寜鍔熻兘閫夋嫨瑙勫垯鍚姩骞跺畬鎴愰獙璇?- `npm.cmd run test -- review`锛氶€氳繃锛? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?4 涓祴璇曢€氳繃
- F06 瀹炵幇鏅氶棿澶嶇洏椤碉細鍙褰曚换鍔″凡瀹屾垚銆侀儴鍒嗗畬鎴愭垨鏈畬鎴愶紱鍙褰曚粖鏃ヨ兘閲忕姸鎬侊紱鍙繚瀛樺彲閫夊娉紱澶囨敞涓虹┖鏃朵粛淇濆瓨缁撴瀯鍖?DailyReview
- `2026-05-23` F07 宸叉寜鍔熻兘閫夋嫨瑙勫垯鍚姩骞跺畬鎴愰獙璇?- `npm.cmd run test -- replanner`锛氶€氳繃锛? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃
- F07 瀹炵幇鑷姩閲嶆帓鍚庣画璁″垝锛氭牴鎹櫄闂村鐩樻妸閮ㄥ垎瀹屾垚鍜屾湭瀹屾垚浠诲姟杞垚鍚庣画琛ュ仛浠诲姟锛涢珮浼樺厛绾т换鍔′紭鍏堟帓鍏ュ悗缁棩鏈燂紱姣忔棩浠诲姟鎬绘椂闀夸笉瓒呰繃 `dailyAvailableMinutes`锛涘鐩樺綋澶╁凡瀹屾垚銆侀儴鍒嗗畬鎴愬拰璺宠繃鐘舵€佷綔涓哄巻鍙蹭繚鐣欙紱涓嶅彲琛屾椂杩斿洖 `infeasible` 鍜岃皟鏁村缓璁?- 宸茬煡锛歅owerShell 鐩存帴鎵ц `npm run check` 浼氳鏈満 execution policy 鎷︽埅锛屽綋鍓嶇幆澧冧娇鐢?`npm.cmd run check`
- `2026-05-24` harness 绗笁灞傚凡浠庣函鏂囨。瑙勫垯鍗囩骇涓鸿交閲忛棬绂侊細鏂板 `scripts/harness-gate.mjs` 鍜?`docs/log/smoke-template.md`
- `2026-05-24` `package.json` 宸叉柊澧?`verify:harness`锛屽苟鎺ュ叆 `npm run check`
- `2026-05-24` `docs/harness/verification-policy.md` 宸叉妸 L3 鎷嗕负 L3a 绯荤粺鏋勫缓纭鍜?L3b 鐢ㄦ埛璺緞璇佹嵁锛涙柊 active feature 蹇呴』瀹氫箟 `completionGate`
- `2026-05-24` 璋冭瘯/楠岃瘉鏂囨。宸叉敹鏁涳細浜哄伐璇勪及琛ㄥ苟鍏?`docs/harness/verification-policy.md`锛宍docs/harness/instrumentation.md` 鏀逛负璁板綍浣嶇疆閫熸煡锛屽垹闄ょ嫭绔嬭瘎浼版枃妗?- `2026-05-24` `docs/template/**` 宸插姞鍏?ESLint ignore锛岄伩鍏嶄笅杞界殑鏁欑▼绀轰緥浠ｇ爜鍙備笌椤圭洰 lint
- `npm.cmd run verify:harness`锛氶€氳繃锛涘綋鍓?7 涓棫 feature 缂哄皯 `completionGate`锛岃剼鏈互 legacy warning 姹囨€伙紝涓嶉樆濉?v0.1 鍩虹嚎
- `npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃锛涙柊澧?harness gate 涔熼€氳繃
- `2026-05-24` 璋冭瘯/楠岃瘉鏂囨。鏀舵暃鍚庨噸鏂版墽琛?`npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃锛涗粛鍙湁 F01-F07 legacy `completionGate` warning
- `2026-05-24` v0.1 鍔熻兘娓呭崟宸插綊妗ｅ埌 `docs/log/v0.1/feature_list_v0.1.json`
- `2026-05-24` v0.2 宸ヤ綔璁″垝宸插啓鍏?`docs/log/v0.2/work-plan.md`
- `2026-05-24` v0.2 鍔熻兘娓呭崟宸茬敓鎴愶紝杩佺Щ鍚庡綊妗ｄ负 `docs/log/v0.2/feature_list_v0.2.json`锛汧08 涓?active锛孎09-F11 鎸変緷璧栭『搴?not_started
- `2026-05-24` v0.2 娓呭崟鐢熸垚鍚庢墽琛?`npm.cmd run verify:harness`锛氶€氳繃锛? 涓?feature锛? 涓?active锛? 涓?not_started锛? warning锛? error
- `2026-05-24` v0.2 娓呭崟鐢熸垚鍚庢墽琛?`npm.cmd run check`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃锛宮p-weixin 鏋勫缓閫氳繃锛宧arness gate 閫氳繃
- `2026-05-24` v0.2 UI 瑙勫垯宸茶ˉ鍏咃細F09/F10 鏄庣‘瑕佹眰鍏堥伒瀹?`docs/harness/DESIGN.md`锛屽啀璇诲彇 `docs/design/visual-system.md` 鍜?`docs/design/components.md`锛沗docs/design/components.md` 涓?`docs/design/pages.md` 宸叉竻鐞嗕负 v0.2 鍙ｅ緞

- `2026-05-24` F08 宸插畬鎴愭暟鎹眰鏁寸悊涓庡吋瀹硅竟鐣岋細鏂板鏃ф暟鎹?normalize 鍏煎銆乻torage `read*` 鏄庣‘鐘舵€佺粨鏋溿€乣today-suggestion` 璁＄畻瑙嗗浘鏈嶅姟锛涙湭寮曞叆鐪熷疄 Deepseek銆佸缃?UI 鎴栦簯绔瓨鍌?- `npm.cmd run test -- data-layer storage`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?1 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛?0 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃锛宧arness gate 0 warning / 0 error
- `npm.cmd run verify:harness`锛氶€氳繃锛孎08 passing 鐘舵€佷笅 4 涓?feature锛? warning锛? error
- F08 L3b锛歚tests/data-layer.test.ts` 鑷姩鍖栬鐩栤€滃垱寤虹洰鏍?-> 淇濆瓨璁″垝 -> 鎵撳紑浠婃棩浠诲姟鐢熸垚寤鸿瑙嗗浘鈥濆拰鈥滄棤鏈湴鏁版嵁 -> 鏄庣‘绌虹粨鏋溾€濅袱鏉＄敤鎴疯矾寰?
- `2026-05-24` F09 宸插畬鎴愬鑸３涓庨〉闈㈤『搴忥細`pages.json` 灏?today 璁句负绗竴鍏ュ彛锛屽簳閮?tab 涓?浠婃棩/鏃ュ巻/鍒涘缓/鎴戠殑锛屾柊澧?`pages/profile/index.vue` 鍜?`components/AppPageHeader.vue`
- `npm.cmd run test -- navigation-shell`锛氶€氳繃锛? 涓祴璇曟枃浠躲€? 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛锛宲rofile/today/plan-calendar/goal-create 椤甸潰 wxml/json 浜х墿瀛樺湪
- `npm.cmd run check`锛氶€氳繃锛?1 涓祴璇曟枃浠躲€?4 涓祴璇曢€氳繃锛宧arness gate 0 warning / 0 error
- `npm.cmd run verify:harness`锛氶€氳繃锛孎09 passing 鐘舵€佷笅 4 涓?feature锛? warning锛? error
- F09 L3b锛歚tests/navigation-shell.test.ts` 鑷姩鍖栬鐩栭粯璁よ繘鍏ヤ粖鏃ヤ换鍔°€佸簳閮?tab 椤哄簭銆乼ab 椤甸潰娉ㄥ唽鍜?tab 椤典富璺緞 `switchTab`

- `2026-05-24` F10 宸插畬鎴愭牳蹇冪粍浠朵笌椤甸潰瑙嗚鏁寸悊锛氭柊澧?`TaskCard`銆乣TodayFocusCard`銆乣EmptyState`銆乣EnergySelector`锛屽苟鎺ュ叆 today銆乸lan-calendar銆乬oal-create銆乺eview銆乸rofile
- `npm.cmd run test -- ui-components today plan-calendar review`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?0 涓祴璇曢€氳繃
- `npm.cmd run verify:static`锛氶€氳繃
- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛
- `npm.cmd run check`锛氶€氳繃锛?2 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃锛宧arness gate 0 warning / 0 error
- `npm.cmd run verify:harness`锛氶€氳繃锛孎10 passing 鐘舵€佷笅 4 涓?feature锛? warning锛? error
- F10 L3b锛歚tests/ui-components.test.ts` 鑷姩鍖栬鐩栨牳蹇冪粍浠剁粨鏋勫拰涓昏椤甸潰鎺ュ叆锛泃oday/calendar/review 鏃㈡湁璺緞娴嬭瘯缁х画閫氳繃

- `2026-05-24` F11 宸插畬鎴?Deepseek 涓庡缃楁墿灞曟帴鍙ｉ鐣欙細鏂板 `AiTodaySuggestion`銆乣TarotDraw`銆丄I suggestion schema銆乼arot fallback 鍜?`today-suggestion` 鎵╁睍鍏ュ彛锛涙湭鎺ュ叆鐪熷疄 Deepseek 缃戠粶璇锋眰銆佷簯鍑芥暟銆佸畬鏁村缃?UI 鎴栭殣绉佹暟鎹笂浼犮€?- `npm.cmd run test -- ai-tarot-contract today-suggestion`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?0 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛銆?- `npm.cmd run check`锛氶€氳繃锛?4 涓祴璇曟枃浠躲€?0 涓祴璇曢€氳繃锛孎11 passing 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F11 L3b锛歚tests/today-suggestion.test.ts` 鑷姩鍖栬鐩栨棤 AI 鍑嵁 fallback銆佸彲閫?TarotDraw 褰卞搷琛ㄨ揪銆丄I 鎺掑簭/琛ㄨ揪褰卞搷鍜屼笉淇敼鍘熷 DailyPlan/Task.status锛沗tests/ai-tarot-contract.test.ts` 鑷姩鍖栬鐩栧缃楁枃妗堣竟鐣屻€丄I schema 杈圭晫鍜?typed fallback銆?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎11 passing 鐘舵€佷笅 4 涓?feature 鍏ㄩ儴 passing锛? warning / 0 error銆?- `2026-05-26` 宸插紑濮嬩笅涓€闃舵鏁版嵁妯″瀷鏁寸悊锛屽厛琛ユ灦鏋勬枃妗ｏ紝涓嶄慨鏀逛笟鍔′唬鐮侊細鏂板 `docs/architecture/goal-plan-task-state-model.md` 浣滀负 Goal / Plan / Stage / Task 鐩爣妯″瀷鍚堝悓銆?- `2026-05-26` 宸叉洿鏂?`docs/architecture/data-models.md`銆乣docs/architecture/services-boundary.md`銆乣docs/architecture/storage-strategy.md`锛屾槑纭綋鍓嶄唬鐮佷粛浠?`DailyPlan[]` 涓哄吋瀹圭粨鏋勶紝鍚庣画搴旇縼绉诲埌 `Plan + Stage + Task`锛屽苟淇濈暀鏃ф暟鎹鍙栥€?- `2026-05-26` 宸叉洿鏂?`docs/harness/ARCHITECTURE.md` 鍜?`AGENTS.md`锛歚ARCHITECTURE.md` 浣滀负鏋舵瀯 README锛宍AGENTS.md` 澧炲姞鏁版嵁妯″瀷銆乻torage銆乻ervices 鐨勬寜闇€璇诲彇鍜岃縼绉荤害鏉熴€?- `2026-05-26` 宸插畬鎴?`models/` 涓?`services/` 鍒濇瀹¤锛氬綋鍓嶄富瑕侀闄╂槸 `models/plan.ts` 娣峰悎棰嗗煙妯″瀷鍜岄〉闈㈣鍥俱€乣planner/replanner/storage/today-suggestion/ai-client` 浠嶅己渚濊禆 `DailyPlan[]`锛屽悗缁簲鍏堟柊澧炵洰鏍囩被鍨嬪拰 legacy adapter锛屽啀閫愭杩佺Щ鏈嶅姟杈撳嚭銆?- `2026-05-26` 宸茬敓鎴?App v0.3 宸ヤ綔璁″垝锛歚docs/log/v0.3/work-plan.md`銆?- `2026-05-26` 宸茬敓鎴?App v0.3 鍔熻兘娓呭崟锛歚docs/log/v0.3/feature_list_v0.3.json`锛汧12 涓?`active`锛孎13-F17 鎸変緷璧栭『搴?`not_started`銆?- `2026-05-26` `scripts/harness-gate.mjs` 宸蹭粠鍥哄畾瑕佹眰 `completionGate.version: "v0.2"` 璋冩暣涓烘帴鍙?`v0.x` 鐗堟湰鏍煎紡锛宍docs/harness/verification-policy.md` 宸插悓姝ヨ鏄庛€?
- `2026-05-26` F12 宸插畬鎴愮洰鏍囨暟鎹ā鍨嬩笌 legacy adapter锛氭柊澧?`GoalStatus`銆乣PlanStatus`銆乣StageStatus`銆乣TaskType`銆乣Plan`銆乣Stage`銆乣PlanBundle`銆乣DailyTaskView`銆乣PlanProgress`锛屽苟鎻愪緵 `dailyPlansToPlanBundle()` / `planBundleToDailyPlans()` 鍙屽悜 adapter銆?- F12 鍏煎杈圭晫锛氭棫 `DailyPlan` 鏈垹闄わ紱鏃?`Task.date` 閫氳繃 adapter 鏄犲皠涓?`scheduledDate`锛沗DailyReview` 鏀寔鍙€?`taskResults`锛屾棫涓夌粍 task id 缁х画鍙锛涙湭淇敼 storage銆乸lanner銆乺eplanner銆乼oday-suggestion 鎴栭〉闈㈣繍琛屼富璺€?- `npm.cmd run test -- data-models-v0.3 data-layer`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?1 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛銆?- `npm.cmd run check`锛氶€氳繃锛?5 涓祴璇曟枃浠躲€?5 涓祴璇曢€氳繃锛孎12 active 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F12 L3b锛歚tests/data-models-v0.3.test.ts` 瑕嗙洊鏃?DailyPlan[] -> PlanBundle -> DailyPlan[]銆佹棫 Task.date 鏄犲皠銆丏ailyReview taskResults 鍏煎鍜?PlanProgress锛沗tests/data-layer.test.ts` 璇佹槑鏃т富璺緞浠嶅彲杩愯銆?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎12 passing 鐘舵€佷笅 6 涓?feature 涓?1 涓?passing銆? 涓?not_started锛? warning / 0 error銆?
- `2026-05-26` F13 宸插畬鎴?storage PlanBundle 璇诲啓涓庢棫鏁版嵁杩佺Щ锛氭柊澧?`savePlanBundle()`銆乣readPlanBundle()`銆乣getActivePlanBundle()`銆乣migrateLegacyDailyPlans()`锛屽綋鍓?active bundle key 涓?`plan-bundle:{goalId}`銆?- F13 鍏煎杈圭晫锛歚daily-plans:{goalId}` 鏃?key 缁х画鍙锛涜縼绉讳紭鍏堣繑鍥炲凡鏈?PlanBundle锛岄噸澶嶆墽琛屼笉閲嶅鐢熸垚浠诲姟锛屼笉瑕嗙洊宸叉湁 done/partial/skipped 鐘舵€侊紱鏈慨鏀?planner銆乺eplanner 鎴栭〉闈?UI銆?- `npm.cmd run test -- storage data-layer`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?5 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛銆?- `npm.cmd run check`锛氶€氳繃锛?5 涓祴璇曟枃浠躲€?0 涓祴璇曢€氳繃锛孎13 active 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F13 L3b锛歚tests/storage.test.ts` 瑕嗙洊鏃?daily-plans 鏈湴鏁版嵁杩佺Щ涓?PlanBundle銆佸箓绛夎縼绉汇€佸潖鏁版嵁銆佽寮傚父鍜屽啓寮傚父锛沗tests/data-layer.test.ts` 璇佹槑鏃т富璺緞浠嶅彲杩愯銆?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎13 passing 鐘舵€佷笅 6 涓?feature 涓?2 涓?passing銆? 涓?not_started锛? warning / 0 error銆?
- `2026-05-26` F14 宸插畬鎴?planner 杈撳嚭 PlanBundle锛氭柊澧?`buildStarterPlanBundle()`锛岃繎 7 澶╃敓鎴愬叿浣?Task锛岃繙鏈熷唴瀹硅繘鍏?Stage锛沗PlanBundle.plan` 涓嶅啓鍏?`dailyKeyword` 鎴?`recommendedFocusWindow`銆?- F14 鍏煎杈圭晫锛氭棫 `buildStarterPlan()` 缁х画閫氳繃 `buildLegacyDailyPlansFromBundle()` 杈撳嚭 `DailyPlan[]`锛涘垱寤虹洰鏍囬〉闈繚瀛樻柊 `PlanBundle`锛屽苟缁х画淇濆瓨 legacy `DailyPlan[]` 渚涙棫椤甸潰璇诲彇锛涙湭閲嶆瀯 replanner 鎴栨棩鍘嗛〉闈?UI銆?- `npm.cmd run test -- planner data-layer`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?3 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛銆?- `npm.cmd run check`锛氶€氳繃锛?5 涓祴璇曟枃浠躲€?3 涓祴璇曢€氳繃锛孎14 active 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F14 L3b锛歚tests/planner.test.ts` 瑕嗙洊 PlanBundle 杈撳嚭銆佽繎 7 澶?Task銆佽繙鏈?Stage銆佷綆鑳介噺鏈€浣庡畬鎴愮嚎鍜?PlanBundle 瀛樺偍锛沗tests/data-layer.test.ts` 瑕嗙洊淇濆瓨 PlanBundle + legacy DailyPlan[] 鍚庢棫 today-suggestion 璺緞浠嶅彲鐢ㄣ€?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎14 passing 鐘舵€佷笅 6 涓?feature 涓?3 涓?passing銆? 涓?not_started锛? warning / 0 error銆?
- `2026-05-26` F15 宸插畬鎴愪粖鏃ヤ笌鏃ュ巻瑙嗗浘鏈嶅姟杩佺Щ锛歚services/today-suggestion.ts` 鏂板 `buildTodaySuggestionFromPlanBundle()` 鍜?`buildTodaySuggestionFromDailyTaskViews()`锛宍models/plan.ts` 鏂板 `buildPlanBundleCalendarView()` 姹囨€昏繎 7 澶╀换鍔°€佽繙鏈?Stage銆佽繘搴﹀拰 plan status銆?- F15 AI 杈圭晫锛歚services/ai-client.ts` 鏂板 `requestTodayTaskSuggestion()`锛屾柊鍏ュ彛鍙帴鏀跺彈鎺х殑浠婃棩浠诲姟涓婁笅鏂囷紱鏃?`requestTodaySuggestion()` 缁х画鍏煎 `DailyPlan[]`锛屼絾浼氬厛鎻愬彇褰撳ぉ浠诲姟鍐嶅鎵樼粰鏂板叆鍙ｃ€?- F15 琛ㄨ揪/鎺掑簭杈圭晫锛欰I/濉旂綏浠嶅彧褰卞搷 task 鎺掑簭銆乨ailyKeyword銆乵inimumLine/caution 琛ㄨ揪锛屼笉鍐欏洖 `Task.status`銆乣DailyReview` 鎴栧巻鍙?`Plan`銆?- `npm.cmd run test -- today-suggestion ai-tarot-contract plan-calendar today`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?5 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛銆?- `npm.cmd run check`锛氶€氳繃锛?5 涓祴璇曟枃浠躲€?7 涓祴璇曢€氳繃锛孎15 active 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F15 L3b锛歚tests/today-suggestion.test.ts` 瑕嗙洊 PlanBundle/DailyTaskView -> TodaySuggestionView锛沗tests/plan-calendar.test.ts` 瑕嗙洊 PlanBundle -> 杩?7 澶╀换鍔?+ 杩滄湡 Stage + progress + plan status锛涢〉闈㈠叏闈㈡帴鍏ヤ繚鐣欏埌 F17銆?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎15 passing 鐘舵€佷笅 6 涓?feature 涓?4 涓?passing銆? 涓?not_started锛? warning / 0 error銆?
- `2026-05-26` F16 宸插畬鎴?replanner 鍩轰簬 Plan/Task 閲嶆帓锛氭柊澧?`replanPlanBundleAfterReview()`锛屼互 `PlanBundle + DailyReview + UserProfile` 鐢熸垚鏇存柊鍚庣殑 `PlanBundle` 鎴栨槑纭?`infeasible`銆?- F16 椤哄欢绛栫暐锛氫笉鐢熸垚琛ュ仛 Task锛屼繚鐣欏師 Task id 骞舵洿鏂?`scheduledDate`锛涢€氳繃 `rescheduledFromDate`銆乣rescheduledFromStatus`銆乣rescheduleReason` 璁板綍鏉ユ簮鍏崇郴銆?- F16 鍘嗗彶杈圭晫锛歞one 浠诲姟淇濈暀瀹屾垚鐘舵€侊紱partial/skipped 涓嶉潤榛樹涪澶憋紱`DailyReview` 浣滀负鍘嗗彶浜嬪疄淇濈暀锛宺eplanner 涓嶆敼鍐?review锛涘閲忎笉瓒虫椂杩斿洖 infeasible锛屼笉瑕嗙洊鍘?PlanBundle銆?- `npm.cmd run test -- replanner data-layer storage`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?5 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛銆?- `npm.cmd run check`锛氶€氳繃锛?5 涓祴璇曟枃浠躲€?1 涓祴璇曢€氳繃锛孎16 active 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F16 L3b锛歚tests/replanner.test.ts` 瑕嗙洊 PlanBundle 閲嶆帓銆佷换鍔″巻鍙层€佷笉鍙鐘舵€佸拰浣庤兘閲忓帇鍔涙帶鍒讹紱`tests/data-layer.test.ts` 瑕嗙洊淇濆瓨 PlanBundle -> 淇濆瓨 DailyReview -> 閲嶆帓 -> 淇濆瓨骞惰鍥?PlanBundle锛沗tests/storage.test.ts` 瑕嗙洊閲嶆帓杩借釜瀛楁璇诲啓銆?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎16 passing 鐘舵€佷笅 6 涓?feature 涓?5 涓?passing銆? 涓?not_started锛? warning / 0 error銆?
- `2026-05-26` F17 宸插畬鎴愰〉闈?UI 涓庢柊鏁版嵁瑙嗗浘鎺ュ叆锛氬垱寤虹洰鏍囬〉淇濆瓨 PlanBundle锛涗粖鏃ラ〉浣跨敤 `buildTodaySuggestionFromPlanBundle()`锛涙棩鍘嗛〉浣跨敤 `buildPlanBundleCalendarView()`锛涘鐩橀〉淇濆瓨 `DailyReview.taskResults` 鍚庤皟鐢?`replanPlanBundleAfterReview()`锛涙垜鐨勯〉浣跨敤 `buildPlanProgress()`銆?- F17 鍏煎杈圭晫锛歵oday/calendar/review/profile 鍧囬€氳繃 `migrateLegacyDailyPlans()` 鍏煎鏃?`DailyPlan[]` 鏈湴鏁版嵁锛況eview 閲嶆帓鎴愬姛鍚庡悓鏃跺洖鍐?PlanBundle 鍜?legacy DailyPlan[]锛屾棫椤甸潰璺緞浠嶅彲鎺с€?- `npm.cmd run test -- today plan-calendar goal-create review ui-components navigation-shell`锛氶€氳繃锛? 涓祴璇曟枃浠躲€?9 涓祴璇曢€氳繃銆?- `npm.cmd run verify:static`锛氶€氳繃銆?- `npm.cmd run verify:system`锛氶€氳繃锛宍build:mp-weixin` 鏋勫缓鎴愬姛锛宼oday/calendar/goal-create/review/profile 椤甸潰 wxml 浜х墿鍧囧瓨鍦ㄣ€?- `npm.cmd run check`锛氶€氳繃锛?5 涓祴璇曟枃浠躲€?2 涓祴璇曢€氳繃锛孎17 active 鐘舵€佷笅 harness gate 0 warning / 0 error銆?- F17 L3b/manual smoke锛氭瀯寤轰骇鐗╂鏌ョ‘璁や簲涓〉闈骇鐗╁瓨鍦紱婧愮爜璺緞妫€鏌ョ‘璁ゆ柊 PlanBundle銆乴egacy migration銆乺eplanner 鍜?progress 鍏ュ彛鍧囨帴鍏ワ紱鏃犳暟鎹矾寰勭敱 EmptyState 瑕嗙洊锛涢〉闈㈡病鏈夋妸濉旂綏銆丮BTI銆佹瘡鏃ュ叧閿瘝浣滀负浠诲姟鍐崇瓥渚濇嵁銆?
- `npm.cmd run verify:harness`锛氶€氳繃锛孎17 passing 鐘舵€佷笅 6 涓?feature 鍏ㄩ儴 passing锛? warning / 0 error銆?
## 闃诲椤?
- F01 鏃犲墿浣欓樆濉為」锛孉05 鏈€缁堥〉闈㈡墜鍔ㄥ啋鐑熷凡鐢辩敤鎴风‘璁ら€氳繃
- F02 鏃犲墿浣欓樆濉為」
- F03 鏃犲墿浣欓樆濉為」
- F04 鏃犲墿浣欓樆濉為」
- F05 鏃犲墿浣欓樆濉為」
- F06 鏃犲墿浣欓樆濉為」
- F07 鏃犲墿浣欓樆濉為」

## 涓嬩竴姝?
- v0.3 F12-F17 宸插叏閮ㄥ畬鎴愬苟閫氳繃闂ㄧ锛汧18銆丗19 涓?2026-05-27 瀹¤鍚庤ˉ鍏呯殑鍚庣画淇椤广€?
## 浜ゆ帴璇存槑

- 浠诲姟寮€濮嬪厛璇?`docs/harness/features/feature-index.json`銆佹湰鏂囦欢锛屽啀璇诲彇褰撳墠 feature 鐨?`feature_folder/feature.json`
- 瀹屾垚鍒ゆ柇鎸?`docs/harness/verification-policy.md`
- 澶辫触璇︽儏鎴栨墜鍔ㄥ啋鐑熻鎯呭啓鍏?`docs/log/`
