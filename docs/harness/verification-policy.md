# verification-policy.md

## 目标

- 判断当前 feature 是否可以从 `active` 改为 `passing`。
- 所有 feature 状态以 `docs/harness/feature_list_v0.3.json` 为准。
- 本文件只定义验证闸门，不定义产品需求。

## 文档分工

- 本文件是验证规则的唯一入口，包含 L1、L2、L3、harness gate、人工评估和证据记录规则。
- `docs/harness/INITIALIZATION_CONTRACT.md` 只记录环境初始化和命令清单。
- `docs/harness/instrumentation.md` 只做记录位置速查，不再定义新的验证规则。
- `docs/log/smoke-template.md` 只是手动冒烟模板，不是规则来源。

## 验证入口

- 先读取 `docs/harness/feature_list_v0.3.json`。
- 找到当前 `status: "active"` 的 feature。
- 读取该 feature 的 `acceptance`、`verify`、`evidence`。
- 按 L1、L2、L3 顺序执行。
- 状态变更前执行 `npm run verify:harness`，由脚本检查 feature 状态、证据和第三层门禁字段。

## L1 静态校验

命令：

```bash
npm run verify:static
```

必须包含：

```bash
npm run lint
npm run typecheck
```

规则：

- 所有 feature 必须运行 L1。
- 当前技术栈是 uni-app + Vue3 + TypeScript。
- `typecheck` 必须使用 `vue-tsc --noEmit`。
- L1 失败时不得继续改为 `passing`。

## L2 功能验证

命令：

```bash
<currentFeature.verify.feature>
```

规则：

- 执行当前 feature 在 `docs/harness/feature_list_v0.3.json` 中的 `verify.feature`。
- L2 必须覆盖当前 feature 的 `acceptance`。
- `method: "automated"` 必须有自动化测试或命令证据。
- `method: "mixed"` 必须有自动化证据和手动说明。
- `method: "manual_smoke"` 必须写入 `evidence.manualSmoke` 或 `docs/log/`。

## L3 系统确认

触发条件：

- 修改页面流程。
- 修改 storage。
- 修改 planner。
- 修改 replanner。
- 修改 date。
- 修改 AI schema。
- 涉及两个以上模块协作。
- 涉及小程序构建路径、pages 配置或跨页面跳转。

L3 分为两部分：

- L3a：系统构建确认，证明小程序构建路径没有损坏。
- L3b：用户路径证据，证明涉及页面或跨模块的功能在真实用户路径上被验证过。

L3a 命令优先级：

```bash
npm run verify:system
```

如果未定义：

```bash
npm run build:mp-weixin
```

规则：

- 触发 L3 条件时必须执行系统确认。
- `verify.system` 为 `null` 时，必须确认当前 feature 未触发 L3 条件。
- 涉及页面、storage、planner、replanner、date、AI schema 或跨模块协作时，必须补 L3b 用户路径证据。
- L3b 可以是集成测试、端到端测试，或按 `docs/log/smoke-template.md` 记录的手动冒烟。
- 手动冒烟结果写入 `evidence.manualSmoke` 或 `docs/log/`，完整过程优先写入 `docs/log/`。

## 第三层门禁脚本

命令：

```bash
npm run verify:harness
```

作用：

- 检查 `docs/harness/feature_list_v0.3.json` 是否为合法 feature list。
- 检查任意时刻最多只有一个 `active` feature。
- 检查 `passing` feature 是否有基础 evidence。
- 对带有 `completionGate.version` 的 feature 执行硬门禁，版本值应使用 `v0.2`、`v0.3` 这类版本号格式。

新 feature 或重新打开的 feature 应使用 `completionGate`：

```json
{
  "completionGate": {
    "version": "v0.3",
    "l3": "required",
    "userPath": [],
    "integrationEvidence": [],
    "knownUnverified": [],
    "humanReviewRequired": []
  }
}
```

规则：

- 新的 `active` feature 必须定义 `completionGate`。
- `completionGate.knownUnverified` 不为空时，不得标记为 `passing`。
- `completionGate.humanReviewRequired` 不为空时，不得标记为 `passing`，除非用户确认后清空并记录证据。
- `completionGate.l3` 为 `required` 时，必须同时有 L3a 构建证据和 L3b 用户路径证据。

## 人工评估

第三层验收前使用本表，避免只凭“代码写完”和局部测试通过就宣布完成。
本表不是新需求来源，只用于判断当前 feature 是否真的可以从 `active` 改为 `passing`。

每项 0-2 分：

- `0`：没有证据或明显不满足。
- `1`：局部满足，但证据不完整或仍有风险。
- `2`：证据充分，满足当前 feature 的完成标准。

| 维度 | 检查问题 | 分数 | 证据 |
|---|---|---:|---|
| 正确性 | 实现行为是否符合 feature acceptance？ |  |  |
| 验证证据 | L1、L2、L3 是否按要求执行并记录？ |  |  |
| 用户路径 | 如果涉及页面或跨模块，用户路径是否被验证？ |  |  |
| 范围纪律 | 修改是否保持在当前 feature scope 内？ |  |  |
| 可靠性 | 失败、空状态、重跑或重进页面是否有明确结果？ |  |  |
| 交接准备度 | 下一个会话能否只靠仓库记录继续？ |  |  |

结论：

- `Accept`：所有必需维度为 2，且没有未验证阻塞项。
- `Revise`：存在 1 分项，但可以在当前 feature 内修复。
- `Block`：存在 0 分关键项，或需要用户决策、外部环境、真实设备验证。

如果结论不是 `Accept`，必须把缺失证据、未验证路径或人工决策点写入：

- `docs/harness/feature_list_v0.3.json` 的 `completionGate.knownUnverified`
- 或 `docs/progress.md` 的阻塞项 / 下一步

## 状态转移规则

只有同时满足以下条件，才允许从 `active` 改为 `passing`：

- `acceptance` 全部满足。
- L1 通过。
- L2 通过。
- 如果触发 L3 条件，L3a 系统确认和 L3b 用户路径证据均已记录。
- `npm run verify:harness` 通过。
- `docs/harness/feature_list_v0.3.json` 的 `evidence` 已更新。
- `docs/progress.md` 已更新。
- 没有未解释的临时文件、`console.log`、`debugger`、无关改动。

## 失败处理

任一验证失败：

- feature 状态保持 `active`。
- 在 `docs/progress.md` 记录失败命令和失败摘要。
- 必要时在 `docs/log/` 新增运行记录。
- 不得改为 `passing`。

验证无法继续：

- feature 状态改为 `blocked`。
- 在 `docs/progress.md` 记录阻塞原因和下一步。

## 记录要求

- 命令结果写入当前 feature 的 `evidence.commands`。
- 手动冒烟写入 `evidence.manualSmoke` 或 `docs/log/`。
- 当前状态摘要写入 `docs/progress.md`。
- 长期重要决策写入 `docs/decisions.md`。

每个 acceptance 必须有对应证据：

- `automated`：记录测试命令。
- `mixed`：记录测试命令和手动说明。
- `manual_smoke`：记录手动冒烟步骤和结果。

手动冒烟至少记录：

- feature id。
- 操作路径。
- 输入数据。
- 实际结果。
- 是否符合 acceptance。
- 执行时间。

简短结果可写入 `evidence.manualSmoke`。
完整过程写入 `docs/log/YYYY-MM-DD-<feature>-smoke.md`。
推荐从 `docs/log/smoke-template.md` 复制模板，避免只写“用户确认通过”。

失败记录推荐格式：

```md
命令：
结果：
失败阶段：
现象：
可能原因：
下一步：
是否阻塞当前 feature：
```

