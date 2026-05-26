# progress.md

## 当前 feature

- `F12`：v0.3 目标数据模型与 legacy adapter
- 状态：`passing`

## 当前状态

- 项目阶段：App v0.2 F08-F11 全部完成并通过门禁。
- 当前工作边界：已进入 App v0.3 规划阶段，v0.3 按“models -> storage -> planner -> view services -> replanner -> UI integration”顺序渐进迁移。
- Harness 状态：F12 已完成并切换为 `passing`；F13-F17 仍为 `not_started`。
- F01、F02、F03、F04、F05、F06、F07 已作为 v0.1 基线归档到 `docs/log/v0.1/feature_list_v0.1.json`。

## 功能状态摘要

- `F12` passing
- `F13` not_started
- `F14` not_started
- `F15` not_started
- `F16` not_started
- `F17` not_started
- 当前工作功能清单位置：`docs/harness/feature_list.json`
- v0.3 版本化功能清单位置：`docs/harness/feature_list_v0.3.json`
- v0.2 版本化功能清单位置：`docs/log/v0.2/feature_list_v0.2.json`
- v0.1 归档功能清单位置：`docs/log/v0.1/feature_list.json`

## 最近完成

- 将红框中的项目地图、约束、规格和初始化文档移动到 `docs/harness/`
- 保留 `docs/progress.md` 和 `docs/decisions.md` 作为主文件
- 将后续流水记录目录调整为 `docs/log/`
- 同步 `AGENTS.md` 和 harness 文档中的路径引用
- 实现 F01 创建目标页面：目标名称、截止日期、每日可用时间、可选说明、校验提示和保存反馈
- 在 `models/goal.ts` 增加创建目标输入校验与目标构建逻辑
- 新增 `tests/goal-create.test.ts` 覆盖必填校验、无效时间校验和统一 storage 保存入口
- 修复 F01 手动冒烟发现的问题：截止日期不能早于今天，页面按 `docs/harness/DESIGN.md` 和 `docs/design/visual-system.md` 调整为暖白画布、surface 表单区、accent 主按钮和低压力提示

## 当前验证状态

- `docs/harness/feature_list.json`：v0.2 当前功能清单，4 个 feature，0 个 active，1 个 passing，3 个 not_started
- `npm.cmd run test -- goal-create`：通过，6 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，2 个测试文件、7 个测试通过
- `2026-05-23` 用户确认 F01 最终手动冒烟通过
- `2026-05-23` F02 已按功能选择规则启动并完成验证
- `npm.cmd run test -- user-profile`：通过，4 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，3 个测试文件、11 个测试通过
- F02 mixed verification：页面已提供偏好工作时段、当前能量状态、可选 MBTI 和保存偏好动作；自动化测试覆盖统一 storage 保存和约束边界
- `2026-05-23` F03 已按功能选择规则启动并完成验证
- `npm.cmd run test -- planner`：通过，2 个 planner 测试文件、9 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，4 个测试文件、19 个测试通过
- F03 实现确定性初始拆解：不调用真实 AI；按日期生成 DailyPlan；每日任务总时长不超过 dailyAvailableMinutes；每个任务包含标题、预计时长、优先级和最低完成线；不可行时返回 infeasible
- `2026-05-23` 手动测试发现 F03 集成缺口：点击 goal-create 的“生成计划”只保存目标和偏好，未调用 planner 生成并保存 DailyPlan；已定位为页面入口未串联 planner
- `2026-05-23` F03 集成缺口已修复：goal-create 的“生成计划”现在会构建 UserProfile、调用 buildStarterPlan，并通过 saveDailyPlans 保存 DailyPlan[]
- `2026-05-23` F04 已按功能选择规则启动并完成验证，用户确认最终手动冒烟通过
- `npm.cmd run test -- plan-calendar`：通过，4 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，5 个测试文件、23 个测试通过
- F04 自动化实现已完成：任务日历页读取当前目标与 DailyPlan，默认展示最近 7 天，任务卡片显示状态、预计时长、优先级和最低完成线；无计划时显示低压力空状态；今日任务入口注册为占位页
- `2026-05-23` 用户确认 F04 最终手动冒烟通过
- `2026-05-23` F05 已按功能选择规则启动并完成验证
- `npm.cmd run test -- today`：通过，6 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，6 个测试文件、29 个测试通过
- F05 实现今日任务页：读取当前目标、DailyPlan 和 UserProfile；显示今日最重要任务、最低完成线、推荐专注时段、能量状态提示和今日任务列表；低能量状态优先降低压力
- `2026-05-23` F06 已按功能选择规则启动并完成验证
- `npm.cmd run test -- review`：通过，5 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，7 个测试文件、34 个测试通过
- F06 实现晚间复盘页：可记录任务已完成、部分完成或未完成；可记录今日能量状态；可保存可选备注；备注为空时仍保存结构化 DailyReview
- `2026-05-23` F07 已按功能选择规则启动并完成验证
- `npm.cmd run test -- replanner`：通过，5 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，8 个测试文件、39 个测试通过
- F07 实现自动重排后续计划：根据晚间复盘把部分完成和未完成任务转成后续补做任务；高优先级任务优先排入后续日期；每日任务总时长不超过 `dailyAvailableMinutes`；复盘当天已完成、部分完成和跳过状态作为历史保留；不可行时返回 `infeasible` 和调整建议
- 已知：PowerShell 直接执行 `npm run check` 会被本机 execution policy 拦截，当前环境使用 `npm.cmd run check`
- `2026-05-24` harness 第三层已从纯文档规则升级为轻量门禁：新增 `scripts/harness-gate.mjs` 和 `docs/log/smoke-template.md`
- `2026-05-24` `package.json` 已新增 `verify:harness`，并接入 `npm run check`
- `2026-05-24` `docs/harness/verification-policy.md` 已把 L3 拆为 L3a 系统构建确认和 L3b 用户路径证据；新 active feature 必须定义 `completionGate`
- `2026-05-24` 调试/验证文档已收敛：人工评估表并入 `docs/harness/verification-policy.md`，`docs/harness/instrumentation.md` 改为记录位置速查，删除独立评估文档
- `2026-05-24` `docs/template/**` 已加入 ESLint ignore，避免下载的教程示例代码参与项目 lint
- `npm.cmd run verify:harness`：通过；当前 7 个旧 feature 缺少 `completionGate`，脚本以 legacy warning 汇总，不阻塞 v0.1 基线
- `npm.cmd run check`：通过，8 个测试文件、39 个测试通过；新增 harness gate 也通过
- `2026-05-24` 调试/验证文档收敛后重新执行 `npm.cmd run check`：通过，8 个测试文件、39 个测试通过；仍只有 F01-F07 legacy `completionGate` warning
- `2026-05-24` v0.1 功能清单已归档到 `docs/log/v0.1/feature_list_v0.1.json`
- `2026-05-24` v0.2 工作计划已写入 `docs/log/v0.2/work-plan.md`
- `2026-05-24` v0.2 功能清单已生成：`docs/harness/feature_list.json` 作为当前工作入口，`docs/harness/feature_list_v0.2.json` 作为版本化清单；F08 为 active，F09-F11 按依赖顺序 not_started
- `2026-05-24` v0.2 清单生成后执行 `npm.cmd run verify:harness`：通过，4 个 feature，1 个 active，3 个 not_started，0 warning，0 error
- `2026-05-24` v0.2 清单生成后执行 `npm.cmd run check`：通过，8 个测试文件、39 个测试通过，mp-weixin 构建通过，harness gate 通过
- `2026-05-24` v0.2 UI 规则已补充：F09/F10 明确要求先遵守 `docs/harness/DESIGN.md`，再读取 `docs/design/visual-system.md` 和 `docs/design/components.md`；`docs/design/components.md` 与 `docs/design/pages.md` 已清理为 v0.2 口径

- `2026-05-24` F08 已完成数据层整理与兼容边界：新增旧数据 normalize 兼容、storage `read*` 明确状态结果、`today-suggestion` 计算视图服务；未引入真实 Deepseek、塔罗 UI 或云端存储
- `npm.cmd run test -- data-layer storage`：通过，2 个测试文件、11 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，10 个测试文件、49 个测试通过，harness gate 0 warning / 0 error
- `npm.cmd run verify:harness`：通过，F08 passing 状态下 4 个 feature，0 warning，0 error
- F08 L3b：`tests/data-layer.test.ts` 自动化覆盖“创建目标 -> 保存计划 -> 打开今日任务生成建议视图”和“无本地数据 -> 明确空结果”两条用户路径

- `2026-05-24` F09 已完成导航壳与页面顺序：`pages.json` 将 today 设为第一入口，底部 tab 为 今日/日历/创建/我的，新增 `pages/profile/index.vue` 和 `components/AppPageHeader.vue`
- `npm.cmd run test -- navigation-shell`：通过，1 个测试文件、5 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功，profile/today/plan-calendar/goal-create 页面 wxml/json 产物存在
- `npm.cmd run check`：通过，11 个测试文件、54 个测试通过，harness gate 0 warning / 0 error
- `npm.cmd run verify:harness`：通过，F09 passing 状态下 4 个 feature，0 warning，0 error
- F09 L3b：`tests/navigation-shell.test.ts` 自动化覆盖默认进入今日任务、底部 tab 顺序、tab 页面注册和 tab 页主路径 `switchTab`

- `2026-05-24` F10 已完成核心组件与页面视觉整理：新增 `TaskCard`、`TodayFocusCard`、`EmptyState`、`EnergySelector`，并接入 today、plan-calendar、goal-create、review、profile
- `npm.cmd run test -- ui-components today plan-calendar review`：通过，4 个测试文件、20 个测试通过
- `npm.cmd run verify:static`：通过
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功
- `npm.cmd run check`：通过，12 个测试文件、59 个测试通过，harness gate 0 warning / 0 error
- `npm.cmd run verify:harness`：通过，F10 passing 状态下 4 个 feature，0 warning，0 error
- F10 L3b：`tests/ui-components.test.ts` 自动化覆盖核心组件结构和主要页面接入；today/calendar/review 既有路径测试继续通过

- `2026-05-24` F11 已完成 Deepseek 与塔罗扩展接口预留：新增 `AiTodaySuggestion`、`TarotDraw`、AI suggestion schema、tarot fallback 和 `today-suggestion` 扩展入口；未接入真实 Deepseek 网络请求、云函数、完整塔罗 UI 或隐私数据上传。
- `npm.cmd run test -- ai-tarot-contract today-suggestion`：通过，2 个测试文件、10 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，14 个测试文件、70 个测试通过，F11 passing 状态下 harness gate 0 warning / 0 error。
- F11 L3b：`tests/today-suggestion.test.ts` 自动化覆盖无 AI 凭据 fallback、可选 TarotDraw 影响表达、AI 排序/表达影响和不修改原始 DailyPlan/Task.status；`tests/ai-tarot-contract.test.ts` 自动化覆盖塔罗文案边界、AI schema 边界和 typed fallback。

- `npm.cmd run verify:harness`：通过，F11 passing 状态下 4 个 feature 全部 passing，0 warning / 0 error。
- `2026-05-26` 已开始下一阶段数据模型整理，先补架构文档，不修改业务代码：新增 `docs/architecture/goal-plan-task-state-model.md` 作为 Goal / Plan / Stage / Task 目标模型合同。
- `2026-05-26` 已更新 `docs/architecture/data-models.md`、`docs/architecture/services-boundary.md`、`docs/architecture/storage-strategy.md`，明确当前代码仍以 `DailyPlan[]` 为兼容结构，后续应迁移到 `Plan + Stage + Task`，并保留旧数据读取。
- `2026-05-26` 已更新 `docs/harness/ARCHITECTURE.md` 和 `AGENTS.md`：`ARCHITECTURE.md` 作为架构 README，`AGENTS.md` 增加数据模型、storage、services 的按需读取和迁移约束。
- `2026-05-26` 已完成 `models/` 与 `services/` 初步审计：当前主要风险是 `models/plan.ts` 混合领域模型和页面视图、`planner/replanner/storage/today-suggestion/ai-client` 仍强依赖 `DailyPlan[]`，后续应先新增目标类型和 legacy adapter，再逐步迁移服务输出。
- `2026-05-26` 已生成 App v0.3 工作计划：`docs/log/v0.3/work-plan.md`。
- `2026-05-26` 已生成 App v0.3 功能清单：`docs/harness/feature_list_v0.3.json`，并同步为当前工作入口 `docs/harness/feature_list.json`；F12 为 `active`，F13-F17 按依赖顺序 `not_started`。
- `2026-05-26` `scripts/harness-gate.mjs` 已从固定要求 `completionGate.version: "v0.2"` 调整为接受 `v0.x` 版本格式，`docs/harness/verification-policy.md` 已同步说明。

- `2026-05-26` F12 已完成目标数据模型与 legacy adapter：新增 `GoalStatus`、`PlanStatus`、`StageStatus`、`TaskType`、`Plan`、`Stage`、`PlanBundle`、`DailyTaskView`、`PlanProgress`，并提供 `dailyPlansToPlanBundle()` / `planBundleToDailyPlans()` 双向 adapter。
- F12 兼容边界：旧 `DailyPlan` 未删除；旧 `Task.date` 通过 adapter 映射为 `scheduledDate`；`DailyReview` 支持可选 `taskResults`，旧三组 task id 继续可读；未修改 storage、planner、replanner、today-suggestion 或页面运行主路。
- `npm.cmd run test -- data-models-v0.3 data-layer`：通过，2 个测试文件、11 个测试通过。
- `npm.cmd run verify:static`：通过。
- `npm.cmd run verify:system`：通过，`build:mp-weixin` 构建成功。
- `npm.cmd run check`：通过，15 个测试文件、75 个测试通过，F12 active 状态下 harness gate 0 warning / 0 error。
- F12 L3b：`tests/data-models-v0.3.test.ts` 覆盖旧 DailyPlan[] -> PlanBundle -> DailyPlan[]、旧 Task.date 映射、DailyReview taskResults 兼容和 PlanProgress；`tests/data-layer.test.ts` 证明旧主路径仍可运行。

- `npm.cmd run verify:harness`：通过，F12 passing 状态下 6 个 feature 中 1 个 passing、5 个 not_started，0 warning / 0 error。

## 阻塞项

- F01 无剩余阻塞项，A05 最终页面手动冒烟已由用户确认通过
- F02 无剩余阻塞项
- F03 无剩余阻塞项
- F04 无剩余阻塞项
- F05 无剩余阻塞项
- F06 无剩余阻塞项
- F07 无剩余阻塞项

## 下一步

- 提交 F12 后，按依赖继续 F13：storage PlanBundle 读写与旧数据迁移。

## 交接说明

- 任务开始先读 `docs/harness/feature_list.json` 和本文件
- 完成判断按 `docs/harness/verification-policy.md`
- 失败详情或手动冒烟详情写入 `docs/log/`
