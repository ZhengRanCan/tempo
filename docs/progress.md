# progress.md

## 当前 feature

- `F07`：自动重排后续计划
- 状态：`passing`

## 当前状态

- 项目阶段：MVP 功能实现初期
- 当前工作边界：F07 自动重排后续计划已完成，MVP 功能清单已全部通过
- Harness 状态：项目地图与规则文件已集中到 `docs/harness/`
- F01、F02、F03、F04、F05、F06、F07 已通过。F07 范围限定在 `services/replanner.ts`、`services/planner.ts`、`services/date.ts`、`models/plan.ts`、`models/task.ts`、`models/review.ts` 和 `tests/replanner.test.ts`。F07 只实现确定性重排，不调用真实 AI、不做多人协作、不生成长期统计报表

## 功能状态摘要

- `F01` passing
- `F02` passing
- `F03` passing
- `F04` passing
- `F05` passing
- `F06` passing
- `F07` passing
- 功能清单位置：`docs/harness/feature_list.json`

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

- `docs/harness/feature_list.json`：JSON 合法，7 个 feature，0 个 active，7 个 passing
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

## 阻塞项

- 无当前 harness 阻塞项
- F01 无剩余阻塞项，A05 最终页面手动冒烟已由用户确认通过
- F02 无剩余阻塞项
- F03 无剩余阻塞项
- F04 无剩余阻塞项
- F05 无剩余阻塞项
- F06 无剩余阻塞项
- F07 无剩余阻塞项

## 下一步

- MVP 功能清单 F01-F07 均已通过；后续可进行完整小程序手动回归或进入下一批功能规划

## 交接说明

- 任务开始先读 `docs/harness/feature_list.json` 和本文件
- 完成判断按 `docs/harness/verification-policy.md`
- 失败详情或手动冒烟详情写入 `docs/log/`
