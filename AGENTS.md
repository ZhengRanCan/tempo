# AGENTS.md

## 1. 项目定位

这是一个个性化 AI 任务日历小程序。

用户输入目标、截止日期、每日可用时间和状态偏好后，系统生成每日任务计划，并根据每日复盘动态调整后续安排。

详细产品定义见：

* `docs/harness/PRODUCT_SPEC.md`

---

## 2. 文档路由

核心入口：

* `AGENTS.md`：agent 工作入口、文档路由和任务启动流程。
* `docs/progress.md`：当前状态摘要、交接说明、风险记录。
* `docs/decisions.md`：长期重要决策。
* `docs/log/`：历史流水日志和版本归档，不作为默认任务入口。

Feature registry：

* `docs/harness/features/feature-index.json`：当前 feature 轻量索引。
* `docs/harness/features/README.md`：feature registry 使用规则，包括任务选择、状态规则、完成门禁、修改边界和维护规则。
* `docs/harness/features/individual_feature/<feature-id>/`：单个 feature 的完整合同，通常包含 `feature.md` 与 `verification.md`，旧 feature 可能仍使用 `feature.json`。

产品、约束、架构、设计：

* `docs/harness/PRODUCT_SPEC.md`：产品定义和 MVP 边界。
* `docs/harness/CONSTRAINTS.md`：产品、AI、安全、工程硬约束。
* `docs/harness/ARCHITECTURE.md`：架构、类型、模块边界。
* `docs/harness/DESIGN.md`：视觉和交互规范。
* `docs/harness/INITIALIZATION_CONTRACT.md`：初始化状态和验证命令。
* `docs/architecture/`：架构细节文档目录，按需读取。

不要默认读取所有文档。只读取当前任务必需文档。

---

## 3. 每次任务开始必须读取

每次任务开始，必须先读取：

1. `docs/harness/features/feature-index.json`
2. `docs/progress.md`
3. `docs/harness/features/README.md`

然后按 `docs/harness/features/README.md` 中的规则确定当前 feature。

确定 feature 后，只读取该 feature 的完整合同：

* 如果 feature 目录中有 `feature.json`，读取 `feature.json`。
* 如果没有 `feature.json`，读取 `feature.md` 和 `verification.md`。
* 不要默认读取所有 feature 的 `feature.json`、`feature.md` 或 `verification.md`。

---

## 4. 按任务类型补充读取

根据任务类型再按需读取：

* 判断产品范围：`docs/harness/PRODUCT_SPEC.md`
* 修改页面、组件、交互或视觉样式：`docs/harness/DESIGN.md`
* 修改 models、services、config 或数据流：`docs/harness/ARCHITECTURE.md`
* 修改 Goal、Plan、Stage、Task、DailyPlan、TaskStatus、PlanStatus 或数据迁移：`docs/architecture/goal-plan-task-state-model.md`
* 修改 storage key、旧数据兼容或迁移逻辑：`docs/architecture/storage-strategy.md`
* 修改 planner、replanner、today-suggestion、ai-client 或 tarot 服务边界：`docs/architecture/services-boundary.md`
* 涉及 AI、隐私、密钥、日期规则或任务重排：`docs/harness/CONSTRAINTS.md`
* 修改测试、验证命令或 CI 配置：`docs/harness/INITIALIZATION_CONTRACT.md`
* 查找验证、失败或手动冒烟记录位置：`docs/harness/instrumentation.md`

---

## 5. 标准工作流程

1. 读取 `feature-index.json`、`docs/progress.md` 和 `docs/harness/features/README.md`。
2. 按 feature registry 规则确定当前 feature。
3. 读取当前 feature 的完整合同。
4. 如果开始新 feature，将索引和 feature 合同状态改为 `active`。
5. 只修改当前 feature scope 允许范围内的文件。
6. 按 feature 合同实现。
7. 更新当前 feature 的 evidence 或验证记录。
8. 同步更新 `feature-index.json` 状态。
9. 更新 `docs/progress.md`。
10. 如有长期决策，更新 `docs/decisions.md`。
11. 满足 feature registry 的完成门禁后，才允许将状态改为 `passing`。
