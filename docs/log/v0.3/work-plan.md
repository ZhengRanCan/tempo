# App v0.3 工作计划

## 版本定位

App v0.3 的目标是完成数据模型与 services 的渐进式全量迁移。

本版本不优先做新功能，也不优先做 UI 视觉重构。UI 修改必须排在模型和 services 迁移之后，只做对新数据读取方式必要的页面适配。

## 核心目标

- 将当前 `Goal + DailyPlan[] + Task + DailyReview` 结构逐步迁移到 `Goal + Plan + Stage + Task`。
- 保留 v0.1/v0.2 旧 `DailyPlan[]` 数据读取能力。
- 让 `services/` 最终围绕新模型工作，而不是继续以 `DailyPlan[]` 作为计划真相来源。
- 页面层通过 services、selector 或 adapter 读取页面视图，不直接拼装底层存储结构。
- 在数据层和 services 稳定后，再修改相关 UI。

## 执行原则

本版本必须按顺序执行，不允许 agent 同时展开多条主线。

固定顺序：

```text
模型扩展
-> storage 迁移边界
-> planner 新输出
-> 今日/日历视图服务
-> replanner 新模型重排
-> 页面 UI 与数据读取适配
```

如果前一个 feature 没有通过验证闸门，后一个 feature 不得开始。

## 功能顺序

| Feature | 主线 | 状态 | 目的 |
|---|---|---|---|
| F12 | models | active | 新增目标模型类型和 legacy adapter，不改变运行时主路径 |
| F13 | storage | not_started | 新增 PlanBundle 读写和旧 DailyPlan 迁移边界 |
| F14 | planner | not_started | 让 planner 输出 PlanBundle，并保留 legacy 输出适配 |
| F15 | view services | not_started | 让 today/calendar/AI suggestion 读取新页面视图 |
| F16 | replanner | not_started | 让重排逻辑基于 Plan/Task/DailyReview 工作 |
| F17 | UI integration | not_started | 在新数据层稳定后适配页面 UI 和用户路径 |

## 主线一：models 迁移

目标：

- 新增 `GoalStatus`、`PlanStatus`、`StageStatus`、`TaskType`。
- 新增 `Plan`、`Stage`、`PlanBundle`、`DailyTaskView`、`PlanProgress`。
- 保留 `DailyPlan`，不要删除旧类型。
- 提供 `fromLegacyDailyPlans()` 和 `toLegacyDailyPlans()`。
- `Task` 支持 `scheduledDate`，旧 `date` 可兼容映射。
- `DailyReview` 支持目标 `taskResults` 结构，旧三组 task id 继续兼容。

完成标准：

- 旧数据 normalize 仍通过。
- 新目标模型类型可以独立测试。
- adapter 可重复执行，不丢失任务状态。

## 主线二：storage 迁移

目标：

- 新增 schema version 或等价迁移标识。
- 新增 PlanBundle 读写接口。
- 继续支持 `daily-plans:{goalId}` 读取。
- 迁移旧 `DailyPlan[]` 时不覆盖已完成、部分完成、跳过状态。
- storage 对空数据、旧数据、坏数据仍返回明确结果。

完成标准：

- 新旧 storage 测试同时通过。
- 页面还未迁移时，旧接口仍可用。
- 迁移函数可重复调用。

## 主线三：planner 迁移

目标：

- `buildStarterPlan` 或新 planner API 输出 `PlanBundle`。
- 近 7 天生成具体 Task。
- 7 天之后生成 Stage。
- 不再把 `dailyKeyword`、`recommendedFocusWindow` 写成计划真相来源。
- 提供 legacy adapter，保证旧页面和旧测试在迁移期间不崩。

完成标准：

- 不可行计划仍返回明确 `infeasible`。
- 每日任务总时长不超过 `dailyAvailableMinutes`。
- DDL 当天仍可安排任务。
- low 状态仍优先保留最低完成线。

## 主线四：today/calendar 视图服务迁移

目标：

- 新增或整理 selector/view service，让页面读取 `DailyTaskView`、`PlanProgress` 等视图。
- `today-suggestion.ts` 从依赖 `DailyPlan[]` 迁移到依赖 Task/DailyTaskView。
- `ai-client.ts` 的 today suggestion 输入不再暴露完整历史计划。
- 日历页数据来自 Plan/Stage/Task 视图，而不是直接读 `DailyPlan[]`。

完成标准：

- 今日建议仍不修改 `Task.status`、`DailyReview` 或历史 Plan。
- AI/塔罗仍只影响表达和排序。
- 无 AI 凭据时 deterministic fallback 继续可用。

## 主线五：replanner 迁移

目标：

- 重排逻辑基于 Plan/Task/DailyReview。
- 明确任务顺延策略：保留原 Task 更新 `scheduledDate`，或生成补做 Task，并记录来源关系。
- 复盘记录作为历史事实，不被重排逻辑静默改写。
- 重排失败时返回明确 `infeasible` 和调整建议。

完成标准：

- done 任务不会被重排。
- partial / skipped 不会静默丢失。
- 重排不会超过 DDL 或每日可用时间。
- 任务历史可追踪。

## 主线六：UI 适配

目标：

- 在新 services 稳定后，页面改用新视图服务。
- 今日任务页读取 Task/DailyTaskView/TodaySuggestion。
- 任务日历页读取 Goal/Plan/Stage/Task 视图。
- 创建目标页触发新 PlanBundle 生成流程。
- 我的页读取 Goal/PlanProgress/UserProfile。
- UI 样式遵守 `docs/harness/DESIGN.md`、`docs/design/README.md` 和 `docs/design/page/`。

完成标准：

- 创建目标 -> 生成计划 -> 今日任务 -> 日历 -> 复盘 -> 重排主路径可运行。
- 旧数据用户打开页面不会崩溃。
- 空状态、错误状态和 loading 状态明确。
- 页面不直接拼装底层 storage 结构。

## 不做的事情

- 不接入真实 Deepseek 网络请求。
- 不上线完整塔罗抽牌 UI。
- 不迁移到云端存储。
- 不新增多目标管理完整体验。
- 不删除旧数据读取能力。
- 不在数据层未稳定前重构页面视觉。

## Harness 观察点

- feature 是否能阻止 agent 同时改 models、services 和 UI。
- L3b 是否能覆盖跨层用户路径，而不是只跑单元测试。
- 迁移文档是否真的减少歧义，而不是继续堆文档。
- 旧数据兼容是否被测试证明。

## 人工确认点

- F12：新模型字段和 `DailyPlan` 降级策略是否符合产品理解。
- F16：任务顺延策略是修改原 Task，还是生成补做 Task。
- F17：新数据层接入后，页面表现是否符合 v0.2 后整理的页面规范。

## 验证要求

每个 feature 完成前都必须：

- 通过 L1：`npm.cmd run verify:static`
- 通过对应 L2：当前 feature 的 `verify.feature`
- 通过 L3a：`npm.cmd run verify:system`
- 补 L3b：集成测试、端到端测试或手动冒烟记录
- 通过 harness gate：`npm.cmd run verify:harness`

当前 Windows 环境优先使用：

```bash
npm.cmd run check
```
