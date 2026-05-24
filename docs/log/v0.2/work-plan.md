# App v0.2 工作计划

## 版本定位

App v0.2 不直接上线完整 Deepseek 或塔罗功能。

这一版的目标是先修好 v0.1 暴露出来的基础问题：

- 数据层整理：让目标、用户状态、任务、计划、复盘和今日建议之间的边界更清楚。
- UI 与导航整理：让用户打开小程序后知道先看哪里、怎么切换页面、每个卡片表达更统一。
- Deepseek / 塔罗接口预留：只预留类型、schema、服务边界和 fallback，不接真实外部能力。

另一个目标是继续测试 harness 系统：v0.2 的每个 feature 都必须使用 `completionGate`，用 L3b 用户路径证据防止“代码写完但主路径没有验证”。

## 执行原则

本版本不允许 agent 同时展开三条主线。

执行顺序固定为：

```text
数据层整理 -> UI/导航整理 -> Deepseek/塔罗接口预留
```

如果前一条主线没有通过验证闸门，后一条主线不得开始。

## 功能顺序

| Feature | 主线 | 状态 | 目的 |
|---|---|---|---|
| F08 | 数据层 | active | 整理 v0.1 数据结构、兼容读取和今日建议边界 |
| F09 | UI/导航 | not_started | 建立底部 tab、顶部页面标题区和页面顺序 |
| F10 | UI/组件 | not_started | 抽取核心组件并整理页面视觉 |
| F11 | AI/塔罗预留 | not_started | 预留 Deepseek 与塔罗的类型、schema、服务边界和 fallback |

## 主线一：数据层整理

目标：

- 明确持久化数据和计算视图的区别。
- 保证 v0.1 已保存数据能被 v0.2 安全读取。
- 给后续 AI/塔罗建议留出边界，但不让它们直接修改原始任务历史。

重点检查：

- `Goal`
- `UserProfile`
- `Task`
- `DailyPlan`
- `DailyReview`
- `TodaySuggestion` 或同类计算视图
- `storage.ts` 的空数据、旧数据、异常数据处理

完成标准：

- 自动化测试覆盖旧数据兼容和空数据返回。
- 页面主路径不因缺失字段崩溃。
- AI/塔罗相关字段不污染 `Task.status`、`DailyReview` 和历史 `DailyPlan`。

## 主线二：UI 与导航整理

目标：

- 今日任务成为第一入口。
- 底部 tab 承担主导航。
- 顶部区域只承担页面标题和上下文说明，不做重复主导航。
- 核心卡片组件按设计系统统一。

建议页面顺序：

```text
今日 -> 日历 -> 创建 -> 我的
```

重点组件：

- `AppPageHeader`
- `TaskCard`
- `TodayFocusCard`
- `EmptyState`
- `EnergySelector`

完成标准：

- 微信开发者工具中底部 tab 可以真实切换。
- 今日任务、任务日历、创建目标、个人页均可到达。
- 主要页面先符合 `docs/harness/DESIGN.md` 的总原则，再按 `docs/design/visual-system.md` 和 `docs/design/components.md` 落到具体样式与组件。
- 未完成、低能量、空状态不使用高压力表达。

## 主线三：Deepseek / 塔罗接口预留

目标：

- 只做接口边界，不做完整能力上线。
- Deepseek 未来只能通过受控服务进入。
- 塔罗只作为行动提示和仪式感输入，不作为预测依据。
- 无真实 AI 时必须有 deterministic fallback。

建议边界：

- `models/tarot.ts`
- `models/ai-suggestion.ts`
- `schemas/ai-suggestion.ts`
- `services/ai-client.ts`
- `services/tarot.ts`
- `services/today-suggestion.ts`

完成标准：

- 不在小程序前端暴露 API key。
- AI 输出必须是结构化 JSON，并经过 schema 校验。
- AI/塔罗建议只影响今日建议的表达和排序。
- 不生成心理诊断、健康判断或命运预测。

## Harness 观察点

v0.2 需要重点观察 harness 是否真的减少风险：

- `completionGate` 是否能阻止未验证用户路径的 feature 被标记为 `passing`。
- L3b 是否能提前发现页面入口、跨模块读写和构建产物问题。
- 文档数量是否保持克制，没有为了验证继续扩散。
- `feature_list.json` 是否足够指导 agent 一项一项工作。
- 手动冒烟记录是否比 v0.1 更具体。

## 人工确认点

以下内容需要用户人工复核：

- F09：底部 tab 文案和顺序。
- F10：v0.2 页面视觉是否比 v0.1 更舒服。
- F11：塔罗文案边界和仪式感强度是否符合产品方向。

## 验证要求

每个 feature 完成前都必须：

- 通过 L1：`npm run verify:static`
- 通过对应 L2：当前 feature 的 `verify.feature`
- 通过 L3a：`npm run verify:system`
- 补 L3b：集成测试、端到端测试或手动冒烟记录
- 通过 harness gate：`npm run verify:harness`

在 Windows 当前环境中优先使用：

```bash
npm.cmd run check
```
