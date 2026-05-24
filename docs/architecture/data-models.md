# data-models.md

## 目的

本文档定义 MVP 阶段的核心数据类型。

实际类型定义以 models/ 中的源码为准。  
如果修改 models 源码，必须同步检查本文档是否需要更新。

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
