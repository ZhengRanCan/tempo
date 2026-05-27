# pages.md

## 目的

本文档只作为页面级设计规范的路由入口，不再直接定义页面结构、组件顺序或页面验收标准。

页面级规范已经迁移到 `docs/design/page/`。后续修改页面 UI 时，应优先阅读页面目录中的规范，而不是在本文件中补充页面细节。

## 页面规范位置

| 页面 | 页面职责 | 规范文档 |
|---|---|---|
| 今日任务页 | 执行今日任务，突出今日最重要的一件事 | `docs/design/page/pages/today-page.md` |
| 任务日历页 | 查看目标计划排布、阶段和未来任务 | `docs/design/page/pages/calendar-page.md` |
| 创建目标页 | 创建 Goal，并触发 Plan 生成 | `docs/design/page/pages/create-goal-page.md` |
| 我的页 | 管理目标、偏好和设置 | `docs/design/page/pages/profile-page.md` |

## 推荐阅读顺序

1. `docs/harness/DESIGN.md`：确认 harness 对设计工作的总入口和约束。
2. `docs/design/README.md`：确认当前设计文档分层。
3. `docs/design/visual-system.md`：确认全局颜色、字体、间距、圆角。
4. `docs/design/components.md`：确认按钮、卡片、标签、表单、空状态等全局组件规则。
5. `docs/design/page/README.md`：确认页面级规范目录。
6. `docs/design/page/01-page-layout-contract.md`：确认页面布局契约。
7. 对应页面文档：确认当前页面的结构、数据依赖、状态和验收标准。

## 边界

- 本文件不定义页面从上到下的组件顺序。
- 本文件不定义页面专属组件文案。
- 本文件不定义 Goal、Plan、Stage、Task 的数据结构。
- 全局颜色、按钮、卡片、标签、空状态等规则写在 `docs/design/visual-system.md` 和 `docs/design/components.md`。
- 页面级结构、页面状态、页面交互跳转和页面验收标准写在 `docs/design/page/pages/`。
- 数据模型说明应引用架构文档，例如 `docs/architecture/goal-plan-task-state-model.md`。当前若架构文档尚未落地，应在页面文档中标记为「待确认」，不要在设计文档中临时定义完整数据模型。

## 页面职责摘要

### 今日任务页

- 定位：执行台。
- 主要数据：今日 Task。
- 主要行为：查看今日重点任务、进入全部今日任务、完成或复盘任务。
- 不负责：展示完整目标计划。

### 任务日历页

- 定位：目标计划板。
- 主要数据：Goal、Plan、Stage、Task。
- 主要行为：查看目标进度、未来 7 天任务、远期阶段安排和调整计划入口。
- 不负责：当天任务执行细节。

### 创建目标页

- 定位：Goal 创建入口。
- 主要数据：Goal 创建表单、用户安排偏好。
- 主要行为：创建 Goal，并触发 Plan 生成。
- 不负责：直接展示任务日历或执行任务。

### 我的页

- 定位：我的目标与偏好。
- 主要数据：当前 Goal、默认安排偏好、AI 表达偏好、最近推进摘要。
- 主要行为：查看计划、管理目标、设置偏好。
- 不负责：当天任务执行。

## 禁止项

- 不要在本文件继续追加页面实现细节。
- 不要把页面级规范复制回 `docs/design/components.md`。
- 不要在页面主体重复顶部导航栏已经表达的页面标题。
- 不要把底部 TabBar 已有入口重复做成页面内主按钮。
- 不要把 AI、塔罗、MBTI、每日关键词写成任务决策依据。
