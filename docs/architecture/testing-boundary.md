# testing-boundary.md

## 目的

本文档定义 MVP 阶段哪些模块必须测试，以及测试优先级。

测试目标不是追求高覆盖率数字，而是保证核心任务计划逻辑可验证、可回归。

---

## 测试优先级

优先测试 services 层。

原因：

- services 层承载核心业务逻辑
- services 层可以脱离小程序 UI 运行
- services 层更适合在 CI 中自动化验证

页面层测试可以后置，但页面层不得承载核心业务逻辑。

---

## 必须优先测试的模块

```text
services/
├── planner.ts
├── replanner.ts
├── date.ts
└── storage.ts

schemas/
└── ai-plan-schema.ts
```

---

## planner.ts 测试

至少覆盖：

- 能根据目标、DDL、每日可用时间生成计划
- 每日任务总时长不超过 dailyAvailableMinutes
- DDL 当天可以安排任务
- 每个任务都有 title、estimatedMinutes、priority、minimumLine
- low 状态下优先给出最低完成线
- 无法在 DDL 前完成时返回不可行状态
- fallback 计划不依赖真实 AI 响应

---

## replanner.ts 测试

至少覆盖：

- done 任务不被重排
- partial 任务可以生成后续补充任务
- skipped 任务不会被静默丢弃
- 未完成任务可以移动到后续日期
- 重排后每日任务总时长不超过 dailyAvailableMinutes
- 重排不能超过 DDL
- 无法安排时返回不可行状态

---

## date.ts 测试

至少覆盖：

- YYYY-MM-DD 格式化
- DDL 当天可安排任务
- 当前时间早于 reviewCutoffHour 时可从当天开始
- 当前时间晚于 reviewCutoffHour 时从次日开始
- 今日任务筛选正确
- 日期跨月、跨年场景正确

---

## storage.ts 测试

至少覆盖：

- 保存和读取 Goal
- 保存和读取 UserProfile
- 保存和读取 DailyPlan[]
- 保存和读取 DailyReview
- 删除目标时处理相关计划和复盘
- 读取不存在数据时返回 null 或空数组
- 写入失败时返回明确错误

---

## schema 测试

AI 输出 schema 至少覆盖：

- 合法 JSON 可以通过
- 缺少 minimumLine 时失败
- estimatedMinutes 非正数时失败
- priority 非 high、medium、low 时失败
- date 非 YYYY-MM-DD 时失败
- 每日任务总时长超过 dailyAvailableMinutes 时失败
- infeasible 状态必须包含 reason 和 suggestions

---

## 测试命令

标准完整验证命令为：

```bash
npm run check
```

npm run check 的具体组成由 package.json、docs/harness/INITIALIZATION_CONTRACT.md 和 docs/harness/verification-policy.md 定义。

建议初始命令：

```bash
npm run lint
npm run typecheck
npm run test
```

---

## 测试数据原则

测试数据必须小而明确。

测试中允许使用 mock AI 输出，不允许依赖真实模型响应。

测试不要使用真实用户隐私数据。

建议测试目标示例：

```text
目标：7 天内完成开题报告初稿
DDL：2026-06-01
每日可用时间：60 分钟
用户状态：normal
```

---

## 完成判定

涉及核心规划逻辑的功能，不能只凭 UI 显示判断完成。

至少需要满足：

- 对应功能 acceptance 满足
- 对应 verify 命令通过
- npm run check 通过
- docs/progress.md 记录验证结果

如果测试失败，不得将功能状态改为 passing。
