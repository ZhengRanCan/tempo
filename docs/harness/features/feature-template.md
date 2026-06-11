# 新 Feature 文档模板

本文档用于规范 `docs/harness/features/individual_feature/` 中的新 feature 应该如何编写。

核心原则：

* `feature.md` 管任务边界。
* `verification.md` 管完成证明。
* 细节文档管具体设计。
* `feature-index.json` 只做轻量索引，不写长描述、验收细节或证据。

---

## 1. 推荐目录结构

新 feature 推荐使用：

```text
docs/harness/features/individual_feature/Fxx-short-name/
  feature.md
  verification.md
```

如果该 feature 需要额外细节文档，可以增加：

```text
docs/harness/features/individual_feature/Fxx-short-name/
  details/
    design.md
    service-contract.md
    data-contract.md
    migration-plan.md
    test-fixtures.md
  ref/
    image/
      README.md
```

说明：

* UI / 页面 / 体验类 feature 可以使用 `details/design.md` 或 `ref/image/README.md`。
* services / 数据流类 feature 可以使用 `details/service-contract.md`。
* schema / AI 输出类 feature 可以使用 `details/data-contract.md` 或 `details/schema.md`。
* storage / 数据迁移类 feature 可以使用 `details/migration-plan.md`。
* 测试数据复杂时，可以使用 `details/test-fixtures.md`。

不要把所有细节都塞进 `feature.md`。

---

## 2. feature.md 编写原则

`feature.md` 只回答 6 个问题：

1. 这个 feature 要完成什么？
2. 完成后系统会有什么行为变化？
3. 允许修改什么？
4. 不允许修改什么？
5. 按什么结果验收？
6. 什么情况下不能 passing？

它不负责写完整设计细节。

如果任务细节较多，应引用相关文档，而不是复制全文。

---

## 3. feature.md 模板

复制以下模板后替换占位内容：

```markdown
---
id: Fxx
title: Feature 短标题
version: v0.3
status: not_started
dependsOn: [Fxx]
---

### Fxx Feature 短标题

#### 1. Goal

说明本 feature 的目标。

只写当前任务要完成什么，不写完整产品愿景。

本 feature 只做：

- [任务范围 1]
- [任务范围 2]

本 feature 不做：

- [明确排除内容 1]
- [明确排除内容 2]

#### 2. Expected Result

完成后，系统应产生以下结果：

- [可观察结果 1]
- [可观察结果 2]
- [可观察结果 3]

说明：

- UI feature 写用户可见变化；
- services feature 写业务行为变化；
- data feature 写数据读写、兼容或迁移结果；
- schema feature 写输入输出契约变化；
- CI / harness feature 写验证流程或工程流程变化。

#### 3. Required Reading

必须读：

- `path/to/primary-doc.md`
- `path/to/verification.md`

按需读取：

- `path/to/supporting-doc.md`
- `path/to/details-doc.md`

不要默认读取：

- `path/to/raw-or-history/`

#### 4. Scope

允许修改：

- `path/to/file-or-directory`
- 与本 feature 直接相关的测试
- `docs/progress.md`

不允许修改：

- 与本 feature 无关的页面、services、models、schemas、路由或配置
- 未列入 scope 的共享模块
- storage key，除非本 feature 明确要求
- 数据模型，除非本 feature 明确要求

如果必须修改 scope 外文件，必须先在 `docs/progress.md` 记录原因、影响范围和验证方式。

#### 5. Requirements

##### Area One

写当前 feature 的关键要求。

要求应描述边界和结果，不要复制大段设计细节。

如果需要细节，引用：

- `details/service-contract.md`
- `details/design.md`
- `details/data-contract.md`
- `details/migration-plan.md`
- 或其他相关文档

##### Area Two

写另一个关键区域的要求。

示例：

- 页面类：布局边界、状态边界、交互边界；
- services 类：输入、输出、副作用、错误处理；
- storage 类：读写 key、兼容策略、迁移规则；
- schema 类：字段、校验、失败回退；
- harness 类：状态规则、验证规则、记录规则。

### 6. Acceptance

- [ ] 验收项 1：可观察、可验证。
- [ ] 验收项 2：可观察、可验证。
- [ ] 验收项 3：可观察、可验证。
- [ ] 未修改 out-of-scope 中列出的内容。
- [ ] 完成 `verification.md` 中要求的命令、日志、截图或人工检查。

验收项不要写成泛泛描述。

不好：

- [ ] 体验更好。
- [ ] 代码更清晰。
- [ ] 服务更稳定。

更好：

- [ ] 保存复盘后会调用 `replanAfterReview` 并写回后续 `DailyPlan[]`。
- [ ] storage 读取损坏数据时返回明确错误类型，不 silent fail。
- [ ] 四个主 Tab 页使用统一页面内边距和顶部间距规则。

### 7. Completion Rule

只有在以下条件全部满足后，才能将本 feature 置为 `passing`：

- acceptance 全部满足；
- 自动化命令通过；
- 必要的用户路径、运行日志、截图或人工检查记录已补齐；
- 已说明关键变化；
- 已记录无法验证的状态；
- 没有未解释的 knownUnverified；
- 没有越界修改。

如果缺少完成证明，即使代码或测试通过，也不能置为 `passing`。

典型不能 passing 的情况：

- 只做了局部代码改动，但关键路径不可验证；
- service test 通过，但页面或上层调用链没有接入；
- 没有必要的日志、截图、测试结果或人工检查记录；
- 修改了不允许修改的模块；
- 发现风险但没有记录到 `docs/progress.md`。
```

---

## 4. verification.md 编写原则

`verification.md` 只定义完成证明，不重复写任务目标和设计细节。

它应回答：

1. 需要跑哪些命令？
2. 需要检查哪些运行入口或配置？
3. 需要提供哪些证据？
4. 哪些用户路径、服务路径或数据路径必须验证？
5. 什么情况下不能 passing？

---

## 5. verification.md 模板

复制以下模板后替换占位内容：

```markdown
### Fxx Verification

#### 1. Required Commands

| Level | Command | Required |
|---|---|---|
| L1 static | `npm.cmd run verify:static` | yes |
| L2 feature | `npm.cmd run test -- related-test-name` | yes |
| L3 system | `npm.cmd run verify:system` | yes/no |
| Harness | `npm.cmd run verify:harness` | yes |

说明：

- L1 用于静态检查。
- L2 用于功能或模块验证。
- L3 用于系统构建、用户路径、集成路径或人工验收。
- 如果本 feature 不触发 L3，必须说明原因。

#### 2. Runtime Or Entry Check

说明执行者必须确认哪些运行入口、构建产物、配置文件、本地状态或服务状态。

必须检查：

- `path/to/config`
- `path/to/build-output`
- `path/to/runtime-entry`

如果运行入口、构建产物或配置状态不一致，不能判定 feature 已生效。

不同类型 feature 示例：

- UI feature：确认微信开发者工具入口使用当前构建产物。
- services feature：确认调用链使用的是新 service，而不是旧 fallback。
- storage feature：确认读写 key、迁移路径和旧数据兼容。
- schema feature：确认成功样本、失败样本和回退逻辑。
- CI feature：确认本地命令和 CI workflow 使用同一验证入口。

#### 3. Evidence Matrix

| Area | State Or Path | Required Evidence |
|---|---|---|
| Page / Module / Service | Normal path | 截图、日志、测试结果或人工记录 |
| Page / Module / Service | Empty / error / edge path | 截图、日志、测试结果或人工记录 |
| Data / Storage | Read / write / migration path | 测试结果、日志或人工记录 |
| Integration | Upstream -> target -> downstream | 测试结果、日志或人工记录 |

如果某个状态无法构造，必须写明：

- 无法构造的原因；
- 替代证据；
- 风险等级；
- 是否需要用户确认。

#### 4. Manual Smoke Or Integration Checklist

根据 feature 类型选择填写。

##### UI / Page Feature

- [ ] 关键页面可打开。
- [ ] 用户路径可完成。
- [ ] 空状态或错误状态可理解。
- [ ] 截图或人工视觉检查已记录。

##### Services Feature

- [ ] service 正常输入路径通过。
- [ ] service 异常输入路径通过。
- [ ] 上层调用点已接入。
- [ ] 下游副作用已验证。
- [ ] 错误处理和 fallback 已验证。

##### Data / Storage Feature

- [ ] 新数据读写路径通过。
- [ ] 旧数据兼容路径通过。
- [ ] 损坏数据或缺失数据处理通过。
- [ ] 未新增未记录的 storage key。
- [ ] 迁移或 adapter 行为已验证。

##### Schema / AI Feature

- [ ] 合法输出可通过校验。
- [ ] 缺字段、错类型、越界值会被拒绝或回退。
- [ ] 失败回退路径可验证。
- [ ] 不泄露隐私或敏感配置。

##### Harness / CI Feature

- [ ] 本地命令可运行。
- [ ] CI 或 harness gate 可运行。
- [ ] 失败时能给出明确错误。
- [ ] 文档和命令没有冲突。

通用检查：

- [ ] 没有修改 out-of-scope 内容。
- [ ] 没有未解释的临时文件、`console.log` 或 `debugger`。
- [ ] 已记录无法验证的状态。

### 5. Passing Evidence Format

完成后必须在 `docs/progress.md` 或 feature evidence 中记录：

- 修改了哪些文件；
- 行为变化、用户可见变化或工程流程变化；
- 自动化命令结果；
- 截图、日志、测试结果或人工检查记录；
- 无法验证的状态；
- 是否影响 out-of-scope 模块；
- 是否需要后续 feature 继续处理。

如果存在无法验证的状态，不能直接置为 `passing`，除非用户明确确认该状态本轮不要求。
```

---

## 6. 细节文档模板

如果 `feature.md` 中的内容不够用，可以在 feature 目录下新增 `details/`。

### details/design.md

适用于 UI、页面、视觉、交互 feature。

内容建议：

* 页面结构；
* 信息层级；
* 状态说明；
* 参考图说明；
* 不做什么。

### details/service-contract.md

适用于 services、planner、replanner、today-suggestion、ai-client、tarot 等 feature。

内容建议：

* service 入口；
* 输入；
* 输出；
* 副作用；
* 错误类型；
* fallback；
* 上游调用点；
* 下游影响。

### details/data-contract.md

适用于 models、schemas、storage、AI 输出结构。

内容建议：

* 字段定义；
* 数据来源；
* 读写路径；
* 校验规则；
* 兼容策略；
* 失败处理。

### details/migration-plan.md

适用于 storage key、旧数据兼容、数据结构升级。

内容建议：

* 旧结构；
* 新结构；
* 迁移路径；
* 回滚策略；
* 兼容策略；
* 验证样本。

### details/test-fixtures.md

适用于测试数据较复杂的 feature。

内容建议：

* 测试样本；
* 正常路径；
* 空状态；
* 异常路径；
* 边界条件；
* 预期结果。

---

## 8. ref/image/README.md 模板

如果 feature 需要参考图，使用该文件说明图片来源和使用规则。

```markdown
# Fxx Reference Images

本 feature 不重复复制已有参考图，默认引用以下路径：

- 页面或状态 A：`path/to/reference-a.png`
- 页面或状态 B：`path/to/reference-b.png`

使用规则：

- 参考图用于判断信息层级、首屏重心和页面气质。
- 不要求逐像素还原。
- 如果参考图和 `feature.md` 冲突，以 `feature.md` 为准。
- 如果参考图和 details 文档冲突，以 `feature.md` 为准，并记录冲突。
```

---

## 8. 编写检查清单

新增 feature 前自查：

* [ ] `feature-index.json` 只有轻量索引字段。
* [ ] `feature.md` 只写任务边界，不复制大段设计或实现细节。
* [ ] `verification.md` 有明确命令和证据要求。
* [ ] scope 写清楚允许改和不允许改。
* [ ] acceptance 是可观察、可验证的结果，不是泛泛描述。
* [ ] completion rule 明确了不能 passing 的情况。
* [ ] 如果触发 L3，必须要求系统构建、用户路径、服务路径或集成路径证据。
* [ ] 如果任务细节较多，已放入 `details/` 或相关设计/架构文档。
* [ ] 如果需要参考图，已写 `ref/image/README.md`。

```
```
