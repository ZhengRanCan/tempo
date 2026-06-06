---
id: F25
title: 今日任务页重设计
version: v0.3
status: passing
dependsOn: [F24]
l3: required
riskLevel: medium
evidence: {"lastVerifiedAt":"2026-06-06T09:06:55+08:00","commands":[{"command":"npm.cmd run test -- today today-suggestion review ui-components navigation-shell","result":"passed"},{"command":"npm.cmd run verify:static","result":"passed"},{"command":"npm.cmd run verify:system","result":"passed"},{"command":"npm.cmd run verify:harness","result":"passed"}],"manualSmoke":"User visual confirmation recorded: 不赖，当前界面看着还可以。标记完成吧，F25. Reference image checked against docs/design/page/reference_image/今日任务.png; dev output refreshed at dist/dev/mp-weixin; no models, services, storage keys, planner, replanner, AI, tarot, or other main Tab page structures were modified."}
---

# F25 今日任务页重设计

## 1. Goal

F25 的目标是按 `docs/design/page/pages/today-page.md` 重设计今日任务页，让它从信息展示页收敛为今日执行页。

本 feature 只处理今日任务页的页面结构、视觉层级、状态展示和必要共享 UI 组件接入。不改数据模型、services、storage key、planner/replanner 和真实 AI/tarot 逻辑。

页面细节以 `docs/design/page/pages/today-page.md` 为准；本文件只定义任务边界和验收口径。

## 2. User Outcome

完成后，用户应能感受到：

- 今日页更像执行台，而不是完整计划展示页；
- 打开今日页后能快速识别今天最应该推进的任务；
- 今日状态、AI 建议和晚间复盘入口都服务于当天执行；
- 今日页和任务日历页的职责边界更清楚。

## 3. Required Reading

必须读：

- `docs/design/page/pages/today-page.md`
- `docs/harness/features/individual_feature/F25-today-page-redesign/verification.md`
- `docs/harness/features/individual_feature/F25-today-page-redesign/details/design.md`
- `docs/harness/features/individual_feature/F25-today-page-redesign/ref/image/README.md`

文档职责：

- `docs/design/page/pages/today-page.md` 是今日页页面级主设计规范，用来定义页面定位、目标结构、组件职责、状态设计、数据依赖、交互跳转和页面级验收标准。
- `docs/harness/features/individual_feature/F25-today-page-redesign/details/design.md` 是 F25 的执行补充文档，用来补充首屏视觉密度、按钮比例、图标锚点、静态图标资源、参考图对齐方式和不能只做轻微样式调整的判定规则。
- 如果两个文档出现冲突，先以 `today-page.md` 的页面职责和结构为准；`details/design.md` 用于细化 F25 本轮如何把首屏做得更接近参考图。

需要时再读：

- `docs/design/visual-system.md`
- `docs/design/components.md`
- `docs/design/content-rules.md`
- `docs/architecture/goal-plan-task-state-model.md`

不要默认读：

- `docs/design/page/raw/`
- `docs/design/page/pages/style-baseline.md`

## 4. Scope

允许修改：

- `pages/today/index.vue`
- `components/TodayFocusCard.vue`
- `components/TaskCard.vue`
- `components/EmptyState.vue`
- `components/EnergySelector.vue`
- 与今日页 UI 结构直接相关的测试
- `docs/progress.md`

不允许修改：

- `models/`
- `services/`
- storage key
- planner/replanner 策略
- Deepseek、AI、tarot 真实接口
- TabBar 路由配置
- 任务日历、创建目标、我的页的页面结构

## 5. Requirements

今日任务页的具体页面定位、目标结构、组件说明、状态设计、数据依赖、交互跳转、视觉要求和页面级验收标准，全部以 `docs/design/page/pages/today-page.md` 为准。

执行者不得在本 feature 中临时重写一套今日页设计规则。如果 `today-page.md` 与当前实现冲突，应先记录冲突和处理选择，再继续实现。

参考图用于硬性判断首屏重心、信息层级和页面气质。不要求逐像素还原，但完成效果必须明显接近参考图。

本轮实现必须接入已生成的今日页静态图标资源。图标清单以 `details/design.md` 和 `static/icons/page/today/icon-spec.json` 为准，当前必须优先使用：

- `static/icons/page/today/star.png`
- `static/icons/page/today/clock.png`
- `static/icons/page/today/flag.png`
- `static/icons/page/today/list.png`
- `static/icons/page/today/status-wave.png`
- `static/icons/page/today/sparkle.png`
- `static/icons/page/today/moon.png`

这些图标用于增强今日重点任务、预计时间、优先级、今日任务数量、今日状态、AI 今日建议和晚间复盘入口的扫描锚点。不要把图标散落到页面目录或组件目录中，不要在 F25 中重新生成或替换最终图标资源。

## 6. Acceptance

- [x] 今日任务页实现结果符合 `docs/design/page/pages/today-page.md` 的页面定位、目标结构、组件说明、状态设计和验收标准。
- [x] 今日任务页参考 `docs/design/page/reference_image/今日任务.png` 完成首屏信息层级和视觉重心调整。
- [x] 今日任务页首屏效果必须明显接近参考图的信息层级、主卡视觉权重、卡片密度、按钮层级和整体气质；如果只是轻微样式调整，不能通过。
- [x] 页面主体无重复大标题、胶囊标签、长副标题和大块顶部空白。
- [x] 未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑。
- [x] 未修改任务日历、创建目标、我的页的页面结构。
- [x] 今日页关键模块已接入 `static/icons/page/today/` 下的正式 PNG 图标资源，且图标只作为扫描锚点使用，不替代文本含义。
- [x] 完成 `verification.md` 中的命令、截图或人工视觉检查。

## 7. Completion Rule

只有在以下条件全部满足后才能置为 `passing`：

- 自动化命令通过；
- 今日页关键状态有截图或人工检查记录；
- 已确认构建入口使用当前产物；
- 已说明今日页相对 F24 的可见变化；
- 没有未记录的 knownUnverified 状态。

如果没有按 `today-page.md` 完成页面级要求、缺少截图/人工视觉检查记录，或首屏效果没有明显接近参考图，即使测试通过，也不能置为 `passing`。

## 8. Completion Evidence

- 用户人工视觉确认原文：`不赖，当前界面看着还可以。标记完成吧，F25`
- 参考图：`docs/design/page/reference_image/今日任务.png`
- 修改范围：`pages/today/index.vue`、`components/TodayFocusCard.vue`、`tests/today.test.ts`、`tests/ui-components.test.ts`、`docs/progress.md`、`docs/harness/features/feature-index.json`、F25 feature 合同。
- 图标资源：`static/icons/page/today/star.png`、`clock.png`、`flag.png`、`list.png`、`status-wave.png`、`sparkle.png`、`moon.png` 已接入今日页关键模块。
- 构建入口：`project.config.json.miniprogramRoot` 指向 `dist/dev/mp-weixin/`，本轮已刷新 dev 产物。
- 自动化命令：`npm.cmd run test -- today today-suggestion review ui-components navigation-shell`、`npm.cmd run verify:static`、`npm.cmd run verify:system`、`npm.cmd run verify:harness`。
- Out of scope 确认：未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑，未改任务日历、创建目标、我的页页面结构。
- knownUnverified：无。
