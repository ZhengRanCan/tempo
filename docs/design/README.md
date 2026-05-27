# Design Documentation

## 目的

`docs/design/` 是小程序 v0.2 之后的全局设计规范入口。

本目录负责回答「全局视觉和组件应该怎么统一」，页面级文档负责回答「某个页面应该长什么样、保留什么、删除什么、如何验收」。

## 文档分层

| 层级 | 文档 | 职责 |
|---|---|---|
| harness 入口 | `docs/harness/DESIGN.md` | 说明 agent 做设计任务时的总规则和读取入口 |
| 全局视觉 | `docs/design/visual-system.md` | 颜色、字体、间距、圆角、视觉层级 |
| 全局组件 | `docs/design/components.md` | 按钮、卡片、标签、表单、空状态、反馈组件 |
| 全局交互状态 | `docs/design/interaction-states.md` | 加载、成功、错误、任务状态、表单状态 |
| 全局文案 | `docs/design/content-rules.md` | 文案语气、AI 表达、塔罗/MBTI 边界 |
| 页面路由 | `docs/design/pages.md` | 页面设计文档索引，不写页面细节 |
| 页面规范 | `docs/design/page/` | 四个主页面的页面级规范、参考图和原始需求 |

## 使用规则

修改视觉样式时：

1. 先读 `docs/harness/DESIGN.md`。
2. 再读本文档确认文档分层。
3. 全局颜色、字体、间距、圆角以 `docs/design/visual-system.md` 为准。
4. 全局按钮、卡片、标签、表单、空状态以 `docs/design/components.md` 为准。
5. 页面结构、页面职责、页面状态和验收标准以 `docs/design/page/` 为准。

## 与页面规范的关系

`docs/design/page/` 只放页面级规范。它可以引用全局视觉和组件规则，但不重复定义全局按钮、卡片、颜色、字体、圆角。

如果页面文档和全局文档冲突：

1. 页面结构和页面职责以 `docs/design/page/` 为准。
2. 颜色、按钮、卡片、标签、表单等通用样式以 `docs/design/` 下的全局文档为准。
3. 如果冲突涉及数据模型，应以架构文档为准，并在设计文档中标记「待确认」。

## 不在本目录处理的内容

- 不定义业务数据模型。
- 不定义服务层实现。
- 不定义 TabBar 路由配置。
- 不定义 AI 接口协议。
- 不记录功能开发进度。

这些内容应分别放在架构、harness、代码或日志文档中。
