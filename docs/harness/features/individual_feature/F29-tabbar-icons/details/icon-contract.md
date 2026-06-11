# F29 Icon Contract

## 1. Purpose

本文档定义 F29 底部 TabBar 图标资源的命名、位置和使用规则。

## 2. Asset Location

TabBar 图标统一放在：

```text
static/icons/tab/
```

不要放在页面目录、组件目录或 feature 文档目录中。

资源目录自身的规格以以下文件为准：

- `static/icons/tab/README.md`
- `static/icons/tab/icon-spec.json`

如果用户提供的是 iconfont SVG，可以先使用以下工具统一导出 PNG：

- `tools/icon-export/README.md`
- `tools/icon-export/export_icons.py`

## 3. Required Assets

| Tab | Default Icon | Active Icon |
|---|---|---|
| 今日 | `today.png` | `today-active.png` |
| 日历 | `calendar.png` | `calendar-active.png` |
| 创建 | `create.png` | `create-active.png` |
| 我的 | `profile.png` | `profile-active.png` |

## 4. Style Rules

- 四组图标应来自同一风格。
- 默认态和选中态应有明确区别。
- 图标尺寸、线条粗细和视觉重量应统一。
- 图标不应让 TabBar 文案换行、拥挤或遮挡。
- 不使用 emoji 作为最终图标。
- 不使用 agent 临时生成的粗糙占位图作为最终通过依据。

## 5. Iconfont Selection Spec

从 iconfont 选择或导出图标时，按以下规格处理。
如本文档与 `static/icons/tab/icon-spec.json` 冲突，先停止实现并在 `docs/progress.md` 记录冲突，不要自行选择其一。

### 5.1 Color

默认态：

- 推荐颜色：`#8A8176`
- 用途：未选中的今日、日历、创建、我的。
- 视觉要求：低饱和、中性灰棕，不能比文字更抢眼。

选中态：

- 推荐颜色：`#6B5BEA`
- 用途：当前选中的 Tab。
- 视觉要求：与当前 UI 的紫色主操作保持一致。

背景：

- 必须透明背景。
- 不要导出带白底、圆底、彩色底板的图标。

不要使用：

- 多色渐变图标；
- 高饱和彩色图标；
- 红色、橙色、绿色等状态色作为 TabBar 主色；
- emoji 风格图标。

### 5.2 Size

建议导出：

- PNG。
- 透明背景。
- 单个文件画布尺寸：`81px * 81px`。
- 图形主体建议占画布 `54px - 60px`。
- 四周保留安全留白，避免小程序 TabBar 中贴边。

小程序显示目标：

- 图标视觉尺寸约 `27px * 27px`。
- 不要选择细节过密的图标，缩小后会糊。

### 5.3 Stroke And Shape

推荐风格：

- 线性图标或轻微填充图标，四个 Tab 必须同一风格。
- 线宽统一，建议选择 iconfont 中同一套图标。
- 转角圆润，不要过尖锐。
- 默认态和选中态只换颜色，不换图形结构。

不要混用：

- 一个线性、一个面性；
- 一个粗线、一个细线；
- 一个圆角、一个尖角；
- 一个复杂插画、一个简单符号。

### 5.4 Suggested Semantics

| Tab | 建议搜索关键词 | 说明 |
|---|---|---|
| 今日 | today / task / list-check / target | 表达今日任务或任务清单 |
| 日历 | calendar / schedule | 表达日历和计划 |
| 创建 | plus-square / add / create | 表达新增目标 |
| 我的 | user / profile / account | 表达个人页 |

避免使用含义过强或不匹配的图标，例如奖杯、火焰、钱包、设置、消息等。

## 6. Implementation Rules

`pages.json` 中每个 Tab 项必须配置：

- `iconPath`
- `selectedIconPath`

路径应指向 `static/icons/tab/` 下的真实文件。

F29 不改变：

- TabBar 顺序；
- TabBar 页面路径；
- 页面主体布局；
- 业务数据读取或写入逻辑。
