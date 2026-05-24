# instrumentation.md

## 作用

本文件只回答一个问题：验证结果应该写到哪里。

验证规则、L1/L2/L3、harness gate、人工评估和手动冒烟最低要求统一看 `docs/harness/verification-policy.md`。

## 记录位置

- `docs/harness/feature_list.json`：写当前 feature 的完成证据，尤其是 `evidence.commands`、`evidence.manualSmoke` 和 `completionGate`。
- `docs/progress.md`：写当前状态摘要、最近验证结果、阻塞项和下一步。
- `docs/log/`：写长输出、失败详情、手动冒烟详情或阶段性报告。
- `docs/decisions.md`：写长期有效的技术或产品决策。

## 推荐写法

- 命令通过：把命令名、结果和简短说明写入 `evidence.commands`。
- 命令失败：把摘要写入 `docs/progress.md`，长输出或排查过程写入 `docs/log/`。
- 手动冒烟：简短结论写入 `evidence.manualSmoke`，完整过程用 `docs/log/smoke-template.md` 另存到 `docs/log/`。
- 人工决策：如果会影响后续多个 feature，写入 `docs/decisions.md`；如果只影响当前 feature，写入 `docs/progress.md` 或 `completionGate.humanReviewRequired`。
