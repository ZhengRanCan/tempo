# storage-strategy.md

## 目的

本文档定义 MVP 阶段的数据存储策略，以及后续从本地存储切换到云开发时的边界。

目标数据模型见 `docs/architecture/goal-plan-task-state-model.md`。当前存储策略必须兼容旧 `DailyPlan[]`，但后续不应继续把 `DailyPlan[]` 作为唯一计划真相来源。

---

## MVP 默认策略

MVP 阶段默认使用本地存储。

目标是先验证产品闭环：

```text
目标 → 计划 → 今日任务 → 复盘 → 重排
```

暂不优先引入复杂后端和账号体系。

---

## 存储入口

所有数据读写必须经过：

```text
services/storage.ts
```

页面层、planner.ts、replanner.ts 不得直接读写本地存储或云数据库。

禁止：

- 页面层直接调用 wx.setStorage
- 页面层直接调用 wx.getStorage
- 页面层直接调用云数据库 API
- 多个模块各自定义存储 key
- 绕过 storage.ts 写入业务数据

---

## 存储对象

MVP 阶段存储以下对象：

- Goal
- UserProfile
- DailyPlan[]
- DailyReview[]

目标模型阶段应存储：

- Goal
- Plan
- Stage[]
- Task[]
- DailyReview[]
- UserProfile

`TodaySuggestion` 是计算视图，不作为核心持久化对象。AI/塔罗建议可以缓存，但不能替代 Plan 或 Task 的真相来源。

建议 storage key：

```text
goal:{goalId}
user-profile
daily-plans:{goalId}
daily-reviews:{goalId}
```

后续建议新增 storage key：

```text
plans:{goalId}
stages:{planId}
tasks:{planId}
storage-schema-version
```

是否使用拆分 key 或统一 `plan-bundle:{planId}`，需要在实现迁移前确认。无论选择哪种方式，都必须保留 `daily-plans:{goalId}` 的兼容读取。

---

## 建议接口

```ts
saveGoal(goal: Goal): Promise<void>
getGoal(goalId: string): Promise<Goal | null>

saveUserProfile(profile: UserProfile): Promise<void>
getUserProfile(): Promise<UserProfile | null>

saveDailyPlans(goalId: string, plans: DailyPlan[]): Promise<void>
getDailyPlans(goalId: string): Promise<DailyPlan[]>

saveDailyReview(review: DailyReview): Promise<void>
getDailyReviews(goalId: string): Promise<DailyReview[]>

deleteGoal(goalId: string): Promise<void>
```

删除目标时，应同步处理该目标下的计划和复盘记录，除非用户明确选择保留。

后续目标接口建议：

```ts
savePlanBundle(bundle: PlanBundle): Promise<void>
getActivePlanBundle(goalId: string): Promise<PlanBundle | null>
readLegacyDailyPlans(goalId: string): Promise<DailyPlan[]>
migrateLegacyDailyPlans(goalId: string): Promise<PlanBundle | null>
```

迁移函数必须是可重复执行的，不得重复生成任务或覆盖用户已经完成的任务状态。

---

## 本地存储限制

本地存储适合 MVP 验证，但不适合长期多设备同步。

已知限制：

- 换设备后数据不可恢复
- 清理缓存可能导致数据丢失
- 不适合多人协作
- 不适合跨端同步

因此 UI 中不应暗示数据已经云端备份。

---

## 云开发切换策略

后续如果接入微信云开发，必须通过 storage adapter 替换实现。

允许：

```text
storage.ts
→ localStorageAdapter
→ cloudStorageAdapter
```

不允许：

```text
页面层
→ 直接调用云数据库
```

切换到云开发时，调用方接口应保持稳定，避免影响 pages、planner、replanner。

---

## 隐私边界

用户目标、复盘内容、状态记录、偏好信息都属于隐私数据。

默认策略：

- 不公开
- 不分享
- 不上传，除非功能明确需要
- 不在日志中输出完整内容

如后续加入分享功能：

- 必须由用户主动触发
- 分享前必须展示预览
- 不得默认包含完整目标描述、复盘备注或状态记录

---

## 错误处理

storage.ts 应返回明确错误。

建议错误类型：

```ts
type StorageErrorCode =
  | 'not_found'
  | 'read_failed'
  | 'write_failed'
  | 'invalid_data'
  | 'quota_exceeded'
```

错误信息不得包含：

- 密钥
- 完整用户目标
- 完整复盘内容
- 内部服务凭证

---

## 测试要求

修改 storage.ts 必须更新 storage 相关测试。

至少覆盖：

- 保存和读取 Goal
- 保存和读取 DailyPlan[]
- 保存和读取 DailyReview
- 删除目标时处理相关数据
- 读取不存在数据时返回 null 或空数组
- 写入异常时返回明确错误
- 旧 `DailyPlan[]` 可以迁移到新 Plan/Task 结构
- 迁移不会覆盖已完成、部分完成或跳过的任务状态

## 2026-05-26 F13 实现记录

- `services/storage.ts` 已新增 `savePlanBundle()`、`readPlanBundle()`、`getActivePlanBundle()`、`migrateLegacyDailyPlans()`。
- 当前采用 `plan-bundle:{goalId}` 作为 active PlanBundle 本地 key，并继续保留 `daily-plans:{goalId}` 旧 key 读取。
- `migrateLegacyDailyPlans()` 优先返回已有 PlanBundle；仅在 bundle 缺失且旧 DailyPlan[] 有效时写入迁移结果，因此可重复执行且不会覆盖已有 done/partial/skipped 状态。
- 读空数据、坏 PlanBundle、读取异常和迁移写入异常均返回明确 `StorageReadResult` 状态与 issue。
- F13 不修改 planner、replanner 或页面 UI。
