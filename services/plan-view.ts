import type { TaskStatus } from '../models/common'
import type { DailyPlan, Plan, PlanBundle, Stage } from '../models/plan'
import { planBundleToDailyPlans } from '../models/plan'
import type { Task } from '../models/task'
import type { UserProfile } from '../models/user-profile'

export interface DailyTaskView {
  date: string
  goalId: string
  planId: string
  tasks: Task[]
  totalEstimatedMinutes: number
  statusSummary: string
}

export interface PlanProgress {
  planId: string
  completedTaskCount: number
  totalTaskCount: number
  progressPercent: number
  remainingEstimatedMinutes: number
}

export type PlanTimePressureLevel = 'done' | 'steady' | 'tight' | 'overdue'

export interface PlanTimePressure {
  level: PlanTimePressureLevel
  label: string
  helper: string
  remainingDays: number
  dailyAvailableMinutes: number
  requiredDailyMinutes: number
  remainingEstimatedMinutes: number
}

export interface PlanBundleCalendarView {
  plan: Plan
  days: PlanCalendarDay[]
  stages: Stage[]
  progress: PlanProgress
  timePressure: PlanTimePressure
  planAdvice: string[]
}

export interface PlanCalendarTask extends Task {
  statusLabel: string
}

export interface PlanCalendarDay {
  date: string
  isToday: boolean
  taskCount: number
  totalMinutes: number
  statusSummary: string
  tasks: PlanCalendarTask[]
}

export interface TodayView {
  date: string
  dailyKeyword: string
  recommendedFocusWindow: string
  focusTask: Task
  tasks: Task[]
  energyLevel: UserProfile['energyLevel']
  pressureNote: string
}

export function buildDailyTaskViews(bundle: PlanBundle): DailyTaskView[] {
  return planBundleToDailyPlans(bundle).map((plan) => {
    const tasks = plan.tasks.map((task) => ({ ...task }))
    const totalEstimatedMinutes = tasks.reduce((total, task) => total + task.estimatedMinutes, 0)

    return {
      date: plan.date,
      goalId: plan.goalId,
      planId: bundle.plan.id,
      tasks,
      totalEstimatedMinutes,
      statusSummary: buildStatusSummary(tasks.map((task) => ({ ...task, statusLabel: '' })))
    }
  })
}

export function buildPlanProgress(bundle: PlanBundle): PlanProgress {
  const totalTaskCount = bundle.tasks.length
  const completedTaskCount = bundle.tasks.filter((task) => task.status === 'done').length
  const remainingEstimatedMinutes = bundle.tasks
    .filter((task) => task.status !== 'done')
    .reduce((total, task) => total + task.estimatedMinutes, 0)

  return {
    planId: bundle.plan.id,
    completedTaskCount,
    totalTaskCount,
    progressPercent:
      totalTaskCount === 0 ? 0 : Math.round((completedTaskCount / totalTaskCount) * 100),
    remainingEstimatedMinutes
  }
}

export function buildPlanBundleCalendarView(
  bundle: PlanBundle,
  options: {
    today: string
    limit?: number
  }
): PlanBundleCalendarView {
  const days = buildPlanCalendarDays(planBundleToDailyPlans(bundle), options)
  const stages = [...bundle.stages].sort((left, right) =>
    left.startDate.localeCompare(right.startDate)
  )
  const progress = buildPlanProgress(bundle)
  const timePressure = buildPlanTimePressure(bundle.plan, progress, options.today)

  return {
    plan: bundle.plan,
    days,
    stages,
    progress,
    timePressure,
    planAdvice: buildPlanAdvice({
      days,
      stages,
      timePressure
    })
  }
}

export function buildPlanCalendarDays(
  plans: DailyPlan[],
  options: {
    today: string
    limit?: number
  }
): PlanCalendarDay[] {
  const sortedPlans = [...plans].sort((left, right) => left.date.localeCompare(right.date))
  const upcomingPlans = sortedPlans.filter((plan) => plan.date >= options.today)
  const visiblePlans = (upcomingPlans.length > 0 ? upcomingPlans : sortedPlans).slice(
    0,
    options.limit ?? 7
  )

  return visiblePlans.map((plan) => {
    const totalMinutes = plan.tasks.reduce((total, task) => total + task.estimatedMinutes, 0)
    const tasks = plan.tasks.map<PlanCalendarTask>((task) => ({
      ...task,
      statusLabel: getTaskStatusLabel(task.status)
    }))

    return {
      date: plan.date,
      isToday: plan.date === options.today,
      taskCount: tasks.length,
      totalMinutes,
      statusSummary: buildStatusSummary(tasks),
      tasks
    }
  })
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: '未开始',
    done: '已完成',
    partial: '部分完成',
    skipped: '已跳过'
  }

  return labels[status]
}

export function getPlanStatusLabel(status: Plan['status']): string {
  const labels: Record<Plan['status'], string> = {
    draft: '草稿',
    active: '进行中',
    needs_adjustment: '需要调整',
    infeasible: '暂不可行',
    completed: '已完成',
    archived: '已归档'
  }

  return labels[status]
}

export function getStageStatusLabel(status: Stage['status']): string {
  const labels: Record<Stage['status'], string> = {
    planned: '计划中',
    active: '推进中',
    completed: '已完成',
    skipped: '已跳过'
  }

  return labels[status]
}

export function buildTodayView(
  plans: DailyPlan[],
  options: {
    today: string
    userProfile?: UserProfile | null
  }
): TodayView | null {
  const todayPlan = plans.find((plan) => plan.date === options.today)

  if (!todayPlan || todayPlan.tasks.length === 0) {
    return null
  }

  const activeTasks = todayPlan.tasks.filter((task) => task.status !== 'done')
  const tasks = (activeTasks.length > 0 ? activeTasks : todayPlan.tasks).slice(0, 4)
  const focusTask = [...tasks].sort(compareTaskPriority)[0]
  const energyLevel = options.userProfile?.energyLevel ?? 'normal'

  return {
    date: todayPlan.date,
    dailyKeyword: todayPlan.dailyKeyword ?? '推进',
    recommendedFocusWindow:
      todayPlan.recommendedFocusWindow ?? getFallbackFocusWindow(options.userProfile),
    focusTask,
    tasks,
    energyLevel,
    pressureNote:
      energyLevel === 'low'
        ? '今天先保留一点推进感，完成最低线就算往前走了一步。'
        : '先完成最重要的一小步，再决定是否继续加量。'
  }
}

function buildStatusSummary(tasks: PlanCalendarTask[]): string {
  if (tasks.length === 0) {
    return '还没有任务'
  }

  const doneCount = tasks.filter((task) => task.status === 'done').length
  const partialCount = tasks.filter((task) => task.status === 'partial').length
  const todoCount = tasks.filter((task) => task.status === 'todo').length

  if (doneCount === tasks.length) {
    return '今日任务已完成'
  }

  if (partialCount > 0) {
    return `${partialCount} 个任务有部分推进`
  }

  if (todoCount > 0) {
    return `${todoCount} 个任务待开始`
  }

  return '任务已记录'
}

function buildPlanTimePressure(
  plan: Plan,
  progress: PlanProgress,
  today: string
): PlanTimePressure {
  const remainingDays = getInclusiveRemainingDays(today, plan.deadline)
  const remainingEstimatedMinutes = progress.remainingEstimatedMinutes
  const requiredDailyMinutes =
    remainingEstimatedMinutes === 0
      ? 0
      : Math.ceil(remainingEstimatedMinutes / Math.max(remainingDays, 1))

  if (remainingEstimatedMinutes === 0) {
    return {
      level: 'done',
      label: '计划完成',
      helper: '当前计划内任务已完成，可以保留为历史记录。',
      remainingDays,
      dailyAvailableMinutes: plan.dailyAvailableMinutes,
      requiredDailyMinutes,
      remainingEstimatedMinutes
    }
  }

  if (plan.deadline < today) {
    return {
      level: 'overdue',
      label: '需要调整',
      helper: '截止日期已过，建议先缩小范围或重新生成后续计划。',
      remainingDays,
      dailyAvailableMinutes: plan.dailyAvailableMinutes,
      requiredDailyMinutes,
      remainingEstimatedMinutes
    }
  }

  if (requiredDailyMinutes > plan.dailyAvailableMinutes) {
    return {
      level: 'tight',
      label: '节奏偏紧',
      helper: '剩余任务需要的每日时间高于当前可用时间，建议调整计划。',
      remainingDays,
      dailyAvailableMinutes: plan.dailyAvailableMinutes,
      requiredDailyMinutes,
      remainingEstimatedMinutes
    }
  }

  return {
    level: 'steady',
    label: '节奏稳定',
    helper: '按最近 7 天安排推进即可，保留复盘后的调整空间。',
    remainingDays,
    dailyAvailableMinutes: plan.dailyAvailableMinutes,
    requiredDailyMinutes,
    remainingEstimatedMinutes
  }
}

function buildPlanAdvice(options: {
  days: PlanCalendarDay[]
  stages: Stage[]
  timePressure: PlanTimePressure
}): string[] {
  const pressureTip =
    options.timePressure.level === 'tight' || options.timePressure.level === 'overdue'
      ? '先通过复盘或调整计划降低每日压力。'
      : '按最近 7 天计划推进即可。'
  const nearTaskTip =
    options.days.length > 0
      ? `先查看 ${options.days[0]!.date} 的任务，再逐日推进。`
      : '当前没有近 7 天任务，可先检查目标计划。'
  const stageTip =
    options.stages.length > 0
      ? '远期阶段先保持概览，不展开为大量任务。'
      : '当前计划主要集中在近 7 天。'

  return [pressureTip, nearTaskTip, stageTip]
}

function getInclusiveRemainingDays(today: string, deadline: string): number {
  const todayTime = parseIsoDate(today)
  const deadlineTime = parseIsoDate(deadline)

  if (deadlineTime < todayTime) {
    return 0
  }

  return Math.floor((deadlineTime - todayTime) / 86400000) + 1
}

function parseIsoDate(date: string): number {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)

  return Date.UTC(year, month - 1, day)
}

function compareTaskPriority(left: Task, right: Task): number {
  const priorityScore = {
    high: 0,
    medium: 1,
    low: 2
  }

  return priorityScore[left.priority] - priorityScore[right.priority]
}

function getFallbackFocusWindow(userProfile?: UserProfile | null): string {
  const workStyle = userProfile?.workStyle ?? 'flexible'
  const windows: Record<UserProfile['workStyle'], string> = {
    morning: '上午安排最重要的一步',
    afternoon: '下午选择一段稳定时间推进',
    evening: '晚上用安静时间完成一个小块',
    flexible: '选择今天最稳定的一段时间'
  }

  return windows[workStyle]
}
