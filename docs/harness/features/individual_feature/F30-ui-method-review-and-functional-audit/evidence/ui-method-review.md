# F30 UI Method Review

## 1. Purpose

本文档记录 F25-F29 中不同 UI feature 写法的实际效果，并作为后续 UI feature 写法的复盘证据。

结论以 `docs/harness/features/ui-feature-workflow.md` 为准。本文档用于记录本项目中的具体观察。

## 2. Method A: 复杂 UI 说明文档

代表 feature：

- F25 今日任务页重设计
- F26 任务日历页重设计

输入材料：

- 较完整页面设计文档。
- 参考图。
- 图标资源说明。
- 详细 acceptance。

观察：

- 优点：
  - 业务边界较清楚。
  - 状态、数据和 out-of-scope 比较容易写明。
  - 适合复杂页面。
- 问题：
  - 文档量较大。
  - 容易让 agent 无法判断哪些要求最关键。
  - 如果 acceptance 过宽，可能仍然只做局部视觉调整。

本项目结论：

- 适合高复杂度页面，但不适合作为后续所有 UI feature 的默认方式。

## 3. Method B: 参考图为主，少量说明

代表 feature：

- F27 创建目标页重设计

输入材料：

- 参考图。
- 简要 feature 说明。
- 少量验证要求。

观察：

- 优点：
  - 上下文轻。
  - 启动快。
  - 对简单页面有一定效果。
- 问题：
  - 容易缺少组件层级说明。
  - agent 可能只做表层相似。
  - 图标、状态、数据边界需要额外补充。

本项目结论：

- 可用于简单页面或快速视觉实验，但不适合作为主要默认方式。

## 4. Method C: 参考图 + 分层组件说明

代表 feature：

- F28 我的页重设计

输入材料：

- 完整参考图。
- 分层组件说明文档。
- 图标资源 contract。
- 明确 CSS-owned 内容。

观察：

- 优点：
  - 参考图约束视觉方向。
  - 分层说明把图片拆成可执行结构。
  - 图标用途更明确。
  - 能减少 agent 只改颜色/圆角/阴影的问题。
  - 文档量比完整页面规范轻。
- 问题：
  - 仍然需要用户人工确认最终视觉效果。
  - 如果参考图质量差，分层说明也会被带偏。

本项目结论：

- 当前效果最好，后续 UI feature 默认采用该方式。

## 5. F29 图标接入补充

F29 说明 UI feature 中的图标资源需要独立管理：

- SVG source 放在 `tools/icon-export/source/...`。
- PNG output 放在 `static/icons/...`。
- 用 `icon-spec.json` 做机器可读映射。
- 用 README 说明目录、命名、尺寸、颜色和使用边界。

补充结论：

- 图标资源准备应在页面实现前完成。
- SVG 文件名应使用 ASCII 小写 kebab-case。
- active/default 这类状态应通过 manifest 和固定输出名管理。

## 6. Recommended Workflow

后续 UI feature 默认流程：

1. 先在 GPT 网页生成完整 UI 参考图片。
2. 根据参考图去 iconfont 找相关 SVG 图标。
3. 规范 SVG 文件名并放入 `tools/icon-export/source/page/<page-name>/`。
4. 生成 `static/icons/page/<page-name>/icon-spec.json` 和 README。
5. 用导出工具验证并生成 PNG。
6. 编写 `details/component-layout.md`，说明参考图中一共有几个部分，每个部分对应哪些图标，哪些内容由 CSS 完成。
7. 编写轻量 `feature.md`，只管任务边界。
8. 编写 `verification.md`，要求参考图对照、分层对照、构建入口确认和人工视觉确认。

## 7. Decision

后续页面级 UI 修改默认采用：

```text
参考图 + 分层组件说明 + 图标 manifest + 人工视觉确认
```

除非页面业务状态非常复杂，否则不再默认写大而全的页面级设计文档作为 feature 的主要施工清单。
