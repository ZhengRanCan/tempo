import type {
  DailyPlan,
  DailyReview,
  Goal,
  InfeasiblePlanResult,
  Task,
  UserProfile
} from '../models'
import { addDays, getDatesBetweenInclusive, isIsoDateString } from './date'

export interface ReplanInput {
  plans: DailyPlan[]
  review: DailyReview
  goal: Goal
  userProfile?: UserProfile
}

export type ReplanResult =
  | {
      status: 'ok'
      plans: DailyPlan[]
    }
  | InfeasiblePlanResult

export function replanAfterReview(input: ReplanInput): ReplanResult {
  const { plans, review, goal, userProfile } = input

  if (!isIsoDateString(review.date) || !isIsoDateString(goal.deadline)) {
    return infeasible('日期必须使用 YYYY-MM-DD 格式。', ['extend_deadline'])
  }

  if (goal.dailyAvailableMinutes <= 0) {
    return infeasible('每日可用时间必须大于 0。', ['increase_daily_time'])
  }

  const firstMoveDate = addDays(review.date, 1)

  if (!firstMoveDate) {
    return infeasible('复盘日期无效，无法重排后续计划。', ['extend_deadline'])
  }

  const availableDates = getDatesBetweenInclusive(firstMoveDate, goal.deadline)

  if (availableDates.length === 0) {
    return infeasible('已经没有可用于重排的后续日期。', ['extend_deadline', 'reduce_scope'])
  }

  const reviewedPlans = applyReviewToPlans(plans, review)
  const carryoverTasks = getCarryoverTasks(plans, review, userProfile)
  const sortedCarryoverTasks = sortTasksForReplan(carryoverTasks)
  const scheduled = scheduleCarryoverTasks(reviewedPlans, sortedCarryoverTasks, {
    availableDates,
    dailyAvailableMinutes: goal.dailyAvailableMinutes
  })

  if (!scheduled.ok) {
    return infeasible('剩余任务无法在截止日期前安排完。', [
      'extend_deadline',
      'increase_daily_time',
      'reduce_scope'
    ])
  }

  return {
    status: 'ok',
    plans: scheduled.plans.sort((left, right) => left.date.localeCompare(right.date))
  }
}

function applyReviewToPlans(plans: DailyPlan[], review: DailyReview): DailyPlan[] {
  return plans.map((plan) => {
    if (plan.date !== review.date) {
      return clonePlan(plan)
    }

    return {
      ...plan,
      tasks: plan.tasks.map((task) => {
        if (review.completedTaskIds.includes(task.id)) {
          return {
            ...task,
            status: 'done'
          }
        }

        if (review.partialTaskIds.includes(task.id)) {
          return {
            ...task,
            status: 'partial'
          }
        }

        if (review.skippedTaskIds.includes(task.id)) {
          return {
            ...task,
            status: 'skipped'
          }
        }

        return task
      })
    }
  })
}

function getCarryoverTasks(
  plans: DailyPlan[],
  review: DailyReview,
  userProfile?: UserProfile
): Task[] {
  const reviewPlan = plans.find((plan) => plan.date === review.date)

  if (!reviewPlan) {
    return []
  }

  const carryoverTaskIds = new Set([...review.partialTaskIds, ...review.skippedTaskIds])

  return reviewPlan.tasks
    .filter((task) => carryoverTaskIds.has(task.id))
    .map((task) => buildCarryoverTask(task, review, userProfile))
}

function buildCarryoverTask(task: Task, review: DailyReview, userProfile?: UserProfile): Task {
  const isPartial = review.partialTaskIds.includes(task.id)
  const suffix = isPartial ? '补完' : '补做'
  const pressureCaution =
    review.energy === 'low' || userProfile?.energyLevel === 'low'
      ? '只补最小一块，先保留推进感。'
      : task.caution

  return {
    ...task,
    id: `${task.id}:carryover:${review.date}`,
    title: `${suffix}：${task.title}`,
    status: 'todo',
    minimumLine: isPartial ? `先补齐未完成部分：${task.minimumLine}` : task.minimumLine,
    caution: pressureCaution
  }
}

function sortTasksForReplan(tasks: Task[]): Task[] {
  const priorityScore = {
    high: 0,
    medium: 1,
    low: 2
  }

  return [...tasks].sort(
    (left, right) => priorityScore[left.priority] - priorityScore[right.priority]
  )
}

function scheduleCarryoverTasks(
  plans: DailyPlan[],
  tasks: Task[],
  options: {
    availableDates: string[]
    dailyAvailableMinutes: number
  }
):
  | {
      ok: true
      plans: DailyPlan[]
    }
  | {
      ok: false
    } {
  const nextPlans = plans.map(clonePlan)

  for (const task of tasks) {
    const date = findDateWithCapacity(nextPlans, task, options)

    if (!date) {
      return {
        ok: false
      }
    }

    const targetPlan = ensurePlan(nextPlans, date, task.goalId)

    targetPlan.tasks.push({
      ...task,
      date
    })
  }

  return {
    ok: true,
    plans: nextPlans
  }
}

function findDateWithCapacity(
  plans: DailyPlan[],
  task: Task,
  options: {
    availableDates: string[]
    dailyAvailableMinutes: number
  }
): string | null {
  for (const date of options.availableDates) {
    const plan = plans.find((item) => item.date === date)
    const totalMinutes = plan?.tasks.reduce((total, item) => total + item.estimatedMinutes, 0) ?? 0

    if (totalMinutes + task.estimatedMinutes <= options.dailyAvailableMinutes) {
      return date
    }
  }

  return null
}

function ensurePlan(plans: DailyPlan[], date: string, goalId: string): DailyPlan {
  const existingPlan = plans.find((plan) => plan.date === date)

  if (existingPlan) {
    return existingPlan
  }

  const plan: DailyPlan = {
    date,
    goalId,
    tasks: [],
    dailyKeyword: '调整',
    recommendedFocusWindow: '选择当天最稳定的一段时间'
  }

  plans.push(plan)

  return plan
}

function clonePlan(plan: DailyPlan): DailyPlan {
  return {
    ...plan,
    tasks: plan.tasks.map((task) => ({
      ...task
    }))
  }
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
