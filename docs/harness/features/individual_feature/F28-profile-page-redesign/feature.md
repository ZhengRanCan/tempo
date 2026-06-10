---
id: F28
title: 我的页重设计
version: v0.3
status: passing
dependsOn: [F27]
l3: required
riskLevel: medium
evidence: {"lastVerifiedAt":"2026-06-10T17:10:00+08:00","commands":[{"command":"npm.cmd run test -- user-profile ui-components navigation-shell data-layer","result":"passed"},{"command":"npm.cmd run verify:static","result":"passed"},{"command":"npm.cmd run verify:system","result":"passed"},{"command":"npm.cmd run verify:harness","result":"passed"}],"manualSmoke":"User visual confirmation recorded: 还算可以，标记完成. Reference image checked against docs/design/page/reference_image/我的.png and the F28 component layout contract; the profile page now uses the six-layer layout with greeting strip, current goal/no-goal card, default planning preferences, AI expression and ritual preferences, recent progress, and bottom management list. Dev output was refreshed at dist/dev/mp-weixin/pages/profile/index.* and build output was refreshed by npm.cmd run verify:system on 2026-06-10; no models, services, storage keys, planner, replanner, AI, tarot, TabBar routes, or other Tab page structures were modified."}
---

# F28 我的页重设计

## 1. Goal

F28 的目标是用“参考图 + 组件排布说明”的方式重设计我的页。

这次实验不写大段页面规范，也不让 `profile-page.md` 成为完整施工清单。执行者主要依据参考图和组件排布文档实现页面结构，验证“视觉参考 + 组件拆解”是否比 F27 的纯参考图方式更稳定。

本 feature 只改我的页 UI 结构、视觉层级和必要的局部测试，不改数据模型、services、storage key、planner/replanner、真实 AI/tarot 逻辑，也不修改其他 Tab 页结构。

## 2. Required Reading

必须读：

- `docs/design/page/reference_image/我的.png`
- `docs/harness/features/individual_feature/F28-profile-page-redesign/details/component-layout.md`
- `docs/harness/features/individual_feature/F28-profile-page-redesign/ref/image/README.md`
- `docs/harness/features/individual_feature/F28-profile-page-redesign/verification.md`

只在需要确认页面职责时再读：

- `docs/design/page/pages/profile-page.md`

不要默认读：

- `docs/design/page/raw/`
- `docs/design/page/pages/style-baseline.md`
- F25/F26/F27 的 details 文档

## 3. Scope

允许修改：

- `pages/profile/index.vue`
- 我的页局部样式和局部 helper
- 与我的页 UI 结构直接相关的测试
- `docs/progress.md`

谨慎修改：

- `components/EmptyState.vue`

修改共享组件时必须记录修改原因、影响页面、是否影响今日页/日历页/创建页，以及最小验证结果。

不允许修改：

- `models/`
- `services/`
- storage key
- planner/replanner 策略
- Deepseek、AI、tarot 真实接口
- TabBar 路由配置
- 今日页、任务日历页、创建目标页页面结构

## 4. Must Change

F28 必须让我的页从“入口集合页”转为“目标与偏好管理页”：

- 首屏上方有轻量用户问候区。
- 有目标时，当前目标卡是第一核心业务卡。
- 无目标时，创建目标入口是第一核心业务动作。
- 默认安排偏好和 AI 表达/仪式感偏好分成两个不同区域。
- 最近推进作为状态摘要，不抢当前目标卡的主视觉。
- 设置类入口收敛为底部列表，不重复今日、日历、创建这些 TabBar 已有入口。
- MBTI、塔罗、每日关键词只作为表达风格和仪式感偏好，不得写成任务决策依据。

## 5. Acceptance

- [ ] 我的页首屏明显接近参考图的信息顺序、组件排布、卡片密度、按钮层级和整体气质。
- [ ] 有目标状态下，当前目标卡是第一核心业务卡。
- [ ] 无目标状态下，创建目标入口是第一核心业务动作。
- [ ] 默认安排偏好区域与 AI 表达/仪式感偏好区域分离。
- [ ] 最近推进区域只做状态摘要，不抢当前目标卡主视觉。
- [ ] 设置入口收敛为底部列表，未重复今日、日历、创建这些 TabBar 入口。
- [ ] 页面主体无重复大标题、胶囊标签、长副标题和大块顶部空白。
- [ ] 未修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑。
- [ ] 未修改今日页、任务日历页、创建目标页页面结构。
- [ ] 完成 `verification.md` 中的命令、截图或人工视觉检查。

## 6. Completion Rule

只有在以下条件全部满足后才能置为 `passing`：

- 自动化命令通过。
- 已确认构建入口使用当前产物。
- 我的页关键状态有截图或用户人工检查记录。
- 已记录我的页和参考图的对照结果。
- 已说明我的页相对 F24 的可见变化。
- 没有未解释的 knownUnverified 状态。

如果没有截图或用户人工视觉检查记录，即使测试通过，也不能置为 `passing`。如果页面首屏没有明显接近参考图，也不能置为 `passing`。
