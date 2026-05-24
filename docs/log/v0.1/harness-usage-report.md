# Harness 使用体验报告

记录日期：2026-05-23

## 核心结论摘要

- harness 在本项目中确实提升了 v0.1 的开发推进效率，尤其是任务拆解、上下文续接、验证命令和进度记录。
- 当前项目账面状态完整：`docs/harness/feature_list.json` 中 F01-F07 全部为 `passing`，`npm.cmd run check` 已通过，8 个测试文件、39 个测试通过。
- 但 harness 的通过状态不能等同于产品真实闭环完全可靠。最明显的风险是 F07：`services/replanner.ts` 已实现并测试通过，但 `pages/review/index.vue` 保存复盘后没有调用 `replanAfterReview`，用户路径上不会自动重排。
- 当前代码适合作为 MVP 原型：数据模型清楚，核心 services 可测，页面能跑；但错误处理、页面集成验证、storage 异常处理、AI schema、端到端验证都不足。
- 文档体系比代码实现更完整，部分文档已经描述了未来架构能力，例如 AI schema 校验、storage 错误类型、review cutoff，但代码仍是 placeholder 或未实现。
- harness 降低了人工管理 feature 状态的压力，但也可能制造“文档记录完整，所以功能已可靠”的错觉。
- v0.2 前最应该先检查并修复“晚间复盘后是否真的触发自动重排”。

## 一、Harness 在当前项目中的实际使用方式

本项目中 harness 主要承担“任务地图、施工边界、验收闸门、进度交接”的职责。

核心入口是 `AGENTS.md`，其中定义了项目定位、必须读取的文档、feature 状态规则、功能选择规则、完成门禁和修改边界。它要求每次任务开始读取 `docs/harness/feature_list.json` 和 `docs/progress.md`，并规定任意时刻最多只能有一个 `active` feature。

`docs/harness/feature_list.json` 是实际任务清单。当前 F01-F07 均为 `passing`，每个 feature 都包含：

- `scope`：允许修改的页面、services、models、tests。
- `acceptance`：验收项。
- `verify`：静态、功能、系统级验证命令。
- `evidence`：命令结果、手动冒烟、完成说明。

`docs/harness/verification-policy.md` 定义了三层验证闸门：

- L1：`npm run verify:static`，包含 lint 和 typecheck。
- L2：当前 feature 的功能测试。
- L3：页面流程、storage、planner、replanner、date、跨模块协作等触发系统确认。

`docs/harness/instrumentation.md` 定义了验证信号的记录位置：

- `docs/harness/feature_list.json` 记录 feature evidence。
- `docs/progress.md` 记录当前状态摘要。
- `docs/decisions.md` 记录长期决策。
- `docs/log/` 记录流水、失败和版本总结。

当前版本总结已写入 `docs/log/progressv0.1.md`。本报告作为 harness 审计补充，记录在 `docs/log/harness-usage-report.md`。

## 二、Harness 对开发效率的帮助

harness 对效率的提升是真实的。

首先，它减少了重复沟通成本。F01-F07 的需求、范围、验收和验证命令都集中在 `feature_list.json`，断线或上下文丢失后可以从 `progress.md` 继续，不需要重新解释项目背景。

其次，它提升了多文件修改能力。例如 F03 初始任务拆解同时涉及 `services/planner.ts`、`services/date.ts`、`models/plan.ts`、`models/task.ts`、`pages/goal-create/index.vue` 和测试文件；F07 同时涉及 `services/replanner.ts`、`services/date.ts` 和 `tests/replanner.test.ts`。harness 的 scope 限制让修改范围比较可控。

再次，它让验证流程更系统。当前 `package.json` 提供了：

```json
{
  "verify:static": "npm run lint && npm run typecheck",
  "verify:feature": "npm run test",
  "verify:system": "npm run build:mp-weixin",
  "check": "npm run verify:static && npm run verify:feature && npm run verify:system"
}
```

最后，它降低了人工管理状态的压力。`docs/progress.md` 清楚记录了 F01-F07 的完成情况、验证命令、已知非阻塞 warning 和下一步。

明显不足是：harness 更擅长保证“任务文件被修改、测试命令通过、文档证据齐全”，但如果测试没有覆盖真实用户路径，它也会把不完整的产品闭环标记为完成。F03 曾出现页面按钮没有串联 planner 的集成缺口；F07 当前也存在服务实现与页面流程未接通的问题。

## 三、当前项目代码质量审计

### 1. 数据层

核心模型位于 `models/`：

- `models/goal.ts`
- `models/task.ts`
- `models/plan.ts`
- `models/review.ts`
- `models/user-profile.ts`
- `models/common.ts`

优点是类型清晰，字段少，适合 MVP。`Goal`、`Task`、`DailyPlan`、`DailyReview`、`UserProfile` 的边界容易理解。

主要问题是运行时数据校验不足。TypeScript 类型只能约束开发期，`services/storage.ts` 直接从 `uni.getStorageSync` 强制类型转换，例如：

```ts
return (uni.getStorageSync(dailyPlansKey(goalId)) as DailyPlan[] | '') || []
```

如果本地缓存中存在损坏数据、旧版本数据或结构不匹配数据，当前代码不会识别。

另一个问题是 `models/plan.ts` 不只做模型定义，还包含 `buildPlanCalendarDays` 和 `buildTodayView`。这些更像视图构建或业务服务逻辑，放在 models 中会让层级职责变模糊。

### 2. Services 服务层

当前 services 包括：

- `services/storage.ts`
- `services/planner.ts`
- `services/replanner.ts`
- `services/date.ts`
- `services/ai-client.ts`

`planner.ts` 和 `replanner.ts` 是当前质量相对较好的部分。它们是纯函数风格，测试容易写，也已经被 `tests/planner.test.ts` 和 `tests/replanner.test.ts` 覆盖。

但服务层也有明显短板：

- `storage.ts` 没有明确错误类型。
- `ai-client.ts` 只是 placeholder，始终返回 `AI plan generation is not configured.`。
- `replanner.ts` 没有页面调用入口，导致 F07 只在测试中闭环。
- `replanner.ts` 对重复调用的幂等性不足，可能重复生成 carryover 任务。
- `date.ts` 只实现基础日期格式化、日期区间和 addDays，没有实现文档中提到的 review cutoff 逻辑。

### 3. 页面层

当前页面包括：

- `pages/goal-create/index.vue`
- `pages/plan-calendar/index.vue`
- `pages/today/index.vue`
- `pages/review/index.vue`

页面能完成基础展示和输入，但文件偏重：

- `pages/goal-create/index.vue` 约 595 行。
- `pages/plan-calendar/index.vue` 约 350 行。
- `pages/today/index.vue` 约 360 行。
- `pages/review/index.vue` 约 392 行。

页面中混合了状态、事件、服务调用、toast、跳转和大量样式。MVP 阶段可以接受，但继续扩展时维护压力会快速上升。

最关键的问题在 `pages/review/index.vue`。保存复盘时只调用：

```ts
await saveDailyReview(review)
```

没有调用 `replanAfterReview`，也没有 `saveDailyPlans`。这与 `docs/harness/ARCHITECTURE.md` 中定义的核心数据流不一致：

```text
review 记录晚间复盘
→ replanner.ts 重排后续计划
→ storage.ts 保存更新结果
```

### 4. 状态管理

当前状态管理是最小方案：

- 页面内用 `ref` 和 `reactive`。
- 跨页面共享依赖 storage。
- 当前目标依赖 `current-goal-id`。
- 页面通过 `onShow` 重新读取数据。

这个方案简单、低成本，适合 v0.1。但缺点是没有集中 store，没有事件机制，没有脏数据处理。保存复盘、重排计划、回到日历之间的数据刷新完全依赖页面重新进入。

### 5. 接口与异步流程

当前没有真实网络接口。AI 客户端是 placeholder，云函数目录只有 ping 示例。

页面有基本 loading 和 empty state，例如 plan-calendar、today、review 都有 `isLoading`。但没有失败重试，没有细分错误原因，没有错误日志，也没有用户可恢复操作。

### 6. 错误处理

错误处理偏弱。页面中存在空 catch：

- `pages/goal-create/index.vue`
- `pages/review/index.vue`

这些 catch 会展示 toast，但会丢掉实际错误原因。对用户来说只能看到“保存失败，请稍后再试”；对开发者来说没有任何脱敏错误记录。

storage 文档中建议了错误类型：

```ts
type StorageErrorCode =
  | 'not_found'
  | 'read_failed'
  | 'write_failed'
  | 'invalid_data'
  | 'quota_exceeded'
```

但当前代码未实现。

### 7. 可维护性

目录结构清楚，测试文件与功能对应，文档也能帮助接手。但几个地方会影响后续维护：

- 页面单文件过大。
- models 中混入视图构建逻辑。
- storage 没有 adapter，后续切云开发会影响现有接口实现。
- 错误处理缺少统一模式。
- 文档记录比代码实现超前，容易造成误解。

### 8. 可扩展性

当前架构扩展到 v0.2 会遇到压力：

- 接真实 AI 前必须补 schema 和云函数边界。
- 接云端存储前必须补 storage adapter。
- 增加任务编辑、删除、拖动重排前必须补任务 id、幂等和历史策略。
- 增加页面自动化前需要明确小程序端到端测试方案。

### 9. 测试与验证

当前自动化测试覆盖核心纯函数和部分 storage mock。最近一次运行：

```text
npm.cmd run check
8 test files passed
39 tests passed
mp-weixin build completed
```

测试优势：

- planner 测试覆盖每日时长、DDL、低能量、不可行。
- replanner 测试覆盖 carryover、高优先级、每日上限、历史保留、不可行。
- review 测试覆盖结构化 review 保存。
- plan-calendar 和 today 有视图数据构建测试。

测试不足：

- 没有页面组件测试。
- 没有端到端点击流测试。
- 没有 storage 写入失败测试。
- 没有 schema 测试。
- 没有 F07 页面集成测试。

### 10. 文档与可观测性

文档是当前项目做得较好的部分。`progress.md`、`decisions.md`、`feature_list.json`、`verification-policy.md`、`instrumentation.md` 和 `progressv0.1.md` 都有实际用途。

但日志观测还不足。`docs/log/` 中目前只有 v0.1 总结和本报告，缺少每次手动冒烟的完整步骤、输入、实际结果。`instrumentation.md` 要求手动冒烟至少记录 feature id、操作路径、输入数据、实际结果、是否符合 acceptance、执行时间；当前 F01 和 F04 只有摘要型记录。

## 四、Harness 的局限性和风险

### 风险 1：制造“看起来完成”的假象

F07 是典型例子。`feature_list.json` 显示 F07 为 `passing`，`tests/replanner.test.ts` 也通过，但真实页面 `review/index.vue` 没有调用重排服务。服务层完成不等于用户路径完成。

### 风险 2：文档完整度高于代码完成度

`docs/architecture/ai-boundary.md` 对 AI schema 有完整要求，但 `schemas/ai-plan-schema.ts` 只是：

```ts
export interface AiPlanSchemaPlaceholder {
  status: 'pending'
}
```

这说明文档描述的是目标架构，不是当前实现。

### 风险 3：职责边界仍有偏差

架构文档要求页面层保持轻量，复杂业务逻辑放 services。但当前 `models/plan.ts` 包含视图构建逻辑，页面文件也承担较多编排职责。

### 风险 4：验证不足

自动化测试偏服务层。页面流程更多依赖人工确认，而人工确认记录不够细。F03 曾经靠手动测试发现“生成计划没有进入任务拆解页面”的问题，说明测试体系对页面集成覆盖不足。

### 风险 5：错误处理和日志不足

storage 没有错误类型，页面 catch 不记录错误。用户一旦遇到本地存储失败、缓存损坏或页面跳转失败，当前系统难以定位。

### 风险 6：无法审计提交记录

当前目录不是 git 仓库，运行 `git status --short` 返回 `fatal: not a git repository`。因此本报告未能基于提交历史审计每一步变更，只能基于当前文件状态、文档和命令结果审计。

## 五、分维度评分

| 维度 | 分数 | 理由 |
|---|---:|---|
| 项目理解能力 | 8 | 产品闭环和 F01-F07 依赖理解基本正确 |
| 任务拆解能力 | 8 | feature_list 拆分清楚，scope、acceptance、verify、evidence 完整 |
| 代码生成质量 | 6 | 核心逻辑可跑可测，但页面、错误处理和集成闭环不足 |
| 多文件协同修改能力 | 8 | models、services、pages、tests、docs 能同步推进 |
| 数据层设计质量 | 6 | 类型清晰，但缺运行时校验、迁移和版本策略 |
| services 服务层设计质量 | 6 | planner/replanner 纯函数较好，但 storage 和 AI 边界弱，F07 未接页面 |
| 页面层实现质量 | 5 | 页面可用，但文件偏重，缺组件拆分和页面级测试 |
| 验证与测试充分性 | 6 | 39 个测试和构建通过，但缺 E2E、异常、schema、页面集成 |
| 文档与记录质量 | 8 | 文档体系完整，但部分内容超前于实现 |
| 可维护性 | 6 | 目录清楚，但页面冗长、models 混入视图逻辑 |
| 可扩展性 | 5 | 接 AI、云存储、任务编辑前需要补架构基础 |
| 整体开发辅助价值 | 7 | 对 v0.1 推进有效，但不能替代人工验收和代码审计 |

## 六、问题清单和改进建议

| 问题描述 | 文件或模块 | 优先级 | 为什么是问题 | 建议如何修改 | 是否需要人工复核 |
|---|---|---|---|---|---|
| 晚间复盘保存后没有触发自动重排 | `pages/review/index.vue`、`services/replanner.ts` | 高 | F07 在服务层通过，但用户路径不闭环 | 保存 review 后读取 plans/profile，调用 `replanAfterReview`，成功后 `saveDailyPlans` | 需要 |
| storage 没有明确错误类型 | `services/storage.ts` | 高 | 写入失败、读取失败、数据损坏无法区分 | 增加 `StorageErrorCode` 或带 code 的异常，补失败测试 | 不必须 |
| AI schema 仍是 placeholder | `schemas/ai-plan-schema.ts` | 高 | 文档要求 AI 输出 schema，但当前无法校验真实 AI 输出 | v0.2 接 AI 前实现 schema 和测试 | 需要 |
| 缺少端到端页面验证 | `pages/`、`tests/`、`docs/log/` | 高 | F03 已出现页面集成漏测，F07 也存在同类风险 | 增加完整手动回归清单，后续考虑小程序自动化 | 需要 |
| 页面文件过重 | `pages/goal-create/index.vue`、`pages/review/index.vue` | 中 | UI、状态、业务编排、样式集中在单文件，后续维护困难 | 抽 submit service/composable 和可复用 UI 组件 | 不必须 |
| `models/plan.ts` 混入视图构建逻辑 | `models/plan.ts` | 中 | models 不再只负责数据结构，职责边界变模糊 | 拆到 `services/calendar.ts`、`services/today.ts` | 不必须 |
| replanner 幂等性不足 | `services/replanner.ts` | 中 | 重复复盘或重复调用可能生成重复 carryover | 增加去重策略和幂等测试 | 需要 |
| review cutoff 文档有要求但代码未实现 | `services/date.ts`、`docs/architecture/services-boundary.md` | 中 | 文档和实现不同步，计划起始日期规则可能误导 | 实现 cutoff helper，或从文档降级为未来项 | 需要 |
| 本地存储没有数据版本和迁移 | `services/storage.ts` | 中 | v0.2 修改数据结构后旧缓存可能读坏 | 增加 `schemaVersion` 或 storage adapter | 不必须 |
| 手动冒烟记录过于摘要 | `docs/log/`、`feature_list.json` evidence | 低 | 缺少操作路径、输入、实际结果，复盘价值有限 | 每次 smoke 单独写日志文件 | 需要 |
| 当前项目目录不是 git 仓库 | 项目根目录 | 低 | 无法审计提交历史和变更轨迹 | 在正确仓库根目录执行 git 审计，或初始化版本管理 | 需要 |

## 七、后续 1-2 天改进计划

### 第 1 天：先补真实闭环

先检查 `pages/review/index.vue`、`services/replanner.ts`、`services/storage.ts`。

优先修复：

- 复盘保存后调用 `replanAfterReview`。
- 重排成功后保存新的 `DailyPlan[]`。
- 重排失败时给用户明确提示，不要静默成功。
- 补一个测试覆盖 `review -> replanner -> saveDailyPlans` 的集成行为。

补充验证：

```powershell
npm.cmd run test -- review
npm.cmd run test -- replanner
npm.cmd run check
```

人工确认：

- 自动重排是保存复盘后立即执行，还是需要用户确认后执行。
- 重排失败时希望用户看到什么提示。
- 重复保存当天复盘时，是否覆盖已有 carryover。

### 第 2 天：降低后续维护风险

先检查 `models/plan.ts`、`pages/goal-create/index.vue`、`pages/today/index.vue`、`pages/plan-calendar/index.vue`。

建议处理：

- 将 `buildPlanCalendarDays` 拆到 `services/calendar.ts`。
- 将 `buildTodayView` 拆到 `services/today.ts`。
- 将 goal-create 的提交编排抽到服务函数，页面只负责展示和调用。
- 给 storage 增加错误类型或最小失败包装。
- 补一份完整 v0.1 手动回归日志到 `docs/log/`。

agent 可以自动处理：

- 抽 service。
- 补单元测试。
- 更新文档引用。
- 跑验证命令。

必须人工确认：

- 页面交互是否符合预期。
- v0.2 是否接真实 AI。
- 是否要引入云存储或继续本地 storage。

## 八、现在最应该先检查什么

现在最应该先检查：保存晚间复盘后，后续任务计划是否真的变化。

原因很直接：这是 v0.1 最核心的闭环终点。当前代码证据显示 `pages/review/index.vue` 只保存 review，没有调用 replanner。也就是说，F07 的服务层能力已经存在，但用户在页面上未必能用到。

建议人工检查路径：

```text
1. 创建一个目标，生成至少 3 天计划。
2. 进入今日任务，记录今天和后两天的任务。
3. 进入晚间复盘，把一个高优先级任务标为部分完成，把一个低优先级任务标为未完成。
4. 保存复盘。
5. 回到任务日历。
6. 检查后续日期是否出现“补完/补做”任务。
7. 检查高优先级补做是否排在低优先级之前。
8. 检查复盘当天原任务状态是否保留为 done、partial、skipped。
```

## 九、需要立即补充的验证

自动验证：

```powershell
npm.cmd run check
npm.cmd run test -- replanner
npm.cmd run test -- review
```

手动验证：

- 完整走一遍目标创建、计划生成、任务日历、今日任务、晚间复盘、后续重排。
- 手动记录输入数据和实际结果。
- 将结果写入 `docs/log/YYYY-MM-DD-v0.1-smoke.md` 或后续同类日志。

当前结论：harness 对 v0.1 的开发推进有明显价值，但它更像项目管理和基础质检工具，不是最终质量保证。v0.2 前应先补真实闭环验证，再继续增加新能力。
