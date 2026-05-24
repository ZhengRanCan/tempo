# services-boundary.md

## 目的

本文档定义 services 层的职责边界。

services 层负责核心业务逻辑。页面层只能调用 services，不能直接承载复杂业务规则。

---

## services 目录

```text
services/
├── planner.ts
├── replanner.ts
├── ai-client.ts
├── storage.ts
└── date.ts
```

---

## planner.ts

### 职责

负责初始任务拆解。

输入：

- Goal
- UserProfile
- 起始日期
- 每日可用时间

输出：

- DailyPlan[]
- 或不可行计划状态

### 允许做

- 根据目标、DDL 和每日可用时间拆分任务
- 为任务生成 estimatedMinutes、priority、minimumLine
- 根据用户状态偏好调整任务表达
- 在 AI 失败时生成确定性 fallback 计划

### 禁止做

- 直接读写 storage
- 直接调用页面 API
- 直接依赖真实 AI 响应
- 直接修改用户输入
- 超过 dailyAvailableMinutes 强行安排任务

### 测试要求

修改 planner.ts 必须更新 planner 相关测试。

至少覆盖：

- 每日任务总时长不超过 dailyAvailableMinutes
- DDL 当天可以安排任务
- 低能量状态下优先生成最低完成线
- 不可行计划能返回明确状态

---

## replanner.ts

### 职责

负责根据晚间复盘结果重排后续计划。

输入：

- 原始 DailyPlan[]
- DailyReview
- Goal
- UserProfile

输出：

- 更新后的 DailyPlan[]
- 或不可行计划状态

### 允许做

- 将未完成任务移动到后续日期
- 保留已完成任务历史
- 根据 low、normal、high 状态调整次日任务强度
- 在计划不可行时返回明确状态

### 禁止做

- 删除已完成任务记录
- 静默丢弃未完成任务
- 超过 DDL 强行安排任务
- 直接写入 storage
- 直接调用 AI API

### 测试要求

修改 replanner.ts 必须更新 replanner 相关测试。

至少覆盖：

- done 任务不被重排
- partial 任务可以转化为后续补充任务
- skipped 任务不会静默丢失
- 每日任务总时长不超过 dailyAvailableMinutes
- 无法安排到 DDL 前时返回不可行状态

---

## ai-client.ts

### 职责

负责小程序侧 AI 请求封装。

小程序前端不得直接调用外部大模型 API。  
ai-client.ts 只能调用后端服务或云函数。

### 允许做

- 调用 cloud/functions/generatePlan
- 传递必要的目标、DDL、每日可用时间和用户偏好
- 接收结构化 JSON 响应
- 将响应交给 schema 校验逻辑

### 禁止做

- 包含 AI API key
- 包含 AppSecret
- 直接请求外部大模型 API
- 绕过 schema 校验写入 storage
- 在日志中输出完整用户目标或复盘内容

---

## storage.ts

### 职责

负责统一数据读写。

MVP 阶段默认使用本地存储。后续如切换为云开发，应通过 adapter 替换实现。

### 允许做

- 保存和读取 Goal
- 保存和读取 UserProfile
- 保存和读取 DailyPlan[]
- 保存和读取 DailyReview[]

### 禁止做

- 在页面层绕过 storage.ts 直接读写数据
- 在 planner.ts 或 replanner.ts 中直接读写数据
- 混用多个存储入口
- 在没有迁移策略的情况下修改存储 key

建议接口：

```ts
saveGoal(goal: Goal): Promise<void>
getGoal(goalId: string): Promise<Goal | null>
saveUserProfile(profile: UserProfile): Promise<void>
getUserProfile(): Promise<UserProfile | null>
saveDailyPlans(goalId: string, plans: DailyPlan[]): Promise<void>
getDailyPlans(goalId: string): Promise<DailyPlan[]>
saveDailyReview(review: DailyReview): Promise<void>
getDailyReviews(goalId: string): Promise<DailyReview[]>
```

---

## date.ts

### 职责

负责所有日期计算。

### 允许做

- 日期格式化
- DDL 判断
- 起始日期判断
- 今日任务筛选
- 复盘截止时间判断
- 重排日期计算

### 禁止做

- 在页面层散落复杂日期计算
- 在 planner.ts 或 replanner.ts 中重复实现日期规则
- 混用多种日期格式

### 日期规则

- 所有日期统一使用 YYYY-MM-DD
- DDL 当天可以安排任务
- 默认复盘截止时间由 config/app-config.ts 的 reviewCutoffHour 定义
- 如果当前时间晚于 reviewCutoffHour，新建计划从次日开始
- 如果当前时间不晚于 reviewCutoffHour，新建计划可以从当天开始
