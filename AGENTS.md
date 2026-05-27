# AGENTS.md

## 项目定位

这是一个个性化 AI 任务日历小程序。
用户输入目标、截止日期、每日可用时间和状态偏好后，系统生成每日任务计划，并根据每日复盘动态调整后续安排。

详细产品定义见 `docs/harness/PRODUCT_SPEC.md`。

---

## 文档路由

- `AGENTS.md`：入口、流程和状态规则
- `docs/progress.md`：当前状态摘要和交接说明
- `docs/decisions.md`：长期重要决策
- `docs/log/`：后续按 day1、log1 等方式记录的流水日志
- `docs/harness/feature_list_v0.3.json`：当前版本功能规格、状态、修改范围、验证要求和完成证据
- `docs/harness/verification-policy.md`：三层验证闸门和 harness gate
- `docs/harness/instrumentation.md`：验证结果记录位置速查
- `docs/harness/PRODUCT_SPEC.md`：产品定义和 MVP 边界
- `docs/harness/CONSTRAINTS.md`：产品、AI、安全、工程硬约束
- `docs/harness/ARCHITECTURE.md`：架构、类型、模块边界
- `docs/harness/DESIGN.md`：视觉和交互规范
- `docs/harness/INITIALIZATION_CONTRACT.md`：初始化状态和验证命令
- `docs/architecture/`：架构细节文档目录，按需读取

---

## 每次任务开始必须读取

- `docs/harness/feature_list_v0.3.json`
- `docs/progress.md`

按任务类型再读取：

- 判断产品范围：`docs/harness/PRODUCT_SPEC.md`
- 修改页面、组件、交互或视觉样式：`docs/harness/DESIGN.md`
- 修改 models、services、config 或数据流：`docs/harness/ARCHITECTURE.md`
- 修改 Goal、Plan、Stage、Task、DailyPlan、TaskStatus、PlanStatus 或数据迁移：`docs/architecture/goal-plan-task-state-model.md`
- 修改 storage key、旧数据兼容或迁移逻辑：`docs/architecture/storage-strategy.md`
- 修改 planner、replanner、today-suggestion、ai-client 或 tarot 服务边界：`docs/architecture/services-boundary.md`
- 涉及 AI、隐私、密钥、日期规则或任务重排：`docs/harness/CONSTRAINTS.md`
- 修改测试、验证命令或 CI 配置：`docs/harness/INITIALIZATION_CONTRACT.md`
- 判断功能是否完成：`docs/harness/verification-policy.md`
- 查找验证、失败或手动冒烟的记录位置：`docs/harness/instrumentation.md`

不要默认读取所有文档。

---

## 功能状态

功能项指 `docs/harness/feature_list_v0.3.json` 中的当前版本功能列表。

状态只能是：

- `not_started`
- `active`
- `blocked`
- `passing`

任意时刻最多只能有一个 `active` 功能。

---

## 功能选择规则

- 如果已有 `active` 功能，继续完成该功能。
- 如果没有 `active` 功能，选择依赖已满足且 id 最小的 `not_started` 功能。
- 不得绕过 `dependsOn`。
- 不得同时实现多个功能。
- 额外问题只记录到 `docs/progress.md` 或 `docs/log/`，不要顺手展开。

---

## 标准工作流程

1. 读取 `docs/harness/feature_list_v0.3.json` 和 `docs/progress.md`。
2. 确定当前 feature。
3. 如需开始新 feature，将其状态改为 `active`。
4. 只修改当前 feature 的 `scope` 允许范围。
5. 实现后按 `docs/harness/verification-policy.md` 执行 L1/L2/L3 和 `verify:harness`。
6. 更新当前 feature 的 `evidence`。
7. 更新 `docs/progress.md`。
8. 如有长期决策，更新 `docs/decisions.md`。
9. 验证闸门通过后，才允许把状态改为 `passing`。

---

## 完成门禁

只有同时满足以下条件，才允许将 feature 改为 `passing`：

- acceptance 全部满足
- L1 静态校验通过
- L2 功能验证通过
- 如触发 L3 条件，L3a 系统确认和 L3b 用户路径证据均已记录
- `npm run verify:harness` 通过
- `docs/harness/feature_list_v0.3.json` 的 `evidence` 已更新
- `docs/progress.md` 已更新
- 没有未解释的临时文件、`console.log`、`debugger` 或无关改动

失败处理按 `docs/harness/verification-policy.md` 执行。

---

## 修改边界

- 默认只允许修改当前 `active` feature 的 `scope` 内文件。
- 不做与当前 feature 无关的重构、优化或新功能。
- 必须修改共享模块时，原因和影响范围写入 `docs/progress.md`。
- 数据层重构必须先更新或确认 `docs/harness/ARCHITECTURE.md` 和 `docs/architecture/goal-plan-task-state-model.md`，再修改代码。
- 不得在没有 legacy adapter 或 migration 说明的情况下删除 `DailyPlan`、旧字段或旧 storage key。
- 页面层不得直接拼装 `Plan + Stage + Task` 底层存储结构；应通过 services、selector 或 adapter 读取页面所需视图。
