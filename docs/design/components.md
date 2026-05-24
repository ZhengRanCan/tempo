# components.md

## 目的

本文档定义 MVP 阶段的核心组件规则。

组件设计目标是清晰、低压力、可执行，并保持小程序移动端易操作。

---

## Button

### primary-button

用于页面主行动。

示例：

- 创建目标
- 生成计划
- 开始今日任务
- 完成复盘

样式：

- 背景：accent
- 文字：#FFFFFF
- 高度：44px
- 圆角：md
- 字号：body
- 字重：500

禁用态：

- 背景：surface-muted
- 文字：muted

规则：

- 每个页面最多一个 primary-button。
- 主按钮文案必须是明确动作，不使用模糊表达。

---

### secondary-button

用于次级行动。

示例：

- 稍后再说
- 查看全部计划
- 调整任务

样式：

- 背景：surface
- 文字：ink
- 边框：1px solid border
- 高度：44px
- 圆角：md

---

### text-button

用于低权重操作。

示例：

- 跳过
- 修改
- 查看说明

样式：

- 背景：transparent
- 文字：accent 或 muted
- 不加边框

---

## TaskCard

任务卡片是核心组件。

必须包含：

- 任务标题
- 预计用时
- 优先级
- 最低完成线
- 当前状态

推荐结构：

```text
[状态标签] [预计 25 分钟]
任务标题
最低完成线：写出 3 个要点
[开始] [标记完成]
```

状态表达：

- todo：白色卡片 + neutral 标签
- done：success-soft 背景 + success 标签
- partial：warning-soft 背景 + warning 标签
- skipped：surface-soft 背景 + muted 标签

规则：

- 未完成不等于失败，不使用大红色。
- 最低完成线必须比任务标题更容易被看见。
- 高优先级任务可以使用左侧 3px accent 色条。
- 每张任务卡片只放一个主要行动。
- estimatedMinutes 必须可见。
- minimumLine 必须具体、可执行。

---

## TodayFocusCard

今日重点卡是 today 页面的首屏核心。

必须包含：

- 今日关键词
- 今天最重要的一件事
- 最低完成线
- 推荐专注时段
- 注意事项

样式：

- 背景：surface
- 顶部使用 warm-soft 小标签显示今日关键词
- 主任务标题使用 title-lg
- 最低完成线使用 accent-soft 背景块
- 圆角：xl
- 内边距：xl

规则：

- 今日重点卡只能有一个。
- 不要在首屏堆叠多个同等重要任务。
- 最低完成线必须具体、低压力、可执行。
- 今日关键词只作为轻仪式感元素，不作为预测。

---

## EnergySelector

用于选择当天状态。

选项：

- low：低能量
- normal：普通
- high：高能量

样式：

- 三段式胶囊按钮
- 未选中：surface-soft
- 选中：accent-soft + accent 文字
- 每个选项可配一个简洁图标

规则：

- low 选项不得使用负面视觉。
- 文案使用“低能量”，不要使用“糟糕”“失败”“状态差”。
- low 状态下应引导用户看到最低完成线。

---

## TimeBlock

用于展示推荐专注时段。

必须包含：

- 时间段
- 建议任务
- 预计时长

样式：

- 左侧细线使用 accent
- 背景 surface
- 圆角 lg
- 时间使用 caption
- 任务使用 body

规则：

- TimeBlock 不应一次展示太多。
- today 页面最多展示 1 到 3 个 TimeBlock。
- 时间建议不能替代任务本身。

---

## DailyReviewCard

用于晚间复盘。

必须支持：

- done
- partial
- skipped

样式：

- 每个任务使用轻量列表项
- 状态选择使用小型 pill
- 备注输入框可选，不强迫填写

规则：

- 复盘页不要设计成复杂问卷。
- 默认只让用户做 1 到 2 个动作。
- 先选完成情况，再选今日能量。
- skipped 不用失败式视觉。

---

## EmptyState

用于无目标、无计划、无今日任务。

必须包含：

- 温和标题
- 一句说明
- 一个主行动按钮

示例：

```text
今天还没有任务
先创建一个目标，我来帮你拆成每天能做的小步。
[创建目标]
```

规则：

- 不使用责备性文案。
- 不使用“你还没有完成任何事”这类压力表达。
- 空状态应提供下一步行动。

---

## ProgressSummary

用于展示目标进度摘要。

可以包含：

- 已完成任务数
- 剩余任务数
- 今日是否已推进
- 当前计划状态

规则：

- 不做复杂统计图。
- 不强调落后或失败。
- 如果计划不可行，用温和方式提示调整。

---

## FormField

用于目标创建、偏好设置和复盘备注。

必须包含：

- label
- input
- helper text 或 error text

规则：

- 错误提示必须具体。
- helper text 要短。
- 必填字段要清楚，但不要造成压迫感。
