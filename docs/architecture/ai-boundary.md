# ai-boundary.md

## 目的

本文档定义 AI 调用边界、AI 输出规则和 schema 校验流程。

AI 只负责生成计划建议，不直接修改存储数据。

---

## 基本原则

- AI 输出必须是结构化 JSON。
- AI 输出必须经过 schema 校验后才能进入业务流程。
- AI 不直接修改数据库或本地存储。
- AI 不得编造用户未提供的信息。
- AI 失败时必须回退到 planner.ts 的确定性 fallback 计划。

详细红线见 ../harness/CONSTRAINTS.md。

---

## AI 调用链路

```text
页面
→ services/ai-client.ts
→ 云函数或后端服务
→ 外部 AI 服务
→ 返回 JSON
→ schema 校验
→ planner.ts 或 replanner.ts 使用校验后的结果
→ storage.ts 保存
```

---

## 小程序侧边界

ai-client.ts 是小程序侧 AI 请求客户端。

ai-client.ts 只能调用受控后端或云函数。

ai-client.ts 不允许：

- 保存 AI API key
- 保存 AppSecret
- 直接调用外部大模型 API
- 绕过 schema 校验
- 直接写入 storage
- 输出完整用户目标或复盘内容到日志

---

## 服务端边界

真实 AI API key 只能存在于：

- 云函数环境变量
- 后端服务环境变量
- 部署平台 secret

不得提交到仓库。

服务端 AI 调用入口建议为：

```text
cloud/functions/generatePlan/
```

该函数负责：

- 接收最小必要输入
- 调用外部 AI 服务
- 返回结构化 JSON
- 不持久化用户隐私数据，除非后续产品明确需要

---

## AI 输入

AI 请求中只传递生成计划所需的最小信息。

允许传递：

- 目标名称
- 目标说明
- DDL
- 每日可用时间
- 用户偏好工作时段
- 当天能量状态
- 昨日任务完成情况
- 已有任务计划摘要

不应传递：

- 无关用户隐私
- 完整历史复盘长文本
- 密钥或内部配置
- 与当前功能无关的个人信息

---

## AI 输出

AI 输出必须是 JSON。

建议结构：

```json
{
  "status": "ok",
  "dailyPlans": [
    {
      "date": "2026-05-20",
      "tasks": [
        {
          "title": "整理目标范围",
          "estimatedMinutes": 30,
          "priority": "high",
          "minimumLine": "写出 3 条目标边界",
          "focusSuggestion": "使用 25 分钟专注块完成",
          "caution": "不要先追求完美表达"
        }
      ],
      "dailyKeyword": "启动",
      "recommendedFocusWindow": "evening"
    }
  ]
}
```

不可行计划建议结构：

```json
{
  "status": "infeasible",
  "reason": "剩余时间不足，无法在 DDL 前完成全部任务",
  "suggestions": ["extend_deadline", "increase_daily_time", "reduce_scope"]
}
```

---

## schema 校验

AI 输出 schema 必须定义在：

```text
schemas/ai-plan-schema.ts
```

校验要求：

- status 必须是 ok 或 infeasible
- dailyPlans 必须是数组
- date 必须是 YYYY-MM-DD
- estimatedMinutes 必须是正数
- priority 必须是 high、medium、low
- minimumLine 必须存在且可执行
- 每日任务总时长不得超过 dailyAvailableMinutes

校验失败时：

- 不得写入 storage
- 不得把结果展示为正式计划
- 必须回退到 planner.ts 的 fallback 计划
- 必须记录脱敏错误信息

---

## fallback 规则

AI 生成失败或 schema 校验失败时，使用 planner.ts 的确定性规则生成计划。

fallback 计划必须满足：

- 不超过每日可用时间
- 不超过 DDL
- 每个任务有 minimumLine
- 低能量状态下优先降低任务压力
- 不生成玄学预测或诊断内容

---

## AI 表达边界

MBTI、星座、时辰、每日关键词只能作为轻量表达和仪式感包装。

AI 不得：

- 生成健康诊断
- 生成心理诊断
- 声称预测命运或现实结果
- 把 MBTI、星座、时辰解释为科学依据
- 用模糊鼓励替代具体任务建议

允许：

- 轻量陪伴式表达
- 今日关键词
- 温和提醒
- 低压力任务建议
