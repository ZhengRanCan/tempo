# F29 Verification

## 1. Required Commands

| Level | Command | Required |
|---|---|---|
| L1 static | `npm.cmd run verify:static` | yes |
| L2 feature | `npm.cmd run test -- navigation-shell ui-components` | yes |
| L3 system | `npm.cmd run verify:system` | yes |
| Harness | `npm.cmd run verify:harness` | yes |

## 2. Build Or Runtime Check

执行者必须确认微信开发者工具或人工查看使用的是当前构建产物。

必须检查：

- `project.config.json.miniprogramRoot`
- `dist/dev/mp-weixin/app.json`
- `dist/build/mp-weixin/app.json`

如果开发者工具入口和最新构建产物不一致，不能判定 TabBar 图标已生效。

## 3. Asset Evidence

必须记录：

- `static/icons/tab/today.png`
- `static/icons/tab/today-active.png`
- `static/icons/tab/calendar.png`
- `static/icons/tab/calendar-active.png`
- `static/icons/tab/create.png`
- `static/icons/tab/create-active.png`
- `static/icons/tab/profile.png`
- `static/icons/tab/profile-active.png`

如果某个图标缺失，不能置为 `passing`。

如果图标是临时占位资源，必须记录为 `knownUnverified`，不能直接 passing，除非用户明确确认本轮允许占位图标通过。

## 4. Manual Smoke Checklist

- [ ] 今日、日历、创建、我的四个 Tab 都显示图标。
- [ ] 当前选中的 Tab 显示 active 图标。
- [ ] TabBar 文案没有被图标挤压、换行或遮挡。
- [ ] 四个 Tab 页顺序保持今日、日历、创建、我的。
- [ ] 四个 Tab 页路径未改变。
- [ ] 图标风格、线条粗细、尺寸和视觉重量统一。
- [ ] 没有修改四个页面主体结构。
- [ ] 没有修改 models、services、storage、planner/replanner、AI/tarot。

## 5. Visual Verifier Rule

当前项目没有配置小程序运行截图 MCP 或微信开发者工具自动化能力时，TabBar 图标视觉确认必须由用户人工完成。

Agent 可以负责：

- 提醒用户在微信开发者工具中查看四个主 Tab；
- 检查 `pages.json` 和构建产物中的 TabBar 图标路径；
- 在用户确认后，将确认结果记录到 `docs/progress.md` 或 feature evidence。

Agent 不允许：

- 在没有用户确认或截图证据时，自行声明“TabBar 图标视觉通过”；
- 用“文件存在”替代视觉确认；
- 用临时占位图标冒充最终图标。

如果用户没有明确回复“F29 TabBar 图标对照通过”或提供可检查截图，本 feature 不能置为 `passing`。

## 6. Passing Evidence Format

完成后必须在 `docs/progress.md` 或 feature evidence 中记录：

- 修改了哪些文件；
- 使用了哪些图标资源；
- 图标资源是否由用户提供或确认；
- 自动化命令结果；
- 构建入口检查结果；
- 用户人工确认原文或截图路径；
- 是否影响 TabBar 顺序、路径和四个主页面结构；
- 是否影响 models、services、storage、planner/replanner、AI/tarot；
- 无法验证的状态。
