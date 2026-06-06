# F25 Verification

## 1. Required Commands

| Level | Command | Required |
|---|---|---|
| L1 static | `npm.cmd run verify:static` | yes |
| L2 feature | `npm.cmd run test -- today today-suggestion review ui-components navigation-shell` | yes |
| L3 system | `npm.cmd run verify:system` | yes |
| Harness | `npm.cmd run verify:harness` | yes |

## 2. Build Or Runtime Check

执行者必须确认人工查看使用的是当前构建产物。

必须检查：

- `project.config.json.miniprogramRoot`
- `dist/dev/mp-weixin/pages/today/`
- `dist/build/mp-weixin/pages/today/`

如果开发者工具入口和最新构建产物不一致，不能判定今日页 UI 已生效。

## 3. Visual Verifier Rule

当前项目没有配置小程序运行截图 MCP 或微信开发者工具自动化能力时，参考图对照必须由用户人工完成。

Agent 可以负责：

- 提醒用户在微信开发者工具中打开今日页；
- 提供参考图路径：`docs/design/page/reference_image/今日任务.png`；
- 提供需要检查的视觉点；
- 在用户确认后，将确认结果记录到 `docs/progress.md` 或 feature evidence。

Agent 不允许：

- 在没有用户确认或截图证据时，自行声明“参考图对照通过”；
- 只根据源码、构建产物或自动测试判定参考图效果通过；
- 用“已参考设计文档”替代视觉对照结果。

如果用户没有明确回复“F25 参考图对照通过”或提供可检查截图，本 feature 不能置为 `passing`。

## 4. Evidence Matrix

| Area | State | Required Evidence |
|---|---|---|
| Today | 有目标且有 1 个今日任务 | 截图或人工记录 |
| Today | 有目标且有多个今日任务 | 截图或人工记录 |
| Today | 无目标或无今日任务 | 截图或人工记录 |
| Today | 低能量或可用时间不足 | 截图、测试结果或人工记录 |
| Review entry | 点击或路径可用 | 测试结果或人工记录 |

如果某个状态无法构造，必须写明原因、替代证据和风险等级。

## 5. Manual Smoke Checklist

- [ ] 今日页第一张业务卡是今日重点任务。
- [ ] 人工对照参考图检查：首屏信息层级、主卡视觉权重、卡片密度、按钮层级和整体气质明显接近 `docs/design/page/reference_image/今日任务.png`。
- [ ] 多任务不会在首屏直接展开成长列表。
- [ ] 查看全部入口可见且不伪装成 TabBar 重复入口。
- [ ] 今日状态卡包含能量、时间、状态和管理入口。
- [ ] AI 建议是短内容。
- [ ] 晚间复盘入口不抢主任务视觉。
- [ ] 页面主体没有重复大标题、胶囊标签和长副标题。
- [ ] 没有修改 out-of-scope 内容。

## 6. Passing Evidence Format

完成后必须在 `docs/progress.md` 或 feature evidence 中记录：

- 修改了哪些今日页和组件文件；
- 今日页相对 F24 的可见变化；
- 今日页和参考图的对照结果；如果没有接近参考图，说明原因和风险；
- 用户人工确认原文或截图路径；如果没有用户确认或截图证据，不能置为 `passing`；
- 自动化命令结果；
- 截图或人工视觉检查记录；
- 无法验证的状态；
- 是否影响 models、services、storage、planner、replanner、AI/tarot。
