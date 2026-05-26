# Goal / Plan / Stage / Task 状态模型合同

## 目的

本文档定义后续数据层重构时的目标模型合同。

当前代码仍以 `Goal + DailyPlan[] + Task + DailyReview` 为主；新页面设计已经需要更清晰的 `Goal + Plan + Stage + Task` 分层。后续修改 `models/`、`services/`、`storage` 或页面数据读取时，应以本文档为目标口径。

## 模型分层

```text
Goal
└── Plan
    ├── Stage[]
    └── Task[]

DailyReview
TodaySuggestion
UserProfile
```

### Goal

Goal 表示用户想完成的目标。

它回答：用户到底想完成什么，截止日期是什么，每天最多愿意投入多少时间。

MVP 必须字段：

```ts
export type GoalStatus = 'draft' | 'active' | 'completed' | 'archived' | 'cancelled'

export interface Goal {
  id: string
  title: string
  description?: string
  deadline: string
  dailyAvailableMinutes: number
  status: GoalStatus
  createdAt: string
  updatedAt: string
}
```

规则：

- 一个 Goal 可以有多个历史 Plan，但同一时间只能有一个 active Plan。
- Goal 完成必须由目标层判断，不由单个 Task 自动决定。
- Goal 取消不等于 Task 取消；取消 Goal 时需要明确处理其 Plan、Stage、Task 和 Review。
- `dailyAvailableMinutes` 是计划生成约束，不应被 Task 或 AI 建议静默修改。

### Plan

Plan 表示围绕某个 Goal 生成的一套计划。

它回答：这次计划如何安排，整体状态如何，是否需要调整。

MVP 必须字段：

```ts
export type PlanStatus =
  | 'draft'
  | 'active'
  | 'needs_adjustment'
  | 'infeasible'
  | 'completed'
  | 'archived'

export interface Plan {
  id: string
  goalId: string
  status: PlanStatus
  startDate: string
  deadline: string
  dailyAvailableMinutes: number
  createdAt: string
  updatedAt: string
}
```

建议新增字段：

```ts
export interface PlanProgress {
  planId: string
  completedTaskCount: number
  totalTaskCount: number
  progressPercent: number
  remainingEstimatedMinutes: number
}
```

规则：

- Plan 是计划层真相来源，Task 是执行项，DailyReview 是复盘记录。
- 计划重排会生成新的 Plan 版本或更新当前 Plan 的排布，但不代表 Goal 失败。
- `infeasible` 必须是明确状态，不能伪装成正常计划。
- AI 或塔罗建议不能直接修改 Plan 的历史状态，只能生成建议或触发受控重排。

### Stage

Stage 表示远期阶段安排。

它回答：当 DDL 超过 7 天时，长期目标大概分成哪些阶段推进。

MVP 可先支持类型，但 UI 可以只做轻量展示；完整阶段管理属于后续扩展。

```ts
export type StageStatus = 'planned' | 'active' | 'completed' | 'skipped'

export interface Stage {
  id: string
  goalId: string
  planId: string
  title: string
  startDate: string
  endDate: string
  status: StageStatus
  order: number
  createdAt: string
  updatedAt: string
}
```

规则：

- Stage 用于远期概览，不替代近 7 天具体 Task。
- Stage 完成不自动表示 Goal 完成。
- Stage 延期时应影响 Plan 风险提示，而不是直接把 Goal 标为失败。

### Task

Task 表示具体可执行任务。

它回答：用户某一天具体做什么，最低完成线是什么，当前执行状态是什么。

MVP 必须字段：

```ts
export type TaskStatus = 'todo' | 'done' | 'partial' | 'skipped'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskType = 'focus' | 'support' | 'buffer' | 'review'

export interface Task {
  id: string
  goalId: string
  planId: string
  stageId?: string
  title: string
  description?: string
  scheduledDate: string
  estimatedMinutes: number
  priority: TaskPriority
  type: TaskType
  status: TaskStatus
  minimumLine: string
  focusSuggestion?: string
  caution?: string
  createdAt: string
  updatedAt: string
}
```

兼容规则：

- 当前代码中的 `Task.date` 后续应迁移为 `Task.scheduledDate`。
- 旧数据读取时可以把 `date` 映射为 `scheduledDate`。
- 任务完成不等于目标完成；它只代表一个执行项完成。
- 任务跳过不等于目标取消；跳过后的处理应由 Review 和 Replanner 决定。
- `minimumLine` 必须保留，尤其是 low 能量状态下。

### DailyPlan

DailyPlan 在新模型中不再作为长期领域模型真相来源。

目标定位：

- 当前代码阶段：`DailyPlan[]` 是已持久化的旧计划结构，必须继续兼容读取。
- 目标模型阶段：DailyPlan 应降级为从 `Plan + Task[]` 计算得到的每日视图，或作为 legacy adapter 输出。

建议目标视图：

```ts
export interface DailyTaskView {
  date: string
  goalId: string
  planId: string
  tasks: Task[]
  totalEstimatedMinutes: number
  statusSummary: string
}
```

规则：

- 不应继续把 `dailyKeyword`、`recommendedFocusWindow` 这类表达字段写进核心计划真相来源。
- 表达字段应放在 `TodaySuggestion` 或 AI 建议视图中。
- 旧 `daily-plans:{goalId}` storage key 需要保留兼容读取，后续通过 migration 写入新结构。

### DailyReview

DailyReview 表示某天复盘记录。

它回答：当天哪些任务完成、部分完成或跳过，当天能量状态如何。

目标模型建议：

```ts
export interface DailyReview {
  id: string
  goalId: string
  planId: string
  date: string
  energy: EnergyLevel
  taskResults: Array<{
    taskId: string
    status: Extract<TaskStatus, 'done' | 'partial' | 'skipped'>
  }>
  note?: string
  createdAt: string
}
```

兼容规则：

- 当前代码中的 `completedTaskIds`、`partialTaskIds`、`skippedTaskIds` 可以迁移为 `taskResults`。
- 复盘记录属于历史事实，不应被重排逻辑静默改写。
- 复盘备注属于隐私数据，不得默认上传或写入日志。

### TodaySuggestion

TodaySuggestion 是计算视图，不是核心持久化计划。

它回答：今天先做什么、如何表达、AI/塔罗是否影响展示顺序。

规则：

- 可以基于 Task、UserProfile、DailyReview、TarotDraw 和 AI 结构化结果生成。
- 可以影响今日展示顺序和文案。
- 不得直接修改 `Task.status`、`DailyReview` 或历史 Plan。
- 无 AI 凭据时必须有 deterministic fallback。

### UserProfile

UserProfile 表示用户默认偏好。

建议拆分概念：

- 安排偏好：偏好工作时段、默认专注时长、默认能量状态。
- 表达偏好：MBTI、塔罗、每日关键词、仪式感强度。

规则：

- 安排偏好可以影响默认任务时段和轻量排序。
- 表达偏好只能影响文案和仪式感，不得作为科学预测或硬性任务决策依据。

## 近 7 天细任务 + 远期阶段计划

新模型采用：

- 近 7 天：生成具体 Task。
- 7 天之后：优先生成 Stage。
- 用户接近某个 Stage 时，再把 Stage 细化为 Task。

这样可以避免长期目标一开始生成大量过期任务，也能支持日历页展示长期计划。

## 页面读取关系

| 页面 | 主要读取 | 说明 |
|---|---|---|
| 今日任务页 | Task、TodaySuggestion、UserProfile、Goal | 只突出今天可执行任务，不展示完整计划 |
| 任务日历页 | Goal、Plan、Stage、Task | 展示整体进度、近 7 天任务和远期阶段 |
| 创建目标页 | Goal 创建输入、UserProfile、PlanInput | 创建 Goal 并触发 Plan 生成 |
| 我的页 | Goal、PlanProgress、UserProfile、Stats | 管理目标和偏好，不处理当天任务执行 |

## 当前代码调整建议

| 当前文件 | 当前状态 | 建议调整 |
|---|---|---|
| `models/goal.ts` | Goal 缺少 status | 增加 `GoalStatus`，旧数据默认 `active` |
| `models/plan.ts` | `DailyPlan` 同时承担持久化计划和页面视图；`PlanCalendarDay`、`TodayView` 与领域模型混在一起 | 新增 `Plan`、`Stage`、`DailyTaskView`；把页面视图类型迁移到 view-model 或 selector 层 |
| `models/task.ts` | Task 使用 `date`，没有 `planId`、`stageId`、`type`、时间戳 | 保留 legacy `date` normalize，目标模型使用 `scheduledDate` |
| `models/review.ts` | Review 使用三个 task id 数组，没有 `planId` | 增加 `planId` 和 `taskResults`，旧字段兼容迁移 |
| `models/user-profile.ts` | 已有 energy、workStyle、ritualPreference，但安排偏好和表达偏好未分层 | 后续拆成 scheduling preferences 与 expression preferences，或至少在字段命名上区分 |
| `services/storage.ts` | 只存 `daily-plans:{goalId}`，没有 schema version 或新 Plan key | 保留旧 key 读取，新增 `plans:{goalId}`、`tasks:{planId}`、`stages:{planId}` 或统一 bundle key |
| `services/planner.ts` | 输出 `DailyPlan[]` | 后续输出 `PlanBundle`，再提供 legacy adapter |
| `services/replanner.ts` | 基于 `DailyPlan[]` 重排 | 后续以 Plan/Task 为输入，复盘结果只作为重排依据 |
| `services/today-suggestion.ts` | 已作为计算视图边界 | 保持不写回原始 Task/Plan 状态 |

## 推荐迁移顺序

1. 先在 `models/` 新增目标类型，不删除旧 `DailyPlan`。
2. 为旧数据增加 normalize / migrate adapter。
3. storage 新增 schema version 和新 key，但继续读取旧 key。
4. planner 输出新 `PlanBundle`，并临时提供 `toLegacyDailyPlans()`。
5. 页面读取统一 selector，而不是直接依赖 storage 原始结构。
6. 测试覆盖旧数据读取、新数据写入、无数据空状态和重排后历史保留。

## MVP 必须与后续扩展

MVP 必须：

- Goal、Plan、Task、DailyReview 的边界清楚。
- 旧 `DailyPlan[]` 可以继续读取。
- 近 7 天具体 Task 可展示。
- 任务状态、复盘状态和计划状态不能混用。
- AI/塔罗只影响表达和排序，不写回核心计划状态。

后续扩展：

- 完整 Stage 管理。
- 多 Goal 切换。
- Plan 版本历史。
- 云端同步。
- 更细的进度统计和风险评分。
