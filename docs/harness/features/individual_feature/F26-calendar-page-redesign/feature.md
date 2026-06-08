---
id: F26
title: 任务日历页重设计
version: v0.3
status: passing
dependsOn: [F25]
l3: required
riskLevel: medium
evidence: {"lastVerifiedAt":"2026-06-08T21:51:43+08:00","commands":[{"command":"npm.cmd run test -- plan-calendar ui-components data-layer navigation-shell","result":"passed"},{"command":"npm.cmd run verify:static","result":"passed"},{"command":"npm.cmd run verify:system","result":"passed"},{"command":"npm.cmd run verify:harness","result":"passed"}],"manualSmoke":"User visual confirmation recorded: ok，就当F26完成了吧。 Reference image checked against docs/design/page/reference_image/日历.png after removing the out-of-scope 远期阶段 component; dev output refreshed at dist/dev/mp-weixin/pages/plan-calendar/index.* on 2026-06-08 21:46:17; no models, services, storage keys, planner, replanner, AI, tarot, or other main Tab page structures were modified."}
---

# F26 任务日历页重设计

## 1. Goal

F26 的目标是把任务日历页从普通任务列表调整为“目标计划板”首屏。

本 feature 只处理任务日历页的页面结构、首屏信息层级、视觉密度、状态展示和必要 UI 接入。不新增数据模型，不修改 services、storage key、planner/replanner，不实现真实 AI/tarot 逻辑，不重做其他 Tab 页。

页面职责参考 `docs/design/page/pages/calendar-page.md`。本轮排版细节参考 `docs/harness/features/individual_feature/F26-calendar-page-redesign/details/design.md`。完成证明以 `verification.md` 为准。

## 2. Required Reading

必须读：

- `docs/design/page/pages/calendar-page.md`
- `docs/harness/features/individual_feature/F26-calendar-page-redesign/details/design.md`
- `docs/harness/features/individual_feature/F26-calendar-page-redesign/verification.md`
- `docs/harness/features/individual_feature/F26-calendar-page-redesign/ref/image/README.md`

需要时再读：

- `docs/design/visual-system.md`
- `docs/design/components.md`
- `docs/design/content-rules.md`
- `docs/architecture/goal-plan-task-state-model.md`

不要默认读：

- `docs/design/page/raw/`
- `docs/design/page/pages/style-baseline.md`

## 3. Scope

允许修改：

- `pages/plan-calendar/index.vue`
- 日历页局部样式
- 日历页局部 helper
- 与日历页 UI 结构直接相关的测试
- `docs/progress.md`

谨慎修改：

- `components/TaskCard.vue`
- `components/EmptyState.vue`

修改共享组件时必须记录修改原因、影响页面、是否影响今日页，以及对受影响页面的最小验证结果。若日历页需要专属任务展示，优先使用页面局部结构，不要为了 F26 轻易扩大共享 `TaskCard` 的行为表面。

不允许修改：

- `models/`
- `services/`
- storage key
- planner/replanner 策略
- Deepseek、AI、tarot 真实接口
- TabBar 路由配置
- 今日、创建目标、我的页的页面结构

## 4. Requirements

F26 本轮只抓四件事：

1. 当前目标计划卡成为首屏主视觉。
2. 整体进度或时间压力在首屏可见。
3. 未来 7 天计划概览能快速扫描。
4. 选中日期任务列表和上方计划信息有明显层级差异。

F26 参考 `calendar-page.md` 中的页面定位、首屏结构、视觉层级和状态表达，但不要求完整实现其中所有交互、数据模型扩展和长期计划能力。

涉及以下能力，本轮只能做 UI mock、弱入口或记录为后续 feature：

- 切换目标
- 周视图 / 月视图
- 调整日期
- 移到今天
- 真实调整计划
- Plan 汇总字段
- 真实 AI 计划分析

F26 不新增 Plan / Stage 字段，也不在默认页面中展示独立“远期阶段”组件。如果当前实现缺少 `progressPercent`、`planStatus` 或 `remainingEstimatedMinutes`，优先用现有 Task / DailyPlan 数据推导展示；无法推导时使用 UI fallback；在 `docs/progress.md` 记录数据缺口；不得为了 UI 展示修改数据模型、services、storage key、planner 或 replanner。

本轮 UI 实现必须直接参考 `ref/image/README.md` 中提供的参考图进行设计。参考图包含两种关键界面状态：

1. 日历页默认初始界面。
2. 点击未来 7 天计划概览中某个具体日期后的日期详情 / 任务列表界面。

F26 必须同时覆盖这两种界面状态，并在页面结构、信息层级、卡片顺序、按钮关系和视觉气质上明显接近参考图。如果只完成默认初始界面，或只完成日期详情界面，不能认为 F26 已完整完成。

如果只是轻微调整颜色、圆角、阴影，但没有改善目标计划卡、进度 / 压力、7 天概览和任务列表分区，不能认为完成 F26。

F26 日历页最终 SVG 图标清单以 `static/icons/page/calendar/icon-spec.json` 为准，当前只要求：

- `target.svg`
- `calendar.svg`
- `week.svg`
- `adjust.svg`
- `sparkle.svg`
- `clock.svg`
- `priority.svg`

进度、风险、完成、缓冲日、无任务、阶段分组、任务列表容器等状态优先使用 CSS badge、dot、progress bar、chip、border 或文字表达，不单独要求 SVG。

## 5. Acceptance

必须完成：

- [ ] 当前目标计划卡是首屏第一核心卡。
- [ ] 首屏可见整体进度或时间压力。
- [ ] 默认展示未来 7 天计划概览。
- [ ] 日期概览能区分有任务、无任务、完成、缓冲、风险中的至少基础状态。
- [ ] 点击或选择某一天后，下方任务列表展示该日期任务。
- [ ] 选中日期任务列表和上方计划信息有明显层级差异，页面不再像普通任务长列表。
- [ ] 日历页首屏效果明显接近参考图的信息层级、计划板视觉重心、日期 / 任务分区、按钮层级和整体气质。
- [ ] 页面主体无重复大标题、胶囊标签、长副标题和大块顶部空白。
- [ ] 未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑。
- [ ] 未修改今日、创建目标、我的页的页面结构。
- [ ] 完成 `verification.md` 中的命令、截图或人工视觉检查。

可 mock / 可弱化：

- [ ] 切换目标入口可隐藏或弱化。
- [ ] 周视图 / 月视图可作为 UI mock 或后续入口。
- [ ] 调整日期、移到今天、调整计划可以是弱入口或后续 feature。
- [ ] 远期 Stage 属于后续扩展，不作为 F26 默认页面组件展示。
- [ ] AI 计划建议可以使用 fallback 短文案。
- [ ] 图标资源未齐时可使用预留位或临时占位，但必须记录原因，不能当作最终图标接入完成。

## 6. Completion Rule

只有在以下条件全部满足后才能置为 `passing`：

- 自动化命令通过。
- 日历页关键状态有截图或人工检查记录。
- 已确认构建入口使用当前产物。
- 已说明日历页相对 F24 的可见变化。
- 已记录无法验证或本轮不做的能力。
- 没有未解释的 knownUnverified 状态。

如果没有按本 feature 的四个核心要求完成页面调整，缺少截图 / 人工视觉检查记录，或首屏效果没有明显接近参考图，即使测试通过，也不能置为 `passing`。
