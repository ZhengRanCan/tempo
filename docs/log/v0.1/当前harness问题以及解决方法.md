当前 harness 不是完全没搭起来，而是“前两层有形，第三层不够硬，第四层交接不够暴露风险”。最大问题集中在第三层：运行中控制与反馈。

你的四层框架里，第一层解决“agent 知不知道项目规则”，第二层解决“agent 能不能稳定干活”，第三层解决“agent 会不会跑偏、假完成”，第四层解决“下一个 agent 能不能无损接手”。 而这次 Codex 报告暴露的典型问题是：F01-F07 账面都 passing，npm.cmd run check 也通过，但 F07 的真实页面路径没有闭环，review/index.vue 保存复盘后没有调用 replanAfterReview。

一、当前每一层缺少了什么？
层级	当前已有内容	当前缺少内容	问题本质
第一层：运行前	有 AGENTS.md、feature_list.json、架构文档、progress	缺用户行为地图、feature 到用户路径的映射、实现状态标记、人工决策点	agent 知道要改哪些模块，但不一定知道用户实际怎么用
第二层：运行初始化	有 npm run check、lint、test、build，测试能跑	缺 git checkpoint、页面/E2E 测试地基、固定测试数据、标准冒烟场景	项目能跑，但验证真实流程的地基不够
第三层：运行中控制与反馈	有 WIP=1、feature 状态、三层验证概念、evidence	缺强制 done gate、用户流程级验收、E2E/半自动集成测试、运行时观测、失败回归库	最大问题：容易出现“看起来完成，但真实路径没通”
第四层：运行后对接	有 progress、decisions、log	缺未验证项记录、风险遗留记录、不可信 passing 标记、下次优先检查点	交接有记录，但没有把风险交干净
第一层：运行前缺少什么？

第一层的问题不是“没有文档”，而是文档还没有充分转化成用户行为地图。

当前 feature_list.json 更像模块任务清单，比如“实现 replanner 服务”“补测试”“改页面”。但它没有足够明确地描述：

用户从哪里进入？
用户做了什么操作？
页面应该发生什么变化？
数据应该怎么流动？
哪些 service 必须被调用？
最后用户应该看到什么结果？

所以 F07 会出现这种情况：services/replanner.ts 写了，tests/replanner.test.ts 也过了，但用户在 pages/review/index.vue 保存复盘后并不会真正触发重排。也就是说，模块完成了，但用户行为没有完成。

这一层还缺一个“实现状态标记”。报告里提到，有些文档写了未来能力，例如 AI schema、storage 错误类型、review cutoff，但代码里仍然是 placeholder 或没有实现。 这会让 agent 误以为“文档里有 = 项目里已经有”。

这一层还缺“人工决策点”。比如：

复盘后是否立即自动重排？
重排失败要不要阻止保存 review？
重复保存当天复盘时，carryover 是否覆盖？
AI 规划失败时是否回退到本地 planner？

这些问题不应该由 agent 自己猜。

第一层应该补什么？

建议补三类内容。

第一，改造 feature_list.json，把 feature 从“模块任务”升级为“用户行为任务”。

例如 F07 不要只写：

实现 replanner 服务。

而应该写：

用户保存晚间复盘后，系统根据未完成/部分完成任务自动重排后续计划，并在任务日历中展示变化。

第二，增加 user_journey_matrix.md，把 feature 和用户路径绑定起来。

可以写成这样：

F07 晚间复盘后自动重排

用户路径：
创建目标 → 生成计划 → 今日任务 → 晚间复盘 → 保存复盘 → 后续计划自动重排 → 日历展示变化

必须经过的代码路径：
pages/review/index.vue
→ saveDailyReview
→ replanAfterReview
→ saveDailyPlans
→ pages/plan-calendar/index.vue

验收结果：
保存复盘后，后续日期中应出现补做任务。

第三，增加 implementation_status.md 或在 feature 里加字段，区分：

implemented：已经实现
tested：已有测试
integrated：已接入页面路径
placeholder：只是占位
planned：只是未来设计
needs_human_decision：需要人工确认

这一层补完后，agent 不只是知道“改什么文件”，而是知道“用户应该如何完成一条路径”。

第二层：运行初始化缺少什么？

第二层的问题不是特别严重。当前项目已经有 npm run check，并且报告里显示最近一次 check 通过，8 个测试文件、39 个测试通过，mp-weixin build 也完成。

但它缺三件基础设施。

第一，缺 git checkpoint。报告里明确说当前目录不是 git 仓库，所以无法审计提交历史。 这会导致 agent 修改后很难回滚，也难以追踪哪个变更引入了问题。

第二，缺页面/E2E 测试地基。这里不是说你现在必须立刻做小程序 MCP，而是说项目缺少“验证页面流程”的基础能力。你可以先从低成本做起：

人工冒烟模板；
固定测试数据；
半自动集成测试；
最后再考虑小程序自动点击或 MCP。

第三，缺固定测试数据。现在每次验证可能都是临时构造数据，这会导致验证结果不稳定，也不利于回归测试。

第二层应该补什么？

优先做四件事。

第一，初始化 git。

git init
git add .
git commit -m "chore: initialize project baseline"

后续每完成一个 feature，至少留一个 checkpoint：

git add .
git commit -m "feat: complete F07 review replanning flow"

第二，增加固定测试数据。

建议建：

tests/fixtures/goal-plan-review.ts

里面固定放：

一个 goal
一个 userProfile
三天 DailyPlan
一个 DailyReview
预期重排后的 DailyPlan

第三，增加半自动集成测试。

比如：

tests/integration/review-replan-flow.test.ts

测试目标不是点页面，而是验证：

构造 goal/plans/review
→ saveDailyReview
→ replanAfterReview
→ saveDailyPlans
→ 读取新的 plans
→ 断言后续计划发生变化

第四，增加手动冒烟模板。

比如：

docs/log/smoke-template.md

字段包括：

Feature：
测试时间：
测试人：
输入数据：
操作步骤：
预期结果：
实际结果：
是否通过：
失败原因：
截图/日志：
下一步：

第二层补完后，项目就不只是“能跑单元测试”，而是有了验证真实流程的地基。

第三层：运行中控制与反馈缺少什么？

第三层是当前最关键的问题。

你的四层笔记里说，第三层不是简单给反馈，而是建立约束系统：限制 agent 一次做多少事，规定怎么算完成，并强制它用执行结果证明自己做对了。 当前项目最大的问题正是这里：passing 条件不够硬。

具体缺四块。

第一，功能清单的 passing 条件太弱。
现在 feature 可以因为 service 测试通过、check 通过、文档 evidence 填了，就被标记 passing。但这不能证明用户路径完成。

第二，三层终止校验没有真正卡住 L3。
你的文档里说，静态检查只能证明“字没写错”，单元测试证明“局部逻辑能跑”，系统级确认才证明“用户真的能完成这个流程”。 但当前 F07 的问题说明：L3 没有被真正强制执行。

第三，端到端测试基本没有。
报告里也明确说，当前没有页面组件测试、没有端到端点击流测试、没有 F07 页面集成测试。

第四，可观测性偏弱。
现在有文档记录，但缺运行时信号。比如页面 catch 不记录错误，storage 没有错误类型，手动冒烟日志缺少完整步骤、输入和实际结果。

第三层应该补什么？

第三层要补“硬质检”。

第一，增加 done_gate.md。

定义什么情况下 feature 才能从 active 变 passing：

Feature passing 必须同时满足：

1. L1 静态检查通过。
2. L2 功能测试通过。
3. 如果涉及页面或用户流程，必须有 L3 用户路径验证。
4. evidence 必须记录命令、输入、步骤、实际结果。
5. 如果存在未验证路径，不能标记 passing，只能标记 blocked 或 passing_with_risk。
6. 如果发现新增问题，只能记录 backlog，不能顺手扩展 scope。

第二，强化 feature_list.json 字段。

建议每个 feature 至少增加：

{
  "user_behavior": "",
  "affected_pages": [],
  "affected_services": [],
  "affected_storage": [],
  "required_user_journeys": [],
  "manual_smoke_required": true,
  "integration_test_required": true,
  "passing_requires": [],
  "known_unverified": [],
  "human_review_required": []
}
运行

第三，增加 regression_cases.md。

把 F03、F07 这种问题沉淀进去：

R01：服务层实现了，但页面按钮没有调用。
R02：feature 标记 passing，但用户路径没有闭环。
R03：文档写了未来能力，但代码仍是 placeholder。

以后 agent 做新 feature 前必须先读 regression cases，避免重复踩坑。

第四，增加 RUN_LOG.md 或每个 feature 的运行日志。

记录：

当前任务是什么？
改了哪些文件？
跑了哪些验证？
哪些通过？
哪些失败？
失败原因是什么？
下一步先查哪里？

第五，先做半自动 E2E，不急着 MCP。

你现在不用立刻做“小程序 MCP”。当前最实用的是：

固定测试数据 + 集成测试 + 手动冒烟流程

等这些稳定之后，再考虑自动打开小程序页面、自动点击、截图比对等更高级能力。

第四层：运行后对接缺少什么？

第四层的问题是：交接记录有，但风险没有暴露够。

现在项目已经有 progress.md、decisions.md、docs/log/，这说明第四层不是空的。报告也说这些文档确实有实际用途。

但问题在于，交接记录容易只写：

F07 passing
npm run check passed

这会让下一个 agent 或你本人误以为“这个功能已经可靠完成”。但真实情况可能是：

replanner service 已测试；
review 页面未接入；
用户路径未验证；
passing 状态不完全可信。

你的四层笔记里说，运行后对接不是写总结，而是降低下一个会话的恢复成本；好的交接要让新 agent 知道上次做了什么、为什么这么做、验证到哪一步、哪里失败了、下一步干什么。 当前项目缺的就是“风险交接”。

第四层应该补什么？

第一，在 docs/progress.md 里增加固定字段：

## 已完成
## 已验证
## 未验证
## 已知风险
## 不可信 passing
## 下次优先检查
## 需要人工确认

第二，在 feature evidence 里不要只记录命令结果，还要记录验证边界。

例如：

F07 evidence：

已验证：
- replanner 单元测试通过。
- npm run check 通过。

未验证：
- review 页面保存后是否调用 replanAfterReview。
- 重排后 plan-calendar 是否展示变化。

风险：
- 当前 passing 只能证明服务层可用，不能证明用户路径闭环。

第三，增加退出检查表。

每次 agent 结束前必须确认：

npm run check 是否通过？
feature 状态是否准确？
有没有未验证路径？
有没有 placeholder 被误认为实现？
有没有新增风险？
progress 是否更新？
是否需要 git commit？

第四，增加 handoff.md 或在 progress.md 中保留“下一次 agent 先做什么”。

例如：

下一次 agent 必须先检查：
pages/review/index.vue 保存复盘逻辑
→ 是否调用 replanAfterReview
→ 是否 saveDailyPlans
→ 是否回到日历后展示变化