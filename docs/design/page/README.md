# docs/design/page

## 目录用途

本目录只保存页面级 UI 改造规范。

这里不定义全局视觉系统，不解释完整业务数据模型，也不放小程序实现代码。后续开发者或 Codex 修改页面 UI 时，应通过本目录明确每个页面应该展示什么、删除什么、依赖哪些数据、如何验收。

## 本轮 UI 改造目标

- 清理页面主体中的重复标题区，让顶部导航栏只负责页面名称。
- 明确底部 TabBar 只负责四个主页面切换。
- 重新梳理四个页面职责，并引用架构侧 Goal、Plan、Stage、Task 边界。
- 将原始口语化需求整理为可执行条目。
- 为后续 UI 实现提供稳定验收依据。

## 页面职责边界

| 页面 | 职责 | 不负责 |
|---|---|---|
| 今日任务页 | 执行今日任务，突出今日最重要的一件事 | 展示完整目标计划 |
| 任务日历页 | 查看目标计划排布、进度、风险和调整入口 | 执行当天任务 |
| 创建目标页 | 创建 Goal，并触发 Plan 生成 | 展示任务日历或执行任务 |
| 我的页 | 管理目标、默认偏好、AI 表达与设置 | 处理当天任务执行 |

## 推荐阅读顺序

1. `00-ui-redesign-overview.md`
2. `01-page-layout-contract.md`
3. 对应页面文档：
   - `pages/today-page.md`
   - `pages/calendar-page.md`
   - `pages/create-goal-page.md`
   - `pages/profile-page.md`
4. 数据模型边界默认引用 `docs/architecture/goal-plan-task-state-model.md`。
5. 如需查原始需求，再阅读 `raw/` 和参考图片。

## 文档索引

| 文档 | 用途 |
|---|---|
| `00-ui-redesign-overview.md` | UI 改造原因、共同问题、全局原则和本轮不做事项 |
| `01-page-layout-contract.md` | 顶部导航、底部 TabBar、页面首屏和页面职责契约 |
| `pages/today-page.md` | 今日任务页规范 |
| `pages/calendar-page.md` | 任务日历页规范 |
| `pages/create-goal-page.md` | 创建目标页规范 |
| `pages/profile-page.md` | 我的页规范 |

## 参考图片说明

当前参考图片保留在 `reference_image/`，未重复复制。

| 页面 | 图片 |
|---|---|
| 今日任务页 | `reference_image/今日任务.png` |
| 任务日历页 | `reference_image/日历.png` |
| 创建目标页 | `reference_image/创建目标.jpeg` |
| 我的页 | `reference_image/我的.png` |

## 数据模型文档说明

页面文档只记录“本页面读取哪些数据”。Goal、Plan、Stage、Task 的完整边界属于架构文档范围，默认引用：

```text
docs/architecture/goal-plan-task-state-model.md
```

本轮不创建或修改该架构文档。

## 后续 Codex 修改 UI 时必须先读

修改四个 Tab 页面 UI 前，至少读取：

- `docs/harness/DESIGN.md`
- `docs/design/page/00-ui-redesign-overview.md`
- `docs/design/page/01-page-layout-contract.md`
- 当前页面对应文档
- `docs/architecture/goal-plan-task-state-model.md`

如果涉及颜色、间距、组件细节，再读取：

- `docs/design/visual-system.md`
- `docs/design/components.md`
- `docs/design/interaction-states.md`
- `docs/design/content-rules.md`

## 原始材料说明

原始需求材料应放在 `raw/`。

原始需求材料已放入 `raw/`，详见 `raw/README.md`。后续实现不应直接以原始文件为唯一依据，应优先阅读本目录中的规范化文档。
