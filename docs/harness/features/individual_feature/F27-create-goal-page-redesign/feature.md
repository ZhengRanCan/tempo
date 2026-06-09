---
id: F27
title: 创建目标页重设计
version: v0.3
status: passing
dependsOn: [F26]
l3: required
riskLevel: medium
evidence: {"lastVerifiedAt":"2026-06-09T11:05:00+08:00","commands":[{"command":"npm.cmd run test -- goal-create user-profile ui-components data-layer navigation-shell","result":"passed"},{"command":"npm.cmd run verify:static","result":"passed"},{"command":"npm.cmd run verify:system","result":"passed"},{"command":"npm.cmd run verify:harness","result":"passed"}],"manualSmoke":"User visual confirmation recorded: 勉强还可以，标记完成吧。 Reference image checked against docs/design/page/reference_image/创建目标.jpeg; create page runtime now uses CSS-only marks for icon anchors after mp-weixin resource binding issues; dev output refreshed at dist/dev/mp-weixin/pages/goal-create/index.* on 2026-06-09 10:43:17 and build output refreshed by npm.cmd run verify:system on 2026-06-09 11:05; no models, services, storage keys, planner, replanner, AI, tarot, or other main Tab page structures were modified."}
---

# F27 创建目标页重设计

## 1. Goal

F27 的目标是用“参考图优先”的方式重设计创建目标页，验证更少文字设计文档、更强参考图约束时，Codex 是否能做出更明显的 UI 变化。

本 feature 只做创建目标页 UI 结构和视觉层级改造，不改数据模型、services、storage key、planner/replanner、真实 AI/tarot 逻辑，也不修改其他 Tab 页结构。

## 2. Reference Image First Rule

F27 的主要视觉依据是：

- `docs/design/page/reference_image/创建目标.jpeg`

执行者必须先看参考图，再写页面代码。参考图不是颜色样例，也不是圆角/阴影样例，而是用来约束：

- 页面首屏信息顺序。
- 步骤式输入结构。
- 卡片密度和留白。
- 主按钮层级。
- 个性化偏好区域的展开方式。
- 页面整体是否像“目标创建流程”，而不是普通设置表单。

不要求逐像素还原。若只是轻微修改颜色、圆角、阴影，但页面仍像旧表单，不能通过 F27。

## 3. Required Reading

必须读：

- `docs/harness/features/individual_feature/F27-create-goal-page-redesign/feature.md`
- `docs/harness/features/individual_feature/F27-create-goal-page-redesign/verification.md`
- `docs/harness/features/individual_feature/F27-create-goal-page-redesign/ref/image/README.md`
- `docs/design/page/reference_image/创建目标.jpeg`
- `static/icons/page/create/README.md`
- `static/icons/page/create/icon-spec.json`

只在需要确认页面职责时再读：

- `docs/design/page/pages/create-goal-page.md`

不要默认读：

- `docs/design/page/raw/`
- `docs/design/page/pages/style-baseline.md`
- F25/F26 的 `details/design.md`

## 4. Scope

允许修改：

- `pages/goal-create/index.vue`
- 创建目标页局部样式和局部 helper
- 与创建目标页 UI 结构直接相关的测试
- `docs/progress.md`

谨慎修改：

- `components/EnergySelector.vue`
- `components/EmptyState.vue`

修改共享组件时必须记录修改原因、影响页面、是否影响今日页/日历页/我的页，以及最小验证结果。

不允许修改：

- `models/`
- `services/`
- storage key
- planner/replanner 策略
- Deepseek、AI、tarot 真实接口
- TabBar 路由配置
- 今日页、任务日历页、我的页页面结构

## 5. Must Change

F27 必须让用户明显看到这些变化：

- 页面首屏直接进入“先设定一个目标”的创建流程。
- 目标名称、截止日期、每日可用时间是前三个核心输入。
- 输入区域是步骤式卡片，而不是普通纵向设置表单。
- 每日可用时间使用清晰的选项按钮，默认选中态明确。
- 补充说明是可选输入，不抢前三个核心输入的层级。
- 个性化安排偏好默认展开，但视觉上低于核心输入。
- 生成计划按钮是页面最强主操作。
- 仪式感、塔罗、MBTI、每日关键词只能作为表达风格偏好，不得写成任务安排依据。
- 创建页不展示任务日历，不执行今日任务。

## 6. Icon Resources

F27 图标资源提前准备，但图标只作为扫描锚点，不作为装饰堆叠。

创建目标页最终 SVG 清单以 `static/icons/page/create/icon-spec.json` 为准。当前需要：

- `sparkle.svg`：顶部轻量引导 / 氛围锚点，输出为 `sparkle.png`。
- `calendar.svg`：截止日期输入，输出为 `calendar.png`。
- `clock.svg`：每日可用时间输入，输出为 `clock.png`。
- `编辑.svg`：自定义分钟数编辑入口，输出为 `edit.png`。
- `补充说明.svg`：补充说明输入，输出为 `note.png`。
- `preference.svg`：个性化安排偏好，输出为 `preference.png`。
- `lock.svg`：底部“生成后可随时调整”提示，输出为 `lock.png`。

步骤编号、选中态、禁用态、输入边框、按钮渐变、卡片层级优先用 CSS 表达，不单独要求 SVG。

## 7. Acceptance

- [ ] 创建目标页首屏明显接近参考图的信息顺序、步骤式结构、卡片密度、按钮层级和整体气质。
- [ ] 页面前三个核心输入依次是目标名称、截止日期、每日可用时间。
- [ ] 目标名称、截止日期、每日可用时间采用步骤式卡片结构，而不是普通设置表单。
- [ ] 个性化安排偏好默认展开，但视觉层级低于核心输入。
- [ ] 生成计划按钮是页面最强主操作。
- [ ] 页面主体无重复大标题、胶囊标签、长副标题和大块顶部空白。
- [ ] 图标资源已按 `static/icons/page/create/` 准备；若 mp-weixin 运行时资源引用污染输入或按钮绑定，页面运行时代码可改用纯 CSS 标记，但必须在 `docs/progress.md` 记录原因、风险和产物检查结果。
- [ ] 未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑。
- [ ] 未修改今日页、任务日历页、我的页页面结构。
- [ ] 完成 `verification.md` 中的命令、截图或人工视觉检查。

## 8. Completion Rule

只有在以下条件全部满足后才能置为 `passing`：

- 自动化命令通过。
- 已确认构建入口使用当前产物。
- 创建目标页关键状态有截图或用户人工检查记录。
- 已记录创建目标页和参考图的对照结果。
- 已说明创建目标页相对 F24 的可见变化。
- 没有未解释的 knownUnverified 状态。

如果没有截图或用户人工视觉检查记录，即使测试通过，也不能置为 `passing`。如果页面首屏没有明显接近参考图，也不能置为 `passing`。
