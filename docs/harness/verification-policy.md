# verification-policy.md

## 目标

- 判断当前 feature 是否可以从 `active` 改为 `passing`。
- 所有 feature 状态以 `docs/harness/feature_list.json` 为准。
- 本文件只定义验证闸门，不定义产品需求。

## 验证入口

- 先读取 `docs/harness/feature_list.json`。
- 找到当前 `status: "active"` 的 feature。
- 读取该 feature 的 `acceptance`、`verify`、`evidence`。
- 按 L1、L2、L3 顺序执行。

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

- 执行当前 feature 在 `docs/harness/feature_list.json` 中的 `verify.feature`。
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

命令优先级：

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
- 手动冒烟结果写入 `evidence.manualSmoke` 或 `docs/log/`。

## 状态转移规则

只有同时满足以下条件，才允许从 `active` 改为 `passing`：

- `acceptance` 全部满足。
- L1 通过。
- L2 通过。
- 如果触发 L3 条件，L3 通过或有明确手动冒烟记录。
- `docs/harness/feature_list.json` 的 `evidence` 已更新。
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
