# Feature Registry

## 1. 作用

本目录是当前 harness 驱动开发的 feature registry。

`feature-index.json` 是轻量入口，只用于快速选择当前任务。它只应包含选择任务所需的短字段，例如：

* `id`
* `title`
* `status`
* `feature_folder`
* `version`

每个 feature 的完整合同放在对应 feature 目录中，形式为以下二选一：

```text
docs/harness/features/individual_feature/<feature-id>/feature.json
```

或：

```text
docs/harness/features/individual_feature/<feature-id>/feature.md
docs/harness/features/individual_feature/<feature-id>/verification.md
```

旧 feature 可以继续使用 `feature.json`。新的 UI、设计、人工验收较多的 feature，优先使用 `feature.md` + `verification.md`。

---

## 2. Feature 合同格式

Feature 合同用于定义一个功能任务的完整执行边界，包括：

* feature 目标；
* 任务边界；
* 允许修改范围；
* 不允许修改范围；
* acceptance criteria；
* verification requirements；
* completion evidence。

### JSON 合同

适用于需要强机器可读结构的 feature：

```text
individual_feature/<feature-id>/feature.json
```

### Markdown 合同

适用于需要描述视觉意图、截图证据、人工检查、页面样式或复杂任务边界的 feature：

```text
individual_feature/<feature-id>/feature.md
individual_feature/<feature-id>/verification.md
```

Markdown 合同中：

* `feature.md` 定义任务目标、任务边界、scope、acceptance 和 out-of-scope；
* `verification.md` 定义验证命令、人工检查、截图要求和 passing evidence。

---

## 3. Feature 选择规则

每次任务开始时：

1. 读取 `docs/harness/features/feature-index.json`。
2. 读取 `docs/progress.md`。
3. 如果已有 `active` feature，继续完成该 feature。
4. 如果没有 `active` feature，选择依赖已满足且 id 最小的 `not_started` feature。
5. 不得绕过 `dependsOn`。
6. 不得同时处理多个 feature。

确定当前 feature 后：

* 只读取该 feature 的 `feature.json`，或 `feature.md` / `verification.md`；
* 不要默认读取所有 feature 合同；
* 不要把历史 feature list 作为默认任务入口。

---

## 4. Feature 状态规则

Feature 状态只能是：

* `not_started`
* `active`
* `blocked`
* `passing`

任意时刻最多只能有一个 `active` feature。

状态变更必须同步更新：

* `docs/harness/features/feature-index.json`
* 当前 feature 的完整合同：`feature.json` 或 `feature.md` / `verification.md`
* `docs/progress.md`

如果发现额外问题，只记录到 `docs/progress.md` 或 `docs/log/`，不要顺手展开成新功能。

---

## 5. 修改边界

默认只允许修改当前 `active` feature 的 scope 内文件。

不得：

* 做与当前 feature 无关的重构、优化或新功能；
* 绕过 `dependsOn`；
* 同时实现多个 feature；
* 默认读取或修改历史 feature 归档；
* 在没有 legacy adapter 或 migration 说明的情况下删除 `DailyPlan`、旧字段或旧 storage key；
* 在页面层直接拼装 `Plan + Stage + Task` 底层存储结构。

如果必须修改共享模块：

* 在 `docs/progress.md` 记录修改原因；
* 记录影响范围；
* 记录验证方式。

如果涉及数据层修改：

1. 先确认或更新 `docs/harness/ARCHITECTURE.md`；
2. 再确认或更新 `docs/architecture/goal-plan-task-state-model.md`；
3. 最后再修改代码。

页面层读取数据时：

* 应通过 services、selector 或 adapter 获取页面所需视图；
* 不得直接依赖底层存储结构拼装页面数据。

---

## 6. 完成门禁

只有同时满足以下条件，才允许将 feature 标记为 `passing`：

* acceptance 全部满足；
* L1 静态校验通过；
* L2 功能验证通过；
* 如触发 L3 条件，L3a 系统确认和 L3b 用户路径证据均已记录；
* `npm run verify:harness` 通过；
* 当前 feature 的 evidence 或验证记录已更新；
* `feature-index.json` 状态已同步；
* `docs/progress.md` 已更新；
* 没有未解释的临时文件、`console.log`、`debugger` 或无关改动。

如果任一条件不满足，不能标记为 `passing`。

失败处理参考：

* `docs/harness/verification-policy.md`
* `docs/harness/instrumentation.md`

---

## 7. Registry 维护规则

新增 feature 时：

1. 先在 `docs/harness/features/feature-index.json` 增加轻量索引。
2. 再创建 `docs/harness/features/individual_feature/<feature-id>/`。
3. 新 feature 优先使用 `feature.md` 与 `verification.md`。
4. 只有确有机器读取需求时，才使用 `feature.json`。

`feature-index.json` 必须保持轻量。

不要在 `feature-index.json` 中写入：

* 长 behavior；
* acceptance 细节；
* docs 列表；
* evidence；
* 长 implementation notes。

详细任务边界、验收标准、验证命令和证据应写入对应 feature 的完整合同。

历史 feature 已迁移为归档 JSON，不需要补写额外 Markdown 文档。

---

## 8. 版本映射

* `v0.1`：F01-F07，归档来源为 `docs/log/v0.1/feature_list_v0.1.json`。
* `v0.2`：F08-F11，归档来源为 `docs/log/v0.2/feature_list_v0.2.json`。
* `v0.3`：F12-F19，归档来源为 `docs/log/v0.3/feature_list.json`。
* `v0.3-ui`：F20-F23，归档来源为 `docs/log/v0.2/feature_list_v3_v2.json`。

注意：

* `docs/log/v0.1/feature_list.json` 当前不包含 F01-F07；迁移后的 v0.1 来源是 `docs/log/v0.1/feature_list_v0.1.json`。
* `docs/log/v0.3/feature_list_v0.3.json` 保留 F12-F23 的较大历史快照，不作为默认任务入口。
