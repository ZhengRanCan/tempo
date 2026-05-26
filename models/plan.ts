import type { Task } from './task'
import { normalizeTask } from './task'
import type { TaskStatus } from './common'
import { isRecord, readOptionalString, readPositiveInteger } from './common'
import type { UserProfile } from './user-profile'

export interface DailyPlan {
  date: string
  goalId: string
  tasks: Task[]
  dailyKeyword?: string
  recommendedFocusWindow?: string
}

export type PlanStatus =
  | 'draft'
  | 'active'
  | 'needs_adjustment'
  | 'infeasible'
  | 'completed'
  | 'archived'

export type StageStatus = 'planned' | 'active' | 'completed' | 'skipped'

export interface Plan {
  id: string
  goalId: string
  status: PlanStatus
  startDate: string
  deadline: string
  dailyAvailableMinutes: number
  createdAt: string
  updatedAt: string
}

export interface Stage {
  id: string
  goalId: string
  planId: string
  title: string
  startDate: string
  endDate: string
  status: StageStatus
  order: number
  createdAt: string
  updatedAt: string
}

export interface PlanBundle {
  plan: Plan
  stages: Stage[]
  tasks: Task[]
}

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

export interface PlanBundleCalendarView {
  plan: Plan
  days: PlanCalendarDay[]
  stages: Stage[]
  progress: PlanProgress
}

export interface InfeasiblePlanResult {
  status: 'infeasible'
  reason: string
  suggestions: Array<'extend_deadline' | 'increase_daily_time' | 'reduce_scope'>
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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const LEGACY_PLAN_TIMESTAMP = '1970-01-01T00:00:00.000Z'
const PLAN_STATUSES: readonly PlanStatus[] = [
  'draft',
  'active',
  'needs_adjustment',
  'infeasible',
  'completed',
  'archived'
]
const STAGE_STATUSES: readonly StageStatus[] = ['planned', 'active', 'completed', 'skipped']

export function normalizeDailyPlan(value: unknown, fallbackGoalId?: string): DailyPlan | null {
  if (!isRecord(value)) {
    return null
  }

  const date = readOptionalString(value.date)
  const goalId = readOptionalString(value.goalId) ?? fallbackGoalId

  if (!date || !goalId || !ISO_DATE_PATTERN.test(date)) {
    return null
  }

  const rawTasks = Array.isArray(value.tasks) ? value.tasks : []
  const tasks = rawTasks
    .map((task) =>
      normalizeTask(task, {
        goalId,
        date
      })
    )
    .filter((task): task is Task => task !== null)
  const dailyKeyword = readOptionalString(value.dailyKeyword)
  const recommendedFocusWindow = readOptionalString(value.recommendedFocusWindow)

  return {
    date,
    goalId,
    tasks,
    dailyKeyword,
    recommendedFocusWindow
  }
}

export function normalizePlanBundle(value: unknown): PlanBundle | null {
  if (!isRecord(value)) {
    return null
  }

  const plan = normalizePlan(value.plan)

  if (!plan) {
    return null
  }

  const stages = readArray(value.stages)
    .map((stage) => normalizeStage(stage, plan))
    .filter((stage): stage is Stage => stage !== null)
  const tasks = readArray(value.tasks)
    .map((task) =>
      normalizeTask(task, {
        goalId: plan.goalId,
        planId: plan.id
      })
    )
    .filter((task): task is Task => task !== null)
    .map((task) => ({
      ...task,
      planId: task.planId ?? plan.id,
      scheduledDate: task.scheduledDate ?? task.date
    }))

  return {
    plan,
    stages,
    tasks
  }
}

export function normalizePlan(value: unknown): Plan | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readOptionalString(value.id)
  const goalId = readOptionalString(value.goalId)
  const startDate = readOptionalString(value.startDate)
  const deadline = readOptionalString(value.deadline)
  const dailyAvailableMinutes = readPositiveInteger(value.dailyAvailableMinutes)

  if (
    !id ||
    !goalId ||
    !startDate ||
    !deadline ||
    !ISO_DATE_PATTERN.test(startDate) ||
    !ISO_DATE_PATTERN.test(deadline) ||
    !dailyAvailableMinutes
  ) {
    return null
  }

  const createdAt = readOptionalString(value.createdAt) ?? LEGACY_PLAN_TIMESTAMP
  const updatedAt = readOptionalString(value.updatedAt) ?? createdAt

  return {
    id,
    goalId,
    status: isPlanStatus(value.status) ? value.status : 'active',
    startDate,
    deadline,
    dailyAvailableMinutes,
    createdAt,
    updatedAt
  }
}

export function normalizeStage(value: unknown, plan: Pick<Plan, 'id' | 'goalId'>): Stage | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readOptionalString(value.id)
  const title = readOptionalString(value.title)
  const startDate = readOptionalString(value.startDate)
  const endDate = readOptionalString(value.endDate)

  if (
    !id ||
    !title ||
    !startDate ||
    !endDate ||
    !ISO_DATE_PATTERN.test(startDate) ||
    !ISO_DATE_PATTERN.test(endDate)
  ) {
    return null
  }

  const createdAt = readOptionalString(value.createdAt) ?? LEGACY_PLAN_TIMESTAMP
  const updatedAt = readOptionalString(value.updatedAt) ?? createdAt

  return {
    id,
    goalId: readOptionalString(value.goalId) ?? plan.goalId,
    planId: readOptionalString(value.planId) ?? plan.id,
    title,
    startDate,
    endDate,
    status: isStageStatus(value.status) ? value.status : 'planned',
    order: readPositiveInteger(value.order) ?? 1,
    createdAt,
    updatedAt
  }
}

export function dailyPlansToPlanBundle(
  plans: DailyPlan[],
  options: {
    goalId?: string
    planId?: string
    status?: PlanStatus
    deadline?: string
    dailyAvailableMinutes?: number
    now?: Date
  } = {}
): PlanBundle | null {
  const normalizedPlans = plans
    .map((plan) => normalizeDailyPlan(plan, options.goalId))
    .filter((plan): plan is DailyPlan => plan !== null)

  if (normalizedPlans.length === 0) {
    return null
  }

  const sortedPlans = [...normalizedPlans].sort((left, right) => left.date.localeCompare(right.date))
  const firstPlan = sortedPlans[0]!
  const lastPlan = sortedPlans[sortedPlans.length - 1]!
  const goalId = options.goalId ?? firstPlan.goalId
  const planId = options.planId ?? `plan:${goalId}:${firstPlan.date}`
  const timestamp = options.now?.toISOString() ?? LEGACY_PLAN_TIMESTAMP
  const tasks = sortedPlans.flatMap((plan) =>
    plan.tasks.map((task) => ({
      ...task,
      goalId,
      planId,
      date: task.date,
      scheduledDate: task.scheduledDate ?? task.date,
      type: task.type ?? 'support',
      createdAt: task.createdAt ?? timestamp,
      updatedAt: task.updatedAt ?? timestamp
    }))
  )

  return {
    plan: {
      id: planId,
      goalId,
      status: options.status ?? 'active',
      startDate: firstPlan.date,
      deadline: options.deadline ?? lastPlan.date,
      dailyAvailableMinutes:
        options.dailyAvailableMinutes ?? inferDailyAvailableMinutes(sortedPlans),
      createdAt: timestamp,
      updatedAt: timestamp
    },
    stages: [],
    tasks
  }
}

export function planBundleToDailyPlans(bundle: PlanBundle): DailyPlan[] {
  const tasksByDate = bundle.tasks.reduce<Map<string, Task[]>>((result, task) => {
    const date = task.scheduledDate ?? task.date
    const tasks = result.get(date) ?? []

    tasks.push({
      ...task,
      date
    })
    result.set(date, tasks)

    return result
  }, new Map())

  return [...tasksByDate.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, tasks]) => ({
      date,
      goalId: bundle.plan.goalId,
      tasks
    }))
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
  return {
    plan: bundle.plan,
    days: buildPlanCalendarDays(planBundleToDailyPlans(bundle), options),
    stages: [...bundle.stages].sort((left, right) => left.startDate.localeCompare(right.startDate)),
    progress: buildPlanProgress(bundle)
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

function inferDailyAvailableMinutes(plans: DailyPlan[]): number {
  return plans.reduce((maxMinutes, plan) => {
    const totalMinutes = plan.tasks.reduce((total, task) => total + task.estimatedMinutes, 0)

    return Math.max(maxMinutes, totalMinutes)
  }, 0)
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function isPlanStatus(value: unknown): value is PlanStatus {
  return PLAN_STATUSES.includes(value as PlanStatus)
}

export function isStageStatus(value: unknown): value is StageStatus {
  return STAGE_STATUSES.includes(value as StageStatus)
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
