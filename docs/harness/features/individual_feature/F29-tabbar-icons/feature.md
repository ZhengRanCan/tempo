---
id: F29
title: 底部 TabBar 图标接入
version: v0.3
status: passing
dependsOn: [F28]
l3: required
riskLevel: low
evidence: {"lastVerifiedAt":"2026-06-11T15:02:08+08:00","commands":[{"command":"npm.cmd run test -- navigation-shell ui-components","result":"passed"},{"command":"npm.cmd run verify:static","result":"passed"},{"command":"npm.cmd run verify:system","result":"passed"},{"command":"npm.cmd run verify:harness","result":"passed"}],"manualSmoke":"User visual confirmation recorded: F29ok\u4e86\uff0cpassing\u8fc7. The four TabBar entries use static/icons/tab/*.png and *-active.png assets; dist/dev/mp-weixin/app.json and dist/build/mp-weixin/app.json contain the iconPath and selectedIconPath pairs. Calendar text blur was fixed by changing odd rpx font sizes to even rpx in pages/plan-calendar/index.vue only; no TabBar route order/path, page body structure, models, services, storage keys, planner, replanner, AI, or tarot logic was changed."}
---

# F29 底部 TabBar 图标接入

## 1. Goal

F29 的目标是在四个主 Tab 页底部 TabBar 中接入用户提供或确认的图标资源，让 TabBar 从纯文字入口变成“图标 + 文案”的小程序常规导航形态。

本 feature 只处理 TabBar 图标资源、TabBar 配置和相关验证，不重构四个页面 UI，不修改业务数据、services、models、storage、planner/replanner 或 AI/tarot 逻辑。

## 2. User Outcome

完成后，用户应能看到：

- 今日、日历、创建、我的四个 Tab 都有默认图标；
- 当前选中的 Tab 有对应 active 图标；
- TabBar 图标风格统一、尺寸稳定、文字不拥挤；
- 图标接入后四个 Tab 页仍能正常切换。

## 3. Required Reading

必须读：

- `docs/harness/features/individual_feature/F29-tabbar-icons/verification.md`
- `docs/harness/features/individual_feature/F29-tabbar-icons/details/icon-contract.md`
- `static/icons/tab/README.md`

按需读：

- `docs/harness/DESIGN.md`
- `docs/design/visual-system.md`
- `docs/design/components.md`
- `docs/design/page/01-page-layout-contract.md`

不要默认读取：

- `docs/design/page/raw/`
- F25-F28 的页面实现细节文档，除非需要确认 TabBar 与页面首屏的视觉关系。

## 4. Scope

允许修改：

- `pages.json`
- `static/icons/tab/`
- 与 TabBar 配置直接相关的测试
- `docs/progress.md`

不允许修改：

- `models/`
- `services/`
- `storage` key
- `planner/replanner`
- Deepseek、AI、tarot 真实接口
- 四个主 Tab 页的页面结构
- F25-F28 页面级 UI 重设计内容

如果必须修改 scope 外文件，必须先在 `docs/progress.md` 记录原因、影响范围和验证方式。

## 5. Requirements

### 5.1 Icon Asset Contract

图标资源应放在：

```text
static/icons/tab/
```

预期文件：

- `today.png`
- `today-active.png`
- `calendar.png`
- `calendar-active.png`
- `create.png`
- `create-active.png`
- `profile.png`
- `profile-active.png`

图标资源必须由用户提供或确认。Agent 不允许为了 passing 自行生成一套粗糙图标并声明最终完成。

### 5.2 TabBar Config

`pages.json` 中四个主 Tab 项必须接入：

- `iconPath`
- `selectedIconPath`

路径必须指向 `static/icons/tab/` 下的实际资源。

### 5.3 Visual Boundary

F29 只调整底部 TabBar 图标，不改变 TabBar 页面顺序、页面路径、页面标题、页面主体布局或页面业务逻辑。

## 6. Acceptance

- [ ] `static/icons/tab/` 中存在四个 Tab 的默认图标和 active 图标。
- [ ] 四个图标资源已由用户提供或明确确认可用。
- [ ] `pages.json` 的四个 Tab 项均配置 `iconPath` 和 `selectedIconPath`。
- [ ] 四个 Tab 页仍保持原有顺序：今日、日历、创建、我的。
- [ ] 四个 Tab 页路径未被修改。
- [ ] 图标接入后文字不拥挤、不换行、不遮挡。
- [ ] 未修改 F25-F28 页面主体结构。
- [ ] 未修改 models、services、storage、planner/replanner、AI/tarot 逻辑。
- [ ] 完成 `verification.md` 中要求的命令、构建入口检查和人工视觉检查。

## 7. Completion Rule

只有在以下条件全部满足后，F29 才能置为 `passing`：

- 自动化命令通过；
- `pages.json` 中四个 Tab 的 `iconPath` 和 `selectedIconPath` 指向真实存在的图标文件；
- 用户确认图标资源可作为最终图标使用，或提供可检查截图并确认视觉效果通过；
- 已确认微信开发者工具使用当前构建产物；
- 已记录是否影响 TabBar 路径、页面顺序和四个主页面结构；
- 没有未记录的 knownUnverified 状态。

如果缺少用户确认的图标资源，或只接入了占位图标，不能置为 `passing`。
