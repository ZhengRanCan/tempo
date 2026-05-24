import { DEFAULT_FOCUS_MINUTES } from '../config/defaults'
import type { Goal, DailyPlan, InfeasiblePlanResult, UserProfile, WorkStyle } from '../models'
import { getDatesBetweenInclusive, isIsoDateString } from './date'

export interface StarterPlanInput {
  goal: Goal
  startDate: string
  userProfile?: UserProfile
}

export type StarterPlanResult =
  | {
      status: 'ok'
      plans: DailyPlan[]
    }
  | InfeasiblePlanResult

const MINIMUM_TASK_MINUTES = 15

const PLAN_STEPS = [
  {
    keyword: '启动',
    action: '明确目标范围',
    minimumLine: '写下今天最先推进的 1 个小步骤。'
  },
  {
    keyword: '整理',
    action: '整理已有材料',
    minimumLine: '列出 3 条已有信息或待补材料。'
  },
  {
    keyword: '拆分',
    action: '拆出下一批小任务',
    minimumLine: '写出 3 个可以独立完成的小任务。'
  },
  {
    keyword: '产出',
    action: '完成一段可交付内容',
    minimumLine: '完成一个 15 分钟的小产出，不要求一次做完。'
  },
  {
    keyword: '检查',
    action: '检查并补齐缺口',
    minimumLine: '找出 1 个最需要修补的地方。'
  },
  {
    keyword: '收尾',
    action: '整理今日结果',
    minimumLine: '记录今天完成了什么和下一步做什么。'
  },
  {
    keyword: '缓冲',
    action: '处理遗留小块',
    minimumLine: '只处理最小的一块遗留内容。'
  }
] as const

export function buildStarterPlan(input: StarterPlanInput): StarterPlanResult {
  const { goal, startDate, userProfile } = input

  if (goal.dailyAvailableMinutes <= 0) {
    return infeasible('每日可用时间必须大于 0。', ['increase_daily_time'])
  }

  if (goal.dailyAvailableMinutes < MINIMUM_TASK_MINUTES) {
    return infeasible('每天至少需要 15 分钟，才适合拆成可执行的小任务。', [
      'increase_daily_time',
      'reduce_scope'
    ])
  }

  if (!isIsoDateString(startDate) || !isIsoDateString(goal.deadline)) {
    return infeasible('日期必须使用 YYYY-MM-DD 格式。', ['extend_deadline'])
  }

  const dates = getDatesBetweenInclusive(startDate, goal.deadline)

  if (dates.length === 0) {
    return infeasible('开始日期不能晚于截止日期。', ['extend_deadline'])
  }

  const estimatedMinutes = getTaskMinutes(goal.dailyAvailableMinutes, userProfile)
  const plans = dates.map<DailyPlan>((date, index) => ({
    date,
    goalId: goal.id,
    dailyKeyword: getPlanStep(index).keyword,
    recommendedFocusWindow: getRecommendedFocusWindow(userProfile?.workStyle),
    tasks: [
      {
        id: `${goal.id}-${date}-step-${index + 1}`,
        goalId: goal.id,
        title: `${getPlanStep(index).action}：${goal.title}`,
        description: goal.description ? '围绕目标说明推进当天最小可交付内容。' : undefined,
        date,
        estimatedMinutes,
        priority: index === 0 ? 'high' : 'medium',
        status: 'todo',
        minimumLine: getMinimumLine(index, userProfile),
        focusSuggestion: `先做一个 ${estimatedMinutes} 分钟的小块。`,
        caution: getCaution(userProfile)
      }
    ]
  }))

  return {
    status: 'ok',
    plans
  }
}

function getPlanStep(index: number): (typeof PLAN_STEPS)[number] {
  return PLAN_STEPS[index % PLAN_STEPS.length]
}

function getTaskMinutes(dailyAvailableMinutes: number, userProfile?: UserProfile): number {
  const preferredMinutes = userProfile?.preferredFocusMinutes ?? DEFAULT_FOCUS_MINUTES
  const energyLimit = userProfile?.energyLevel === 'low' ? 20 : preferredMinutes
  const minutes = Math.min(dailyAvailableMinutes, energyLimit, DEFAULT_FOCUS_MINUTES)

  return Math.max(MINIMUM_TASK_MINUTES, Math.floor(minutes))
}

function getMinimumLine(index: number, userProfile?: UserProfile): string {
  if (userProfile?.energyLevel === 'low') {
    return '先完成最低完成线：投入 15 分钟，留下一个可继续的下一步。'
  }

  return getPlanStep(index).minimumLine
}

function getCaution(userProfile?: UserProfile): string {
  if (userProfile?.energyLevel === 'low') {
    return '今天先保留推进感，不需要加量。'
  }

  return '不要把今天的任务扩成完整计划。'
}

function getRecommendedFocusWindow(workStyle: WorkStyle = 'flexible'): string {
  const windows: Record<WorkStyle, string> = {
    morning: '上午安排最重要的一步',
    afternoon: '下午选择一段稳定时间推进',
    evening: '晚上用安静时间完成一个小块',
    flexible: '选择当天最稳定的一段时间'
  }

  return windows[workStyle]
}

function infeasible(
  reason: string,
  suggestions: InfeasiblePlanResult['suggestions']
): InfeasiblePlanResult {
  return {
    status: 'infeasible',
    reason,
    suggestions
  }
}
