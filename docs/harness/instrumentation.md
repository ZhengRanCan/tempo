# instrumentation.md

## 目标

- 记录 agent 执行 feature 时的工程信号。
- 让下一个 agent 能判断当前状态、失败原因和下一步。
- 不在本文件记录长历史。

## 信号来源

- `npm run verify:static`
- 当前 feature 的 `verify.feature`
- `npm run verify:system`
- `npm run build:mp-weixin`
- 手动冒烟记录
- 重要技术决策

## 记录位置

- `docs/progress.md`：当前状态摘要、最近验证、下一步。
- `docs/decisions.md`：长期重要决策。
- `docs/log/`：某次具体验证、失败或手动冒烟详情。
- `docs/harness/feature_list.json`：当前 feature 的完成证据。

## 命令信号

每次完成 feature 前，记录：

- 命令名称。
- 执行结果：通过 / 失败 / 未运行。
- 失败阶段。
- 是否阻塞当前 feature。

推荐写入位置：

- 简短结果写入 `docs/harness/feature_list.json` 的 `evidence.commands`。
- 最近摘要写入 `docs/progress.md`。
- 长输出或失败详情写入 `docs/log/`。

## 功能信号

每个 acceptance 必须有对应证据：

- `automated`：记录测试命令。
- `mixed`：记录测试命令和手动说明。
- `manual_smoke`：记录手动冒烟步骤和结果。

未验证的 acceptance 必须说明原因。

## 手动冒烟信号

手动冒烟至少记录：

- feature id。
- 操作路径。
- 输入数据。
- 实际结果。
- 是否符合 acceptance。
- 执行时间。

简短结果可写入 `evidence.manualSmoke`。
完整过程写入 `docs/log/YYYY-MM-DD-<feature>-smoke.md`。

## 失败记录格式

```md
命令：
结果：
失败阶段：
现象：
可能原因：
下一步：
是否阻塞当前 feature：
```

## 后续升级

- 页面流程稳定后，再评估自动化 UI 测试。
- 引入新测试框架前，必须记录到 `docs/decisions.md`。
- 不为单个 feature 临时引入复杂验证工具。
