# ARCHITECTURE.md

## 架构目标

本项目是一个个性化 AI 任务日历小程序。

系统采用“小程序页面层 + services 业务层 + AI 计划生成边界 + storage 存储层”的结构。

页面层只负责展示、收集输入和调用 services。复杂业务逻辑必须放在 services 层。

详细产品边界见 PRODUCT_SPEC.md。  
详细硬约束见 CONSTRAINTS.md。

---

## 核心数据流

用户创建目标  
→ planner.ts 生成初始计划  
→ storage.ts 保存计划  
→ plan-calendar 展示任务日历  
→ today 展示今日任务  
→ review 记录晚间复盘  
→ replanner.ts 重排后续计划  
→ storage.ts 保存更新结果

---

## 目录结构

```text
TEMPO/
├── pages/
│   ├── goal-create/
│   ├── plan-calendar/
│   ├── today/
│   ├── review/
│   └── profile/
├── components/
├── services/
│   ├── planner.ts
│   ├── replanner.ts
│   ├── ai-client.ts
│   ├── storage.ts
│   └── date.ts
├── models/
├── schemas/
└── config/

tests/
cloud/functions/
docs/architecture/
```

---

## 层级职责

### pages

负责展示、输入收集、页面跳转和调用 services。

禁止在页面层写复杂任务拆解、任务重排、AI 调用、存储读写和复杂日期计算。

### services

负责核心业务逻辑。

- planner.ts：初始任务拆解
- replanner.ts：根据复盘重排任务
- ai-client.ts：小程序侧 AI 请求客户端，只能调用后端或云函数
- storage.ts：统一数据读写入口
- date.ts：统一日期计算入口

### models

负责核心类型定义。

实际类型以 models/ 中源码为准。

### schemas

负责 AI 输出和关键数据结构的 schema 校验。

### config

负责默认专注时长、每日任务数、复盘截止时间、AI 开关等配置。

---

## 功能与模块映射

| 功能项 | 主要页面 | 主要 services | 主要 models |
|---|---|---|---|
| F01 创建目标 | goal-create | storage、date | Goal |
| F02 用户状态与偏好输入 | profile | storage | UserProfile |
| F03 初始任务拆解 | plan-calendar | planner、ai-client、storage、date | Goal、Task、DailyPlan |
| F04 任务日历页面 | plan-calendar | storage、date | DailyPlan、Task |
| F05 今日任务页 | today | storage、date、planner | Task、DailyPlan、DailyReview |
| F06 晚间复盘 | review | storage、date | DailyReview、Task |
| F07 自动重排后续计划 | plan-calendar、today | replanner、storage、date | Task、DailyPlan、DailyReview |

---

## 架构细节路由

- 核心类型细节：docs/architecture/data-models.md
- services 边界：docs/architecture/services-boundary.md
- AI 调用边界：docs/architecture/ai-boundary.md
- 存储策略：docs/architecture/storage-strategy.md
- 测试边界：docs/architecture/testing-boundary.md

只有修改对应模块时，才读取对应细节文档。

---

## 默认架构原则

- 页面层保持轻量。
- 业务逻辑集中在 services。
- 日期计算集中在 date.ts。
- 数据读写集中在 storage.ts。
- AI 不直接修改存储。
- AI 输出必须经过 schema 校验。
- planner、replanner、date 应尽量保持可测试。
