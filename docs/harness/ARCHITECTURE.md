# ARCHITECTURE.md

## 目的

本文档是项目架构入口，相当于数据层、services 层和模块边界的 README。

本文件只说明架构分层、当前实现状态和详细文档路由。具体类型字段、storage key、services 规则和测试要求应阅读 `docs/architecture/` 下的细节文档。

## 架构目标

本项目是一个个性化 AI 任务日历小程序。

系统采用：

```text
pages 页面层
→ services 业务层
→ models / schemas 类型与校验层
→ storage 存储边界
→ AI / tarot suggestion 计算视图
```

页面层只负责展示、输入收集、页面跳转和调用 services。复杂业务逻辑必须放在 services 层。

详细产品边界见 `docs/harness/PRODUCT_SPEC.md`。  
详细硬约束见 `docs/harness/CONSTRAINTS.md`。

## 当前实现状态

当前代码仍以 v0.1/v0.2 早期结构为主：

```text
Goal
UserProfile
DailyPlan[]
Task
DailyReview
TodaySuggestion
```

其中 `DailyPlan[]` 同时承担了持久化计划、日历页面数据来源和今日任务数据来源。这能支撑 MVP，但已经不适合后续页面规范中的 `Goal / Plan / Stage / Task` 分层。

后续数据层目标模型见：

```text
docs/architecture/goal-plan-task-state-model.md
```

在模型迁移完成前，不得直接删除 `DailyPlan` 或修改旧 storage key。必须先提供 legacy adapter / migration，并保证 v0.1/v0.2 已保存数据仍可读取。

## 目标数据模型方向

后续数据层应迁移到：

```text
Goal
└── Plan
    ├── Stage[]
    └── Task[]

DailyReview
TodaySuggestion
UserProfile
```

职责边界：

- `Goal`：用户想完成的目标。
- `Plan`：围绕 Goal 生成的一套计划和整体计划状态。
- `Stage`：远期阶段安排，主要用于 DDL 超过 7 天的长期计划。
- `Task`：具体可执行任务。
- `DailyReview`：复盘事实记录。
- `TodaySuggestion`：今日展示建议，是计算视图，不是计划真相来源。
- `UserProfile`：安排偏好和表达偏好。

关键规则：

- 任务完成不等于目标完成。
- 任务跳过不等于目标取消。
- 重排计划不等于目标失败。
- AI / 塔罗只能影响表达和排序，不能直接写回 `Task.status`、`DailyReview` 或历史 Plan。
- `DailyPlan` 后续应降级为每日视图或旧数据兼容 adapter。

## 核心数据流

当前实现主流程：

```text
用户创建 Goal
→ planner.ts 生成 DailyPlan[]
→ storage.ts 保存 Goal / DailyPlan[]
→ plan-calendar 展示任务日历
→ today 展示今日任务和 TodaySuggestion
→ review 记录 DailyReview
→ replanner.ts 基于 DailyReview 重排后续 DailyPlan[]
→ storage.ts 保存更新结果
```

目标模型主流程：

```text
用户创建 Goal
→ planner.ts 生成 PlanBundle(Plan + 近 7 天 Task + 远期 Stage)
→ storage.ts 保存 PlanBundle
→ selector / adapter 生成页面所需视图
→ today 展示 Task + TodaySuggestion
→ review 记录 DailyReview
→ replanner.ts 基于 DailyReview 更新 Plan / Task 或生成新 Plan 版本
→ storage.ts 保存更新结果并保留历史事实
```

## 目录结构

```text
TEMPO/
├── pages/
│   ├── goal-create/
│   ├── plan-calendar/
│   ├── today/
│   ├── review/
│   └── profile/
├── components/
├── services/
│   ├── planner.ts
│   ├── replanner.ts
│   ├── ai-client.ts
│   ├── storage.ts
│   ├── tarot.ts
│   ├── today-suggestion.ts
│   └── date.ts
├── models/
├── schemas/
└── config/

tests/
cloud/functions/
docs/architecture/
```

## 层级职责

### pages

负责展示、输入收集、页面跳转和调用 services。

禁止在页面层写复杂任务拆解、任务重排、AI 调用、存储读写和复杂日期计算。

### services

负责核心业务逻辑。

- `planner.ts`：初始任务拆解。当前输出 `DailyPlan[]`，目标输出 `PlanBundle`。
- `replanner.ts`：根据复盘重排任务。当前基于 `DailyPlan[]`，目标基于 Plan / Task。
- `today-suggestion.ts`：生成今日建议视图，不写回核心计划状态。
- `ai-client.ts`：AI 请求客户端，只能调用后端或云函数，不暴露密钥。
- `tarot.ts`：塔罗表达 fallback，不做预测或诊断。
- `storage.ts`：统一数据读写入口和 legacy 数据兼容边界。
- `date.ts`：统一日期计算入口。

### models

负责核心类型定义、normalize 和轻量构建函数。

当前源码以 `Goal / DailyPlan / Task / DailyReview / UserProfile` 为主。后续新增目标模型时，应先保留旧类型，再增加新类型和 adapter，不得直接破坏旧数据读取。

### schemas

负责 AI 输出和关键数据结构的 schema 校验。

AI 输出必须先通过 schema 校验，再进入 suggestion 或受控服务流程。不得绕过 schema 写入 storage。

### config

负责默认专注时长、每日任务数、复盘截止时间、AI 开关等配置。

## 架构细节路由

| 任务 | 必读文档 |
|---|---|
| 修改数据模型、计划结构、任务状态 | `docs/architecture/goal-plan-task-state-model.md` |
| 查看当前代码模型快照 | `docs/architecture/data-models.md` |
| 修改 services 职责或业务边界 | `docs/architecture/services-boundary.md` |
| 修改 AI / Deepseek / 塔罗边界 | `docs/architecture/ai-boundary.md` |
| 修改 storage、storage key、迁移策略 | `docs/architecture/storage-strategy.md` |
| 修改测试策略或验证边界 | `docs/architecture/testing-boundary.md` |
| 修改页面 UI 或页面结构 | `docs/harness/DESIGN.md` 与 `docs/design/page/README.md` |

只有修改对应模块时，才读取对应细节文档。不要把所有文档都作为默认上下文加载。

## 功能与模块映射

### v0.1 / v0.2 已实现映射

| 功能项 | 主要页面 | 主要 services | 主要 models |
|---|---|---|---|
| F01 创建目标 | goal-create | storage、date | Goal |
| F02 用户状态与偏好输入 | profile | storage | UserProfile |
| F03 初始任务拆解 | plan-calendar | planner、storage、date | Goal、Task、DailyPlan |
| F04 任务日历页面 | plan-calendar | storage、date | DailyPlan、Task |
| F05 今日任务页 | today | storage、date、today-suggestion | Task、DailyPlan、UserProfile |
| F06 晚间复盘 | review | storage、date | DailyReview、Task |
| F07 自动重排后续计划 | plan-calendar、today | replanner、storage、date | Task、DailyPlan、DailyReview |
| F08 数据层整理 | 无页面 | storage、today-suggestion | Goal、Task、DailyPlan、DailyReview、UserProfile |
| F11 AI/塔罗接口预留 | 无页面 | ai-client、tarot、today-suggestion | AiTodaySuggestion、TarotDraw、Task、DailyPlan |

### 后续目标映射

| 工作方向 | 主要 services | 主要 models | 注意事项 |
|---|---|---|---|
| 新计划模型 | planner、storage | Goal、Plan、Stage、Task | 保留旧 DailyPlan 兼容 |
| 旧数据迁移 | storage | DailyPlan、PlanBundle | migration 必须可重复执行 |
| 今日建议 | today-suggestion | Task、TodaySuggestion、UserProfile、TarotDraw | 不写回 Task.status |
| 重排计划 | replanner、storage | Plan、Task、DailyReview | 不改写复盘历史事实 |
| 页面读取适配 | storage、selector / adapter | DailyTaskView、PlanProgress | 页面不直接拼装底层存储结构 |

## 默认架构原则

- 页面层保持轻量。
- 业务逻辑集中在 services。
- 日期计算集中在 `date.ts`。
- 数据读写集中在 `storage.ts`。
- 模型迁移必须兼容旧数据。
- storage key 变更必须有迁移策略。
- AI 不直接修改存储。
- AI 输出必须经过 schema 校验。
- `TodaySuggestion` 是计算视图，不是计划真相来源。
- planner、replanner、date、storage 应保持可测试。

## 数据层修改规则

修改 `models/`、`services/storage.ts`、`services/planner.ts`、`services/replanner.ts` 或 `services/today-suggestion.ts` 前，必须先确认：

1. 是否影响 `Goal / Plan / Stage / Task` 目标模型。
2. 是否影响旧 `DailyPlan[]` 数据读取。
3. 是否需要新增 normalize / migrate adapter。
4. 是否会改变 storage key。
5. 是否会改变页面读取的数据形状。
6. 是否需要补 `tests/data-layer.test.ts`、`tests/storage.test.ts`、`tests/planner.test.ts`、`tests/replanner.test.ts` 或 `tests/today-suggestion.test.ts`。

没有迁移策略时，不得直接删除旧字段、旧类型或旧 storage key。
