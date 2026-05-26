# services-boundary.md

## 目的

本文档定义 services 层的职责边界。

services 层负责核心业务逻辑。页面层只能调用 services，不能直接承载复杂业务规则。

数据模型目标边界见 `docs/architecture/goal-plan-task-state-model.md`。当前代码仍以 `DailyPlan[]` 为主，后续重构时应逐步迁移到 `Plan + Stage + Task`，并保留旧数据兼容。

---

## services 目录

```text
services/
├── planner.ts
├── replanner.ts
├── ai-client.ts
├── storage.ts
└── date.ts
```

---

## planner.ts

### 职责

负责初始任务拆解。

输入：

- Goal
- UserProfile
- 起始日期
- 每日可用时间

输出：

- DailyPlan[]
- 或不可行计划状态

目标输出：

- `PlanBundle`，包含 Plan、近 7 天 Task、远期 Stage
- 或明确的 `infeasible` 计划状态

迁移期间可以保留 `DailyPlan[]` 输出，并提供 `toLegacyDailyPlans()` 兼容旧页面和旧测试。

### 允许做

- 根据目标、DDL 和每日可用时间拆分任务
- 为任务生成 estimatedMinutes、priority、minimumLine
- 根据用户状态偏好调整任务表达
- 在 AI 失败时生成确定性 fallback 计划

### 禁止做

- 直接读写 storage
- 直接调用页面 API
- 直接依赖真实 AI 响应
- 直接修改用户输入
- 超过 dailyAvailableMinutes 强行安排任务

### 测试要求

修改 planner.ts 必须更新 planner 相关测试。

至少覆盖：

- 每日任务总时长不超过 dailyAvailableMinutes
- DDL 当天可以安排任务
- 低能量状态下优先生成最低完成线
- 不可行计划能返回明确状态

---

## replanner.ts

### 职责

负责根据晚间复盘结果重排后续计划。

输入：

- 原始 DailyPlan[]
- DailyReview
- Goal
- UserProfile

输出：

- 更新后的 DailyPlan[]
- 或不可行计划状态

目标输出：

- 更新后的 Plan/Task 排布
- 或新的 Plan 版本
- 或明确的 `infeasible` 状态

重排不是目标失败。`DailyReview` 是历史事实，replanner 不得静默改写复盘记录。

### 允许做

- 将未完成任务移动到后续日期
- 保留已完成任务历史
- 根据 low、normal、high 状态调整次日任务强度
- 在计划不可行时返回明确状态

### 禁止做

- 删除已完成任务记录
- 静默丢弃未完成任务
- 超过 DDL 强行安排任务
- 直接写入 storage
- 直接调用 AI API

### 测试要求

修改 replanner.ts 必须更新 replanner 相关测试。

至少覆盖：

- done 任务不被重排
- partial 任务可以转化为后续补充任务
- skipped 任务不会静默丢失
- 每日任务总时长不超过 dailyAvailableMinutes
- 无法安排到 DDL 前时返回不可行状态

---

## ai-client.ts

### 职责

负责小程序侧 AI 请求封装。

小程序前端不得直接调用外部大模型 API。  
ai-client.ts 只能调用后端服务或云函数。

### 允许做

- 调用 cloud/functions/generatePlan
- 传递必要的目标、DDL、每日可用时间和用户偏好
- 接收结构化 JSON 响应
- 将响应交给 schema 校验逻辑

### 禁止做

- 包含 AI API key
- 包含 AppSecret
- 直接请求外部大模型 API
- 绕过 schema 校验写入 storage
- 在日志中输出完整用户目标或复盘内容

---

## storage.ts

### 职责

负责统一数据读写。

MVP 阶段默认使用本地存储。后续如切换为云开发，应通过 adapter 替换实现。

### 允许做

- 保存和读取 Goal
- 保存和读取 UserProfile
- 保存和读取 DailyPlan[]
- 保存和读取 DailyReview[]
- 后续保存和读取 Plan、Stage、Task

### 禁止做

- 在页面层绕过 storage.ts 直接读写数据
- 在 planner.ts 或 replanner.ts 中直接读写数据
- 混用多个存储入口
- 在没有迁移策略的情况下修改存储 key
- 将 AI/塔罗建议直接写回 Task.status 或历史 Plan

建议接口：

```ts
saveGoal(goal: Goal): Promise<void>
getGoal(goalId: string): Promise<Goal | null>
saveUserProfile(profile: UserProfile): Promise<void>
getUserProfile(): Promise<UserProfile | null>
saveDailyPlans(goalId: string, plans: DailyPlan[]): Promise<void>
getDailyPlans(goalId: string): Promise<DailyPlan[]>
saveDailyReview(review: DailyReview): Promise<void>
getDailyReviews(goalId: string): Promise<DailyReview[]>
```

后续目标接口应围绕 `PlanBundle` 或 adapter 设计，避免页面层直接拼装 `Plan + Stage + Task`。

---

## date.ts

### 职责

负责所有日期计算。

### 允许做

- 日期格式化
- DDL 判断
- 起始日期判断
- 今日任务筛选
- 复盘截止时间判断
- 重排日期计算

### 禁止做

- 在页面层散落复杂日期计算
- 在 planner.ts 或 replanner.ts 中重复实现日期规则
- 混用多种日期格式

### 日期规则

- 所有日期统一使用 YYYY-MM-DD
- DDL 当天可以安排任务
- 默认复盘截止时间由 config/app-config.ts 的 reviewCutoffHour 定义
- 如果当前时间晚于 reviewCutoffHour，新建计划从次日开始
- 如果当前时间不晚于 reviewCutoffHour，新建计划可以从当天开始

## 2026-05-26 F14 实现记录

- `services/planner.ts` 已新增 `buildStarterPlanBundle()`，新 API 输出 `PlanBundle`。
- 规划策略为近 7 天生成具体 `Task`，超过 7 天的远期内容进入 `Stage`；`PlanBundle.plan` 不写入 `dailyKeyword` 或 `recommendedFocusWindow`。
- 旧 `buildStarterPlan()` 保留，并通过 `buildLegacyDailyPlansFromBundle()` 从 PlanBundle 降级为 `DailyPlan[]`。
- 创建目标页面现在保存 `PlanBundle`，并在迁移期继续写入 legacy `DailyPlan[]` 供旧页面读取。
- F14 不重构 replanner 或日历页面 UI。

## 2026-05-26 F15 实现记录

- `services/today-suggestion.ts` 新增 `buildTodaySuggestionFromPlanBundle()` 与 `buildTodaySuggestionFromDailyTaskViews()`，页面服务可从 `PlanBundle`/`DailyTaskView` 生成 `TodaySuggestionView`，旧 `DailyPlan[]` 入口继续作为兼容 adapter。
- `models/plan.ts` 新增 `PlanBundleCalendarView` 与 `buildPlanBundleCalendarView()`，从 `Plan/Stage/Task` 汇总近 7 天任务、远期阶段、进度和计划状态。
- `services/ai-client.ts` 新增 `requestTodayTaskSuggestion()`，新 AI 今日建议入口只接收受控的今日任务上下文；旧 `requestTodaySuggestion()` 会先提取当天任务再委托给新入口。
- AI/塔罗边界仍限制为表达和排序，不写回 `Task.status`、`DailyReview` 或历史 `Plan`。
