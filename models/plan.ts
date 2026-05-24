import type { Task } from './task'
import type { TaskStatus } from './common'
import type { UserProfile } from './user-profile'

export interface DailyPlan {
  date: string
  goalId: string
  tasks: Task[]
  dailyKeyword?: string
  recommendedFocusWindow?: string
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
