# F30 Verification

## 1. Required Commands

| Level | Command | Required |
|---|---|---|
| Harness | `npm.cmd run verify:harness` | yes |

F30 是文档和人工审计 feature，不要求运行页面测试或系统构建，除非审计过程中为了确认问题需要额外定位。

## 2. Document Checks

必须确认以下文件存在：

- `docs/harness/features/ui-feature-workflow.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/feature.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/verification.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/evidence/ui-method-review.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/evidence/manual-functional-audit.md`

## 3. Manual Evidence

F30 passing 前必须有用户人工审计记录，至少包括：

- 今日任务页功能审计。
- 任务日历页功能审计。
- 创建目标页功能审计。
- 我的页功能审计。
- 后续 F31+ 修复建议。

如果用户决定只完成部分页面审计，必须在 `manual-functional-audit.md` 中写明：

- 已审计页面。
- 未审计页面。
- 未审计原因。
- 是否允许 F30 passing。

## 4. Out-of-Scope Check

F30 不应修改：

- `pages/`
- `components/`
- `models/`
- `services/`
- `pages.json`
- `static/icons/`
- planner/replanner/AI/tarot 业务逻辑

如果发生修改，不能直接 passing，必须说明原因并由用户确认。

## 5. Passing Evidence Format

完成后在 `docs/progress.md` 或本 feature evidence 中记录：

- UI 改法复盘结论。
- 为什么后续 UI feature 默认选择“参考图 + 分层组件说明”。
- 四页人工审计完成情况。
- 发现的问题数量和高优先级问题摘要。
- 建议拆分出的后续 feature。
- `npm.cmd run verify:harness` 结果。
