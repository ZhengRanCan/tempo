---
id: F24
title: UI 统一样式基线
version: v0.3
status: passing
dependsOn: [F23]
l3: required
evidence: {"lastVerifiedAt":"2026-06-03T19:27:35+08:00","commands":[{"command":"npm.cmd run test -- ui-components navigation-shell today plan-calendar goal-create user-profile","result":"passed"},{"command":"npm.cmd run verify:static","result":"passed"},{"command":"npm.cmd run verify:system","result":"passed"},{"command":"npm.cmd run verify:harness","result":"passed"}],"manualSmoke":"F24 manual visual matrix recorded in docs/progress.md. Source and dev/build mp-weixin artifacts were checked for Today, Calendar, Create Goal, and Profile states; no models, services, schemas, storage keys, planner, replanner, AI, or tarot business logic was modified."}
---

# F24 UI 统一样式基线

## 1. Goal

F24 用于统一四个主 Tab 页的整体样式基线，使今日页、日历页、创建目标页、我的页在视觉风格、间距节奏、卡片样式、按钮层级、标签样式和空状态表达上保持一致。

本 feature 只处理 UI 样式统一，不负责重新设计四个页面的业务结构和信息顺序。

F24 的样式统一主要参考 `docs\design\page\pages\style-baseline.md`。四个页面的具体业务结构、组件顺序、状态展示和数据依赖由后续页面级 feature 处理。

## 2. What F24 Should Change

F24 应重点处理：

* 页面背景、页面内边距和顶部间距；
* 卡片圆角、边框、阴影、背景色和内边距；
* 主按钮、次按钮、文本按钮的视觉层级；
* 标签、状态标识、进度提示等轻量元素样式；
* 空状态、加载态、错误态的基础展示风格；
* 四个主 Tab 页中明显不一致的标题、间距、卡片和按钮样式；
* 共享 UI 组件在四个页面中的视觉一致性。

F24 可以进行少量 template 调整，但只能服务于样式统一，不能改变页面的核心业务结构。
四个页面各自的页面结构、组件顺序、状态展示和数据依赖，由后续页面级 feature 处理。

## 3. Acceptance

- [x] 四个主 Tab 页使用统一的页面背景、页面内边距和顶部间距规则。
- [x] 四个主 Tab 页的卡片圆角、边框、阴影、背景色和内边距规则一致。
- [x] 主按钮、次按钮、文本按钮在四个页面中的视觉层级一致。
- [x] 标签、状态标识、进度提示等轻量元素的样式统一。
- [x] 空状态、加载态、错误态的基础样式统一。
- [x] 页面中不再出现明显重复的大标题、胶囊标签、长副标题或无业务价值的大块顶部留白。
- [x] 四个页面看起来属于同一套小程序 UI，而不是四个局部拼装页面。
- [x] 没有借 UI 统一之名重排四个页面的业务结构。
- [x] 未修改 models、services、schemas、storage key、planner、replanner、AI/tarot 业务逻辑。
- [x] 完成 `verification.md` 中要求的命令、截图或人工视觉检查。

## 4. Required Reading

### 必须读：

* `docs/harness/features/individual_feature/F24-ui-overall-design/verification.md`
* `docs\design\page\pages\style-baseline.md`

### 需要时再读：

* `docs/design/visual-system.md`
* `docs/design/components.md`
* `docs/design/content-rules.md`

## 5. Scope

允许修改：

* `pages/today/index.vue`
* `pages/plan-calendar/index.vue`
* `pages/goal-create/index.vue`
* `pages/profile/index.vue`
* `components/AppPageHeader.vue`
* `components/TaskCard.vue`
* `components/TodayFocusCard.vue`
* `components/EmptyState.vue`
* `components/EnergySelector.vue`
* 其他与四个主 Tab 页样式统一直接相关的共享 UI 组件
* 与 UI 样式和组件结构相关的测试
* 相关设计文档与进度记录

不允许修改：

* `models/`
* `services/`
* `schemas/`
* storage key
* planner / replanner 策略
* Deepseek、AI、tarot 真实接口
* TabBar 路由配置
* 四个页面的核心业务流程


## 6. Execution Notes

执行 F24 时，应优先做样式统一和共享组件视觉规范，不要提前实现后续页面级 feature。

如果发现某个页面的信息结构本身有问题，只记录到 `docs/progress.md` 或后续 feature backlog，不要在 F24 中直接重组该页面。

如果页面样式无法在不调整 template 的情况下统一，可以进行小幅 template 调整，但必须满足：

* 不改变页面核心业务流程；
* 不改变数据读取和保存逻辑；
* 不新增页面级业务入口；
* 不提前实现页面级设计文档中的结构重排。

## 7. Completion Rule

F24 只有在以下条件全部满足后才能置为 `passing`：

* 自动化命令通过；
* 四个主 Tab 页均完成样式统一检查；
* 已提供截图或人工视觉检查记录；
* 已确认微信开发者工具入口使用当前构建产物；
* 已说明四个页面在样式层面相对 F20-F23 的可见变化；
* 已确认没有修改 models、services、storage key、planner、replanner、AI/tarot 业务逻辑。

如果只完成自动化测试，没有截图或人工视觉检查记录，不能置为 `passing`。

典型不能 passing 的情况：

* 只改了少量 class 或 padding，但四个页面整体风格仍明显不统一；
* 为了 UI 展示修改了数据模型、services 或 storage key；
* 提前重排今日页、日历页、创建目标页或我的页的业务结构；
* 微信开发者工具仍指向旧构建目录；
* 没有记录四个页面的视觉检查结果。
