# F24 Verification

## 1. Required Commands

| Level | Command | Required |
|---|---|---|
| L1 static | `npm.cmd run verify:static` | yes |
| L2 feature | `npm.cmd run test -- ui-components navigation-shell today plan-calendar goal-create user-profile` | yes |
| L3 system | `npm.cmd run verify:system` | yes |
| Harness | `npm.cmd run verify:harness` | yes |

## 2. Build Entry Check

执行者必须确认微信开发者工具或人工查看使用的是当前构建产物。

必须检查：

- `project.config.json.miniprogramRoot`
- `dist/dev/mp-weixin/`
- `dist/build/mp-weixin/`

如果 `verify:system` 生成路径和开发者工具入口不同，不能判定 UI 已生效。

## 3. Visual Evidence Matrix

| Page | State | Required Evidence |
|---|---|---|
| Today | 有目标且有今日任务 | 截图或人工记录 |
| Today | 无目标或无今日任务 | 截图或人工记录 |
| Calendar | DDL 7 天以内 | 截图或人工记录 |
| Calendar | DDL 超过 7 天或存在远期阶段 | 截图或人工记录 |
| Create Goal | 初始输入状态 | 截图或人工记录 |
| Create Goal | 个性化偏好展开状态 | 截图或人工记录 |
| Profile | 有目标状态 | 截图或人工记录 |
| Profile | 无目标状态 | 截图或人工记录 |

如果某个状态无法构造，必须写明原因、替代证据和风险等级。

## 4. Manual Smoke Checklist

- [ ] 四个 Tab 页打开后首屏与 F20-F23 相比有明显变化。
- [ ] 页面主体没有重复大标题、胶囊标签和长副标题。
- [ ] 页面顶部没有大块无业务价值留白。
- [ ] 今日页第一视觉焦点是今日重点任务。
- [ ] 日历页第一视觉焦点是目标计划和进度。
- [ ] 创建目标页第一视觉焦点是关键输入。
- [ ] 我的页第一视觉焦点是当前目标或创建目标入口。
- [ ] 主按钮、次按钮、文本按钮层级清楚。
- [ ] 卡片没有互相嵌套。
- [ ] AI、塔罗、MBTI、每日关键词没有被写成任务决策依据。

## 5. Passing Evidence Format

完成后必须在 `docs/progress.md` 或 feature evidence 中记录：

- 修改了哪些页面和组件；
- 每个页面相对 F20-F23 的可见变化；
- 自动化命令结果；
- 截图或人工视觉检查记录；
- 无法验证的状态；
- 是否影响 models、services、storage、planner、replanner、AI/tarot。

如果存在无法验证的状态，F24 不能直接置为 `passing`，除非用户明确确认该状态本轮不要求。
