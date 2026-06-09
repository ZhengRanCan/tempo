# progress.md

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
- 当前 `active` feature：无。状态：F20-F27 均为 `passing`。

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

## F25 passing 2026-06-06

- `F25` 今日任务页重设计已完成并置为 `passing`。
- 用户人工视觉确认原文：`不赖，当前界面看着还可以。标记完成吧，F25`。该确认满足 F25 `verification.md` 对参考图人工视觉对照的硬门禁。
- 最终可见结果：今日页作为执行台，首屏突出今日重点任务卡；主卡包含目标上下文、任务标题、预计时间、优先级、最低完成线、今日任务数量入口、开始专注和标记完成；状态卡、AI 今日建议和晚间复盘入口均使用 `static/icons/page/today/` 下的正式 PNG 图标作为扫描锚点。
- 图标资源修复：今日页图标已从运行时 `:src` 对象绑定改为静态 `src="/static/icons/page/today/*.png"`，避免微信渲染层出现 `/pages/today/[object Object]...` 本地图片加载错误；相关回归测试已覆盖 `todayIconPaths` 和 `:src="` 不得重新出现。
- 构建入口确认：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`；本轮已刷新 `dist/dev/mp-weixin`，并确认 `dist/dev/mp-weixin/static/icons/page/today/` 存在 `star.png`、`clock.png`、`flag.png`、`list.png`、`status-wave.png`、`sparkle.png`、`moon.png`。
- 自动化验证：`npm.cmd run test -- today today-suggestion review ui-components navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness` 均通过。
- 边界确认：未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑；未修改任务日历、创建目标、我的页页面结构；无 knownUnverified。
- 当前 `active` feature：无。状态：F20-F25 均为 `passing`。

## F24 passing 2026-06-03

- `F24` UI 统一样式基线已完成并置为 `passing`。
- 新增 `styles/ui.scss` 作为共享 Sass 基线，统一 canvas/surface/accent token、page-shell、card、primary/secondary/text button、status-tag、option-chip、soft-block 等规则；`App.vue`、四个主 Tab 页和 `AppPageHeader`、`TaskCard`、`TodayFocusCard`、`EmptyState`、`EnergySelector` 已接入该基线。
- `pages.json` 仅调整原生视觉色值：navigation/background 对齐 `#faf8f3`，TabBar background 对齐 `#ffffff`；未修改页面顺序、TabBar list 或路由。
- 相对 F20-F23 的可见变化：今日页的重点任务卡、状态卡、AI 建议和复盘入口统一为同一套卡片外壳，文本按钮降级为透明入口；日历页的目标计划、进度、7 天选择、远期阶段和建议卡统一圆角/边框/阴影；创建目标页的步骤卡、输入框、时间选项和偏好选项使用统一卡片与 option chip；我的页的目标、偏好、表达、最近推进和设置入口统一 panel、按钮和状态标签层级。
- 视觉检查矩阵：Today 有任务状态检查 `<TodayFocusCard>` 仍为首个业务焦点；Today 无目标/无任务状态检查 `EmptyState` 动作入口；Calendar DDL 7 天内状态由 `tests/plan-calendar.test.ts` 的 tight pressure case 和 `progress-card` 产物覆盖；Calendar DDL 超过 7 天/远期阶段由 long bundle case 与 `stage-panel` 产物覆盖；Create Goal 初始输入状态检查 `step-list`、输入框和禁用主按钮；Create Goal 偏好展开状态检查 `preference-step`、`EnergySelector` 和 option chip；Profile 有目标状态检查 `goal-card`、进度和主/次按钮；Profile 无目标状态检查 `profile-empty` + `EmptyState`。
- 构建入口检查：`project.config.json.miniprogramRoot` 当前为 `dist/dev/mp-weixin/`，现有 dev watcher 已在 `2026-06-03 19:26:12` 刷新 dev 产物；`npm.cmd run verify:system` 已在 `2026-06-03 19:26:35` 刷新 `dist/build/mp-weixin`。两边 `app.json` 均包含 `navigationBarBackgroundColor: "#faf8f3"`、`backgroundColor: "#faf8f3"` 和 TabBar `backgroundColor: "#ffffff"`，四个主 Tab WXSS 均包含 F24 page/card 基线。
- 自动化结果：`npm.cmd run test -- ui-components navigation-shell today plan-calendar goal-create user-profile` 通过，54 个测试通过；`npm.cmd run verify:static` 通过；`npm.cmd run verify:system` 通过，仅有 Sass legacy JS API warning；`npm.cmd run verify:harness` 通过，仍有 F01-F07 legacy `completionGate` warning。
- 本轮没有使用微信开发者工具截图；按 F24 `verification.md` 允许的“人工记录”方式，用源码、测试和 dev/build mp-weixin 产物完成视觉矩阵检查。所有矩阵状态均可构造，未记录无法验证状态。
- 已确认未修改 `models/`、`services/`、`schemas/`、storage key、planner、replanner、AI/tarot 业务逻辑。当前工作树中 `docs/harness/verification-policy.md` 与 `docs/harness/instrumentation.md` 已不存在，F24 本轮按 feature 自带 `verification.md` 执行门禁。

## F24 feature design 2026-06-03

- ??? F24?`docs/harness/features/individual_feature/F24-ui-overall-design/feature.md`?
- F24 ?? Markdown feature ?????`feature.md` ????????????? acceptance?`verification.md` ????????????? passing ?????`ref/image/README.md` ???????????
- `docs/harness/features/feature-index.json` ??? F24???? `not_started`???? `v0.3`?
- F24 ???? UI ?????????? UI ???????????????????? F24 ?? `active`??? `verification.md` ?????????
- `scripts/harness-gate.mjs` ??? feature registry ????? legacy `feature.json` ??? Markdown feature ???

## Feature registry migration 2026-06-01

- 已创建 `docs/harness/features/feature-index.json` 作为当前 feature 轻量索引。
- 已将 F01-F23 拆分到 `docs/harness/features/individual_feature/<feature-id>/feature.json`。
- 来源映射：F01-F07 来自 `docs/log/v0.1/feature_list_v0.1.json`；F08-F11 来自 `docs/log/v0.2/feature_list_v0.2.json`；F12-F19 来自 `docs/log/v0.3/feature_list.json`；F20-F23 来自 `docs/log/v0.2/feature_list_v3_v2.json`。
- `docs/log/v0.1/feature_list.json` 当前不包含 F01-F07，因此 v0.1 迁移源以 `docs/log/v0.1/feature_list_v0.1.json` 为准。
- `AGENTS.md` 已切换为先读 feature index，再读取当前 feature 的 `feature.json`。
- `scripts/harness-gate.mjs` 已支持 feature index 并展开单个 feature 合同；`npm.cmd run verify:harness` 默认校验新 registry。

## UI visibility fix 2026-06-01

- 发现微信开发者工具入口 `project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`，而当前系统验证和实际构建命令 `npm.cmd run verify:system` / `build:mp-weixin` 生成的是 `dist/build/mp-weixin/`。
- `dist/dev/mp-weixin/` 仍是 2026-05-24 到 2026-05-26 的旧产物，导致开发者工具中看不到 F20-F23 的新版 UI。
- 已将 `project.config.json.miniprogramRoot` 对齐到 `dist/build/mp-weixin/`，并在 `tests/navigation-shell.test.ts` 增加配置一致性测试，避免后续再次出现“构建成功但开发者工具看旧目录”的问题。

## Native navigation duplicate title fix 2026-06-01

- 实机截图确认 F23 步骤式卡片已经生效，但微信原生导航栏标题和正文 `AppPageHeader` 标题重复，且页面顶部仍保留 `96rpx` 大留白，视觉上像旧版头图区仍存在。
- 已将 `AppPageHeader` 收口为正文轻提示和可选 action，不再渲染同名大标题；五个页面的顶部 padding 调整为 `32rpx 32rpx 48rpx`，让原生导航栏下方直接进入页面核心内容。
- 本地开发入口重新对齐到 `dist/dev/mp-weixin/`，匹配 `npm.cmd run dev:mp-weixin` 的输出目录；`tests/navigation-shell.test.ts` 增加该约束。
- 已通过 `npm.cmd run test -- ui-components navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`；dev/build 产物均确认不再包含正文 title。

## F23 update 2026-05-31

- `F23` 创建目标与我的页收口已完成并置为 `passing`；F20-F23 当前轻量 UI 清单已全部完成。
- `pages/goal-create/index.vue` 已改为步骤式卡片，按目标名称、截止日期、每日可用时间、补充说明、个性化安排偏好组织输入；偏好默认展开，包含工作时段、能量状态、仪式感表达和 MBTI。
- 创建页仍只负责创建 Goal、保存 UserProfile、生成并保存 PlanBundle，同时写入 legacy DailyPlan[] 兼容视图；页面不展示任务日历或执行任务。
- `pages/profile/index.vue` 已收口为当前目标、默认安排偏好、AI 表达与仪式感、最近推进和设置入口；有目标时提供查看计划/管理目标动作，无目标时突出创建目标。
- 边界：不新增多目标完整管理、不新增完整设置页、不接入真实 Deepseek，不改变 PlanBundle、Goal、UserProfile 持久化结构或 storage key。
- 已通过 `npm.cmd run test -- goal-create user-profile ui-components navigation-shell data-layer`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。

## F22 update 2026-05-31

- `F22` 任务日历计划板已完成并置为 `passing`；下一步按依赖启动 `F23` 创建目标与我的页收口。
- `pages/plan-calendar/index.vue` 已收口为目标计划板，展示当前目标、整体进度、时间压力、近 7 天任务、远期阶段和轻量调整计划入口。
- 边界：继续通过 `migrateLegacyDailyPlans()`、`buildPlanBundleCalendarView()` 和 plan-view 视图模型读取 Goal/Plan/Stage/Task，不改 PlanBundle 持久化结构、storage key 或 replanner 顺延策略。
- 已通过 `npm.cmd run test -- plan-calendar ui-components data-layer`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。

## F21 update 2026-05-31

- `F21` 今日任务执行台改造已完成并置为 `passing`；下一步按依赖启动 `F22` 任务日历计划板。
- 今日页首屏改为执行台信息层级：`TodayFocusCard` 是有任务状态下的第一张核心卡，只突出一个 focus task；多任务通过“今日共 N 个任务 / 查看全部”的轻量展开入口处理。
- 今日状态卡展示能量、可用时间、当前状态和管理入口；AI 今日建议限制为最多 3 条短句；晚间复盘保留为轻量入口并跳转到 `pages/review/index`。
- 数据读取继续经由 `migrateLegacyDailyPlans()` 与 `buildTodaySuggestionFromPlanBundle()` / `TodaySuggestionView`，页面未直接拼装底层 Plan/Stage/Task 存储结构，也未修改 planner、replanner、storage key 或任务状态写回逻辑。
- 已通过 `npm.cmd run test -- today today-suggestion review ui-components`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。

## Current handoff 2026-05-31

- `2026-05-31` 新增 `docs/design/page/02-f20-page-shell-component-baseline.md`，用于把 F20 的页面壳、TabBar 协同、组件基线、禁止项和验收点写成执行级设计合约。
- `F20` 的 behavior 与 docs 引用已同步更新到 `docs/log/v0.2/feature_list_v3_v2.json` 和 `docs/log/v0.3/feature_list_v0.3.json`。

- 当前 UI 改造入口已切换为 `docs/harness/features/feature-index.json`。
- `docs/log/v0.2/feature_list_v3_v2.json` 只保留 F20-F23，用于降低后续 UI 任务的上下文占用。
- `docs/log/v0.3/feature_list_v0.3.json` 保留为 F12-F23 的完整历史清单，不再作为默认任务入口。
- 当前 `active` feature：无。
- `npm.cmd run verify:harness` 默认校验轻量清单；如需校验完整历史清单，可设置 `HARNESS_FEATURE_LIST=docs/log/v0.3/feature_list_v0.3.json` 后运行。

## 当前 feature

- 当前 `active` feature：无
- 状态：F20-F24 均为 `passing`

## 当前状态

- 项目阶段：App v0.3 数据模型与服务迁移已完成，UI 改造已完成 F20 页面壳与组件基线、F21 今日任务执行台、F22 任务日历计划板、F23 创建目标与我的页收口、F24 UI 统一样式基线。
- Harness 状态：F12-F24 已 `passing`；当前 feature registry 中 F01-F24 均为 `passing`。
- 当前工作功能清单位置：`docs/harness/features/feature-index.json`

## 功能状态摘要

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
- v0.3 版本化功能清单位置：`docs/log/v0.3/feature_list_v0.3.json`
- v0.2 版本化功能清单位置：`docs/log/v0.2/feature_list_v0.2.json`
- v0.1 归档功能清单位置：`docs/log/v0.1/feature_list.json`

## 最近完成

- `2026-05-31` F20 已完成页面壳与全局组件基线：五个页面使用 `AppPageHeader`，移除正文重复标题/eyebrow 样式和 today/calendar/profile 的同级 TabBar 入口按钮，组件外壳样式收敛到共享组件；未修改数据、storage、planner、replanner 或 AI/tarot 逻辑。
- `npm.cmd run test -- ui-components navigation-shell today plan-calendar review` 通过：36 个测试通过。
- `npm.cmd run verify:static` 通过。
- `npm.cmd run verify:system` 通过，mp-weixin 构建成功，仅有 Sass legacy API warning。
- `npm.cmd run verify:harness` 通过：4 个 feature，1 个 passing，3 个 not_started，0 warning / 0 error。
- `2026-05-31` 已在 `docs/log/v0.3/feature_list_v0.3.json` 追加 UI 改造任务 F20-F23。
- F20：页面壳与全局组件基线。
- F21：今日任务执行台。
- F22：任务日历计划板。
- F23：创建目标与我的页收口。
- 这些任务按 F20 -> F21 -> F22 -> F23 串行依赖，后续 agent 不应同时实现多个 UI feature。

- 将红框中的项目地图、约束、规格和初始化文档移动到 `docs/harness/`
- 保留 `docs/progress.md` 和 `docs/decisions.md` 作为主文件
- 将后续流水记录目录调整为 `docs/log/`
- 同步 `AGENTS.md` 和 harness 文档中的路径引用
- 实现 F01 创建目标页面：目标名称、截止日期、每日可用时间、可选说明、校验提示和保存反馈
- 在 `models/goal.ts` 增加创建目标输入校验与目标构建逻辑
- 新增 `tests/goal-create.test.ts` 覆盖必填校验、无效时间校验和统一 storage 保存入口
- 修复 F01 手动冒烟发现的问题：截止日期不能早于今天，页面按 `docs/harness/DESIGN.md` 和 `docs/design/visual-system.md` 调整为暖白画布、surface 表单区、accent 主按钮和低压力提示

## 当前验证状态

- `docs/log/v0.2/feature_list_v0.2.json`：v0.2 归档功能清单，4 个 feature，0 个 active，1 个 passing，3 个 not_started
- `npm.cmd run test -- goal-create`：通过，6 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，2 个测试文件、7 个测试通过
- `2026-05-23` 用户确认 F01 最终手动冒烟通过
- `2026-05-23` F02 已按功能选择规则启动并完成验证
- `npm.cmd run test -- user-profile`：通过，4 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，3 个测试文件、11 个测试通过
- F02 mixed verification：页面已提供偏好工作时段、当前能量状态、可选 MBTI 和保存偏好动作；自动化测试覆盖统一 storage 保存和约束边界
- `2026-05-23` F03 已按功能选择规则启动并完成验证
- `npm.cmd run test -- planner`：通过，2 个 planner 测试文件、9 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，4 个测试文件、19 个测试通过
- F03 实现确定性初始拆解：不调用真实 AI；按日期生成 DailyPlan；每日任务总时长不超过 dailyAvailableMinutes；每个任务包含标题、预计时长、优先级和最低完成线；不可行时返回 infeasible
- `2026-05-23` 手动测试发现 F03 集成缺口：点击 goal-create 的“生成计划”只保存目标和偏好，未调用 planner 生成并保存 DailyPlan；已定位为页面入口未串联 planner
- `2026-05-23` F03 集成缺口已修复：goal-create 的“生成计划”现在会构建 UserProfile、调用 buildStarterPlan，并通过 saveDailyPlans 保存 DailyPlan[]
- `2026-05-23` F04 已按功能选择规则启动并完成验证，用户确认最终手动冒烟通过
- `npm.cmd run test -- plan-calendar`：通过，4 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，5 个测试文件、23 个测试通过
- F04 自动化实现已完成：任务日历页读取当前目标与 DailyPlan，默认展示最近 7 天，任务卡片显示状态、预计时长、优先级和最低完成线；无计划时显示低压力空状态；今日任务入口注册为占位页
- `2026-05-23` 用户确认 F04 最终手动冒烟通过
- `2026-05-23` F05 已按功能选择规则启动并完成验证
- `npm.cmd run test -- today`：通过，6 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，6 个测试文件、29 个测试通过
- F05 实现今日任务页：读取当前目标、DailyPlan 和 UserProfile；显示今日最重要任务、最低完成线、推荐专注时段、能量状态提示和今日任务列表；低能量状态优先降低压力
- `2026-05-23` F06 已按功能选择规则启动并完成验证
- `npm.cmd run test -- review`：通过，5 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，7 个测试文件、34 个测试通过
- F06 实现晚间复盘页：可记录任务已完成、部分完成或未完成；可记录今日能量状态；可保存可选备注；备注为空时仍保存结构化 DailyReview
- `2026-05-23` F07 已按功能选择规则启动并完成验证
- `npm.cmd run test -- replanner`：通过，5 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，8 个测试文件、39 个测试通过
- F07 实现自动重排后续计划：根据晚间复盘把部分完成和未完成任务转成后续补做任务；高优先级任务优先排入后续日期；每日任务总时长不超过 `dailyAvailableMinutes`；复盘当天已完成、部分完成和跳过状态作为历史保留；不可行时返回 `infeasible` 和调整建议
- 已知：PowerShell 直接执行 `npm run check` 会被本机 execution policy 拦截，当前环境使用 `npm.cmd run check`
- `2026-05-24` harness 第三层已从纯文档规则升级为轻量门禁：新增 `scripts/harness-gate.mjs` 和 `docs/log/smoke-template.md`
- `2026-05-24` `package.json` 已新增 `verify:harness`，并接入 `npm run check`
- `2026-05-24` `docs/harness/verification-policy.md` 已把 L3 拆为 L3a 系统构建确认和 L3b 用户路径证据；新 active feature 必须定义 `completionGate`
- `2026-05-24` 调试/验证文档已收敛：人工评估表并入 `docs/harness/verification-policy.md`，`docs/harness/instrumentation.md` 改为记录位置速查，删除独立评估文档
- `2026-05-24` `docs/template/**` 已加入 ESLint ignore，避免下载的教程示例代码参与项目 lint
- `npm.cmd run verify:harness`：通过；当前 7 个旧 feature 缺少 `completionGate`，脚本以 legacy warning 汇总，不阻塞 v0.1 基线
- `npm.cmd run check`：通过，8 个测试文件、39 个测试通过；新增 harness gate 也通过
- `2026-05-24` 调试/验证文档收敛后重新执行 `npm.cmd run check`：通过，8 个测试文件、39 个测试通过；仍只有 F01-F07 legacy `completionGate` warning
- `2026-05-24` v0.1 功能清单已归档到 `docs/log/v0.1/feature_list_v0.1.json`
- `2026-05-24` v0.2 工作计划已写入 `docs/log/v0.2/work-plan.md`
- `2026-05-24` v0.2 功能清单已生成，迁移后归档为 `docs/log/v0.2/feature_list_v0.2.json`；F08 为 active，F09-F11 按依赖顺序 not_started
- `2026-05-24` v0.2 清单生成后执行 `npm.cmd run verify:harness`：通过，4 个 feature，1 个 active，3 个 not_started，0 warning，0 error
- `2026-05-24` v0.2 清单生成后执行 `npm.cmd run check`：通过，8 个测试文件、39 个测试通过，mp-weixin 构建通过，harness gate 通过
- `2026-05-24` v0.2 UI 规则已补充：F09/F10 明确要求先遵守 `docs/harness/DESIGN.md`，再读取 `docs/design/visual-system.md` 和 `docs/design/components.md`；`docs/design/components.md` 与 `docs/design/pages.md` 已清理为 v0.2 口径

- `2026-05-24` F08 已完成数据层整理与兼容边界：新增旧数据 normalize 兼容、storage `read*` 明确状态结果、`today-suggestion` 计算视图服务；未引入真实 Deepseek、塔罗 UI 或云端存储
- `npm.cmd run test -- data-layer storage`：通过，2 个测试文件、11 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，10 个测试文件、49 个测试通过，harness gate 0 warning / 0 error
- `npm.cmd run verify:harness`：通过，F08 passing 状态下 4 个 feature，0 warning，0 error
- F08 L3b：`tests/data-layer.test.ts` 自动化覆盖“创建目标 -> 保存计划 -> 打开今日任务生成建议视图”和“无本地数据 -> 明确空结果”两条用户路径

- `2026-05-24` F09 已完成导航壳与页面顺序：`pages.json` 将 today 设为第一入口，底部 tab 为 今日/日历/创建/我的，新增 `pages/profile/index.vue` 和 `components/AppPageHeader.vue`
- `npm.cmd run test -- navigation-shell`：通过，1 个测试文件、5 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功，profile/today/plan-calendar/goal-create 页面 wxml/json 产物存在
- `npm.cmd run check`：通过，11 个测试文件、54 个测试通过，harness gate 0 warning / 0 error
- `npm.cmd run verify:harness`：通过，F09 passing 状态下 4 个 feature，0 warning，0 error
- F09 L3b：`tests/navigation-shell.test.ts` 自动化覆盖默认进入今日任务、底部 tab 顺序、tab 页面注册和 tab 页主路径 `switchTab`

- `2026-05-24` F10 已完成核心组件与页面视觉整理：新增 `TaskCard`、`TodayFocusCard`、`EmptyState`、`EnergySelector`，并接入 today、plan-calendar、goal-create、review、profile
- `npm.cmd run test -- ui-components today plan-calendar review`：通过，4 个测试文件、20 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，12 个测试文件、59 个测试通过，harness gate 0 warning / 0 error
- `npm.cmd run verify:harness`：通过，F10 passing 状态下 4 个 feature，0 warning，0 error
- F10 L3b：`tests/ui-components.test.ts` 自动化覆盖核心组件结构和主要页面接入；today/calendar/review 既有路径测试继续通过

- `2026-05-24` F11 已完成 Deepseek 与塔罗扩展接口预留：新增 `AiTodaySuggestion`、`TarotDraw`、AI suggestion schema、tarot fallback 和 `today-suggestion` 扩展入口；未接入真实 Deepseek 网络请求、云函数、完整塔罗 UI 或隐私数据上传。
- `npm.cmd run test -- ai-tarot-contract today-suggestion`：通过，2 个测试文件、10 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，14 个测试文件、70 个测试通过，F11 passing 状态下 harness gate 0 warning / 0 error。
- F11 L3b：`tests/today-suggestion.test.ts` 自动化覆盖无 AI 凭据 fallback、可选 TarotDraw 影响表达、AI 排序/表达影响和不修改原始 DailyPlan/Task.status；`tests/ai-tarot-contract.test.ts` 自动化覆盖塔罗文案边界、AI schema 边界和 typed fallback。

- `npm.cmd run verify:harness`：通过，F11 passing 状态下 4 个 feature 全部 passing，0 warning / 0 error。
- `2026-05-26` 已开始下一阶段数据模型整理，先补架构文档，不修改业务代码：新增 `docs/architecture/goal-plan-task-state-model.md` 作为 Goal / Plan / Stage / Task 目标模型合同。
- `2026-05-26` 已更新 `docs/architecture/data-models.md`、`docs/architecture/services-boundary.md`、`docs/architecture/storage-strategy.md`，明确当前代码仍以 `DailyPlan[]` 为兼容结构，后续应迁移到 `Plan + Stage + Task`，并保留旧数据读取。
- `2026-05-26` 已更新 `docs/harness/ARCHITECTURE.md` 和 `AGENTS.md`：`ARCHITECTURE.md` 作为架构 README，`AGENTS.md` 增加数据模型、storage、services 的按需读取和迁移约束。
- `2026-05-26` 已完成 `models/` 与 `services/` 初步审计：当前主要风险是 `models/plan.ts` 混合领域模型和页面视图、`planner/replanner/storage/today-suggestion/ai-client` 仍强依赖 `DailyPlan[]`，后续应先新增目标类型和 legacy adapter，再逐步迁移服务输出。
- `2026-05-26` 已生成 App v0.3 工作计划：`docs/log/v0.3/work-plan.md`。
- `2026-05-26` 已生成 App v0.3 功能清单：`docs/log/v0.3/feature_list_v0.3.json`；F12 为 `active`，F13-F17 按依赖顺序 `not_started`。
- `2026-05-26` `scripts/harness-gate.mjs` 已从固定要求 `completionGate.version: "v0.2"` 调整为接受 `v0.x` 版本格式，`docs/harness/verification-policy.md` 已同步说明。

- `2026-05-26` F12 已完成目标数据模型与 legacy adapter：新增 `GoalStatus`、`PlanStatus`、`StageStatus`、`TaskType`、`Plan`、`Stage`、`PlanBundle`、`DailyTaskView`、`PlanProgress`，并提供 `dailyPlansToPlanBundle()` / `planBundleToDailyPlans()` 双向 adapter。
- F12 兼容边界：旧 `DailyPlan` 未删除；旧 `Task.date` 通过 adapter 映射为 `scheduledDate`；`DailyReview` 支持可选 `taskResults`，旧三组 task id 继续可读；未修改 storage、planner、replanner、today-suggestion 或页面运行主路。
- `npm.cmd run test -- data-models-v0.3 data-layer`：通过，2 个测试文件、11 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，15 个测试文件、75 个测试通过，F12 active 状态下 harness gate 0 warning / 0 error。
- F12 L3b：`tests/data-models-v0.3.test.ts` 覆盖旧 DailyPlan[] -> PlanBundle -> DailyPlan[]、旧 Task.date 映射、DailyReview taskResults 兼容和 PlanProgress；`tests/data-layer.test.ts` 证明旧主路径仍可运行。

- `npm.cmd run verify:harness`：通过，F12 passing 状态下 6 个 feature 中 1 个 passing、5 个 not_started，0 warning / 0 error。

- `2026-05-26` F13 已完成 storage PlanBundle 读写与旧数据迁移：新增 `savePlanBundle()`、`readPlanBundle()`、`getActivePlanBundle()`、`migrateLegacyDailyPlans()`，当前 active bundle key 为 `plan-bundle:{goalId}`。
- F13 兼容边界：`daily-plans:{goalId}` 旧 key 继续可读；迁移优先返回已有 PlanBundle，重复执行不重复生成任务，不覆盖已有 done/partial/skipped 状态；未修改 planner、replanner 或页面 UI。
- `npm.cmd run test -- storage data-layer`：通过，2 个测试文件、15 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，15 个测试文件、80 个测试通过，F13 active 状态下 harness gate 0 warning / 0 error。
- F13 L3b：`tests/storage.test.ts` 覆盖旧 daily-plans 本地数据迁移为 PlanBundle、幂等迁移、坏数据、读异常和写异常；`tests/data-layer.test.ts` 证明旧主路径仍可运行。

- `npm.cmd run verify:harness`：通过，F13 passing 状态下 6 个 feature 中 2 个 passing、4 个 not_started，0 warning / 0 error。

- `2026-05-26` F14 已完成 planner 输出 PlanBundle：新增 `buildStarterPlanBundle()`，近 7 天生成具体 Task，远期内容进入 Stage；`PlanBundle.plan` 不写入 `dailyKeyword` 或 `recommendedFocusWindow`。
- F14 兼容边界：旧 `buildStarterPlan()` 继续通过 `buildLegacyDailyPlansFromBundle()` 输出 `DailyPlan[]`；创建目标页面保存新 `PlanBundle`，并继续保存 legacy `DailyPlan[]` 供旧页面读取；未重构 replanner 或日历页面 UI。
- `npm.cmd run test -- planner data-layer`：通过，4 个测试文件、23 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，15 个测试文件、83 个测试通过，F14 active 状态下 harness gate 0 warning / 0 error。
- F14 L3b：`tests/planner.test.ts` 覆盖 PlanBundle 输出、近 7 天 Task、远期 Stage、低能量最低完成线和 PlanBundle 存储；`tests/data-layer.test.ts` 覆盖保存 PlanBundle + legacy DailyPlan[] 后旧 today-suggestion 路径仍可用。

- `npm.cmd run verify:harness`：通过，F14 passing 状态下 6 个 feature 中 3 个 passing、3 个 not_started，0 warning / 0 error。

- `2026-05-26` F15 已完成今日与日历视图服务迁移：`services/today-suggestion.ts` 新增 `buildTodaySuggestionFromPlanBundle()` 和 `buildTodaySuggestionFromDailyTaskViews()`，`models/plan.ts` 新增 `buildPlanBundleCalendarView()` 汇总近 7 天任务、远期 Stage、进度和 plan status。
- F15 AI 边界：`services/ai-client.ts` 新增 `requestTodayTaskSuggestion()`，新入口只接收受控的今日任务上下文；旧 `requestTodaySuggestion()` 继续兼容 `DailyPlan[]`，但会先提取当天任务再委托给新入口。
- F15 表达/排序边界：AI/塔罗仍只影响 task 排序、dailyKeyword、minimumLine/caution 表达，不写回 `Task.status`、`DailyReview` 或历史 `Plan`。
- `npm.cmd run test -- today-suggestion ai-tarot-contract plan-calendar today`：通过，4 个测试文件、25 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，15 个测试文件、87 个测试通过，F15 active 状态下 harness gate 0 warning / 0 error。
- F15 L3b：`tests/today-suggestion.test.ts` 覆盖 PlanBundle/DailyTaskView -> TodaySuggestionView；`tests/plan-calendar.test.ts` 覆盖 PlanBundle -> 近 7 天任务 + 远期 Stage + progress + plan status；页面全面接入保留到 F17。

- `npm.cmd run verify:harness`：通过，F15 passing 状态下 6 个 feature 中 4 个 passing、2 个 not_started，0 warning / 0 error。

- `2026-05-26` F16 已完成 replanner 基于 Plan/Task 重排：新增 `replanPlanBundleAfterReview()`，以 `PlanBundle + DailyReview + UserProfile` 生成更新后的 `PlanBundle` 或明确 `infeasible`。
- F16 顺延策略：不生成补做 Task，保留原 Task id 并更新 `scheduledDate`；通过 `rescheduledFromDate`、`rescheduledFromStatus`、`rescheduleReason` 记录来源关系。
- F16 历史边界：done 任务保留完成状态；partial/skipped 不静默丢失；`DailyReview` 作为历史事实保留，replanner 不改写 review；容量不足时返回 infeasible，不覆盖原 PlanBundle。
- `npm.cmd run test -- replanner data-layer storage`：通过，3 个测试文件、25 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，15 个测试文件、91 个测试通过，F16 active 状态下 harness gate 0 warning / 0 error。
- F16 L3b：`tests/replanner.test.ts` 覆盖 PlanBundle 重排、任务历史、不可行状态和低能量压力控制；`tests/data-layer.test.ts` 覆盖保存 PlanBundle -> 保存 DailyReview -> 重排 -> 保存并读回 PlanBundle；`tests/storage.test.ts` 覆盖重排追踪字段读写。

- `npm.cmd run verify:harness`：通过，F16 passing 状态下 6 个 feature 中 5 个 passing、1 个 not_started，0 warning / 0 error。

- `2026-05-26` F17 已完成页面 UI 与新数据视图接入：创建目标页保存 PlanBundle；今日页使用 `buildTodaySuggestionFromPlanBundle()`；日历页使用 `buildPlanBundleCalendarView()`；复盘页保存 `DailyReview.taskResults` 后调用 `replanPlanBundleAfterReview()`；我的页使用 `buildPlanProgress()`。
- F17 兼容边界：today/calendar/review/profile 均通过 `migrateLegacyDailyPlans()` 兼容旧 `DailyPlan[]` 本地数据；review 重排成功后同时回写 PlanBundle 和 legacy DailyPlan[]，旧页面路径仍可控。
- `npm.cmd run test -- today plan-calendar goal-create review ui-components navigation-shell`：通过，7 个测试文件、39 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功，today/calendar/goal-create/review/profile 页面 wxml 产物均存在。
- `npm.cmd run check`：通过，15 个测试文件、92 个测试通过，F17 active 状态下 harness gate 0 warning / 0 error。
- F17 L3b/manual smoke：构建产物检查确认五个页面产物存在；源码路径检查确认新 PlanBundle、legacy migration、replanner 和 progress 入口均接入；无数据路径由 EmptyState 覆盖；页面没有把塔罗、MBTI、每日关键词作为任务决策依据。

- `npm.cmd run verify:harness`：通过，F17 passing 状态下 6 个 feature 全部 passing，0 warning / 0 error。

## 阻塞项

- F01 无剩余阻塞项，A05 最终页面手动冒烟已由用户确认通过
- F02 无剩余阻塞项
- F03 无剩余阻塞项
- F04 无剩余阻塞项
- F05 无剩余阻塞项
- F06 无剩余阻塞项
- F07 无剩余阻塞项

## 下一步

- v0.3 F12-F17 已全部完成并通过门禁；F18、F19 为 2026-05-27 审计后补充的后续修复项。

## 交接说明

- 任务开始先读 `docs/harness/features/feature-index.json`、本文件，再读取当前 feature 的 `feature_folder/feature.json`
- 完成判断按 `docs/harness/verification-policy.md`
- 失败详情或手动冒烟详情写入 `docs/log/`
