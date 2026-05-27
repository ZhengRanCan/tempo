# data-models.md

## 目的

本文档记录当前代码已经实现的数据模型快照。

后续数据层重构的目标模型以 `docs/architecture/goal-plan-task-state-model.md` 为准。本文档中的 `DailyPlan` 仍代表当前代码和旧数据兼容结构，不再作为长期目标模型的唯一依据。

实际类型定义以 `models/` 中的源码为准。如果修改 `models/` 源码，必须同步检查本文档和 `goal-plan-task-state-model.md` 是否需要更新。

---

## 类型文件位置

```text
models/
├── goal.ts
├── task.ts
├── plan.ts
├── review.ts
└── user-profile.ts
```

---

## EnergyLevel

```ts
export type EnergyLevel = 'low' | 'normal' | 'high'
```

表示用户当天状态。

- low：低能量，应优先给出最低完成线
- normal：普通状态，按常规任务强度安排
- high：高能量，可以安排更高优先级或稍复杂任务

---

## TaskStatus

```ts
export type TaskStatus = 'todo' | 'done' | 'partial' | 'skipped'
```

表示任务完成状态。

- todo：待完成
- done：已完成
- partial：部分完成
- skipped：跳过或未完成

---

## WorkStyle

```ts
export type WorkStyle = 'morning' | 'afternoon' | 'evening' | 'flexible'
```

表示用户偏好的专注时段。

---

## Goal

```ts
export interface Goal {
  id: string
  title: string
  description?: string
  deadline: string
  dailyAvailableMinutes: number
  createdAt: string
  updatedAt: string
}
```

表示用户创建的目标。

字段说明：

- id：目标唯一标识
- title：目标名称
- description：目标补充说明
- deadline：截止日期，格式为 YYYY-MM-DD
- dailyAvailableMinutes：用户每天可投入该目标的时间
- createdAt：创建时间
- updatedAt：更新时间

约束：

- deadline 必须使用 YYYY-MM-DD
- dailyAvailableMinutes 必须为正数
- title 不能为空

---

## UserProfile

```ts
export interface UserProfile {
  id: string
  mbti?: string
  workStyle: WorkStyle
  preferredFocusMinutes: number
  ritualPreference?: 'simple' | 'warm' | 'energetic'
}
```

表示用户状态偏好和个性化表达偏好。

约束：

- MBTI 只用于表达风格和轻量个性化，不作为科学预测依据
- preferredFocusMinutes 必须为正数
- workStyle 默认为 flexible

---

## Task

```ts
export interface Task {
  id: string
  goalId: string
  title: string
  description?: string
  date: string
  estimatedMinutes: number
  priority: 'high' | 'medium' | 'low'
  status: TaskStatus
  minimumLine: string
  focusSuggestion?: string
  caution?: string
}
```

表示每日可执行的小任务。

字段说明：

- id：任务唯一标识
- goalId：所属目标
- title：任务标题
- description：任务说明
- date：任务安排日期，格式为 YYYY-MM-DD
- estimatedMinutes：预计用时
- priority：优先级
- status：完成状态
- minimumLine：最低完成线
- focusSuggestion：推荐专注方式
- caution：注意事项

约束：

- estimatedMinutes 必须为正数
- minimumLine 必须具体、可执行
- date 必须使用 YYYY-MM-DD
- status 只能是 todo、done、partial、skipped
- priority 只能是 high、medium、low

---

## DailyPlan

```ts
export interface DailyPlan {
  date: string
  goalId: string
  tasks: Task[]
  dailyKeyword?: string
  recommendedFocusWindow?: string
}
```

表示某一天的任务计划。

当前说明：

- 当前代码仍将 `DailyPlan[]` 作为持久化计划结构。
- 后续目标模型中，DailyPlan 应降级为从 `Plan + Task[]` 计算得到的每日视图，或作为旧数据兼容 adapter 输出。
- 新页面设计需要独立 `Plan` 和 `Stage` 概念，详见 `docs/architecture/goal-plan-task-state-model.md`。

约束：

- date 必须使用 YYYY-MM-DD
- tasks 中任务总时长不得超过用户 dailyAvailableMinutes
- dailyKeyword 只作为仪式感表达，不作为科学预测依据

---

## DailyReview

```ts
export interface DailyReview {
  id: string
  date: string
  goalId: string
  energy: EnergyLevel
  completedTaskIds: string[]
  partialTaskIds: string[]
  skippedTaskIds: string[]
  note?: string
  createdAt: string
}
```

表示晚间复盘记录。

约束：

- energy 只能是 low、normal、high
- completedTaskIds、partialTaskIds、skippedTaskIds 不应互相重复
- note 属于用户隐私数据，不得默认公开或上传
- 删除目标时，应同步处理相关 DailyReview

---

## 不可行计划状态

当任务无法在 DDL 前完成时，planner 或 replanner 应返回明确的不可行状态。

建议定义：

```ts
export interface InfeasiblePlanResult {
  status: 'infeasible'
  reason: string
  suggestions: Array<'extend_deadline' | 'increase_daily_time' | 'reduce_scope'>
}
```

不可行状态不能被伪装成正常 DailyPlan。

---

## 与目标模型的差距

| 当前模型 | 当前问题 | 后续目标 |
|---|---|---|
| Goal | 缺少 `status`，无法区分 active/completed/archived/cancelled | 增加 `GoalStatus`，旧数据默认 active |
| DailyPlan | 同时承担持久化计划、日历视图和今日视图来源 | 降级为 DailyTaskView 或 legacy adapter |
| Task | 使用 `date`，缺少 `planId`、`stageId`、`type`、时间戳 | 迁移为 `scheduledDate`，并关联 Plan/Stage |
| DailyReview | 使用三个 task id 数组，缺少 `planId` | 迁移为 `taskResults`，并关联 Plan |
| UserProfile | 安排偏好和表达偏好未明确分层 | 区分 scheduling preferences 与 expression preferences |

后续实现时不要一次性删除旧字段，应先新增目标类型和迁移逻辑，再逐步切换服务和页面读取层。

## 2026-05-26 F12 实现记录

- `models/goal.ts` 已新增 `GoalStatus`，旧 Goal 数据仍可在缺少 `status` 时读取。
- `models/task.ts` 已新增 `TaskType`、可选 `planId`、`stageId`、`scheduledDate`、时间戳字段；旧 `Task.date` 保留，legacy adapter 会映射为 `scheduledDate`。
- `models/plan.ts` 已新增 `PlanStatus`、`StageStatus`、`Plan`、`Stage`、`PlanBundle`、`DailyTaskView`、`PlanProgress`，并提供 `dailyPlansToPlanBundle()` / `planBundleToDailyPlans()` 双向 adapter。
- `models/review.ts` 已新增可选 `planId` 与 `taskResults`，旧 `completedTaskIds`、`partialTaskIds`、`skippedTaskIds` 继续可读。
- F12 不修改 storage key、planner、replanner、today-suggestion 或页面运行主路。
## 2026-05-27 F19 ????

- `models/plan.ts` ????? Plan ?????DailyPlan ?????normalize ? legacy adapter?
- ?????????? `services/plan-view.ts`?`DailyTaskView`?`PlanProgress`?`PlanBundleCalendarView`?`PlanCalendarDay`?`TodayView` ??? selector/view-model ???
- ??????????????????? `services/plan-view.ts` ??? selector/service?????? `models/plan.ts`?
- ??????????`models/index.ts` ?? re-export ????????????? `services/plan-view.ts` ???
