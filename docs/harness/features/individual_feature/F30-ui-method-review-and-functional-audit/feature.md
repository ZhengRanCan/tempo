---
id: F30
title: UI 改法复盘与四页功能人工审计
version: v0.3
status: not_started
dependsOn: [F29]
l3: required
riskLevel: low
---

# F30 UI 改法复盘与四页功能人工审计

## 1. Goal

F30 的目标是完成两件事：

- 复盘 F25-F29 中不同 harness UI 修改方式的实际效果，并固化后续 UI feature 的推荐流程。
- 由用户人工审计四个主 Tab 页在真实小程序环境中的功能可用性，记录后续界面逻辑修复问题。

本 feature 只做文档、复盘和人工审计记录，不修改小程序业务代码。

## 2. User Outcome

完成后，项目应得到：

- 一套可复用的 UI feature 写法，后续页面 UI 改动优先采用“参考图 + 分层组件说明”。
- 一份四页功能人工审计记录，明确今日任务、任务日历、创建目标、我的页分别有哪些可用性问题。
- 一份可用于拆分 F31 以后逻辑修复 feature 的问题清单。

## 3. Required Reading

必须读：

- `docs/harness/features/ui-feature-workflow.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/evidence/ui-method-review.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/evidence/manual-functional-audit.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/verification.md`

按需读取：

- F25-F29 的 `feature.md`、`verification.md`、`details/` 和 progress 记录。
- `docs/design/page/reference_image/`
- `static/icons/page/`
- `static/icons/tab/`

不要默认读取：

- F01-F24 的历史 feature 合同。
- `docs/design/page/raw/`
- 业务代码文件，除非 F30 人工审计发现问题后需要定位问题来源。

## 4. Scope

允许修改：

- `docs/harness/features/ui-feature-workflow.md`
- `docs/harness/features/individual_feature/F30-ui-method-review-and-functional-audit/`
- `docs/harness/features/feature-index.json`
- `docs/progress.md`

不允许修改：

- `pages/`
- `components/`
- `models/`
- `services/`
- `storage` key
- `planner/replanner`
- `pages.json`
- `static/icons/`
- Deepseek、AI、tarot 真实接口

如果在审计过程中发现功能问题，只记录问题，不在 F30 中修复。

## 5. Requirements

### 5.1 UI 改法复盘

必须在 `evidence/ui-method-review.md` 中记录：

- F25/F26 使用的复杂 UI 说明方式。
- F27 使用的参考图为主方式。
- F28 使用的参考图 + 分层组件说明方式。
- F29 图标接入方式对 UI feature 工作流的补充。
- 为什么后续默认选择第三种方式。
- 后续 UI 修改完整流程。

### 5.2 四页功能人工审计

必须在 `evidence/manual-functional-audit.md` 中按页面记录：

- 今日任务页。
- 任务日历页。
- 创建目标页。
- 我的页。

每页至少检查：

- 页面是否能打开。
- 主按钮是否可用。
- 页面数据是否来自真实状态，还是 fallback/mock。
- 跳转是否正确。
- 操作后状态是否同步。
- 空状态是否可理解。
- 错误提示是否清楚。
- 需要后续 feature 修复的问题。

### 5.3 后续拆分建议

F30 结束时，应给出 F31 以后逻辑修复 feature 的初步拆分建议。

拆分原则：

- 按用户路径拆，不按页面外观拆。
- 优先修阻断主流程的问题。
- 不把 UI 微调和 services/data 修复混在同一个 feature 中。

## 6. Acceptance

- [ ] `docs/harness/features/ui-feature-workflow.md` 已说明三种 UI 改法、选择第三种的原因和完整 UI 修改流程。
- [ ] F30 feature 文档已建立。
- [ ] `evidence/ui-method-review.md` 已填入或预留完整复盘结构。
- [ ] `evidence/manual-functional-audit.md` 已提供四页人工审计模板。
- [ ] F30 未修改小程序业务代码、页面代码、组件代码、路由、models、services 或 storage。
- [ ] 完成 `verification.md` 中要求的文档检查和人工审计记录。

## 7. Completion Rule

F30 只有在以下条件全部满足后才能置为 `passing`：

- 用户完成人工功能审计，或明确确认审计范围本轮已足够。
- `ui-method-review.md` 记录了 UI 改法结论。
- `manual-functional-audit.md` 记录了四页功能问题或明确写明未发现问题。
- 已列出后续 F31+ 的建议拆分方向。
- `npm.cmd run verify:harness` 通过。
- 没有把 F30 扩展成业务代码修复。
