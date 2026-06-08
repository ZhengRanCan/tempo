import type { PlanCalendarDay, PlanCalendarTask } from '../../services/plan-view'

const PRIORITY_LABELS = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级'
} as const

export function buildCalendarWeekDays(
  sourceDays: PlanCalendarDay[],
  options: {
    today: string
    limit?: number
  }
): PlanCalendarDay[] {
  const dayMap = new Map(sourceDays.map((day) => [day.date, day]))

  return Array.from({ length: options.limit ?? 7 }, (_, index) => {
    const date = addDays(options.today, index)
    const existingDay = dayMap.get(date)

    return existingDay
      ? {
          ...existingDay,
          isToday: date === options.today
        }
      : buildEmptyCalendarDay(date, options.today)
  })
}

export function buildEmptyCalendarDay(date: string, today: string): PlanCalendarDay {
  return {
    date,
    isToday: date === today,
    taskCount: 0,
    totalMinutes: 0,
    statusSummary: '缓冲日',
    tasks: []
  }
}

export function formatShortDate(date: string): string {
  return date.slice(5).replace('-', '/')
}

export function formatMonthDay(date: string): string {
  return date.slice(5).replace('-', '/')
}

export function getWeekdayLabel(date: string): string {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = new Date(year, month - 1, day).getDay()

  return `星期${labels[weekday]}`
}

export function getDayTone(
  day: PlanCalendarDay,
  dailyAvailableMinutes = Number.POSITIVE_INFINITY
): 'planned' | 'done' | 'buffer' | 'risk' | 'progress' {
  if (day.taskCount === 0) {
    return 'buffer'
  }

  if (day.tasks.every((task) => task.status === 'done')) {
    return 'done'
  }

  if (day.totalMinutes > dailyAvailableMinutes) {
    return 'risk'
  }

  if (day.tasks.some((task) => task.status === 'partial')) {
    return 'progress'
  }

  return 'planned'
}

export function getDayStateLabel(day: PlanCalendarDay, dailyAvailableMinutes?: number): string {
  const labels = {
    planned: '有任务',
    done: '已完成',
    buffer: '无任务',
    risk: '风险',
    progress: '推进中'
  }

  return labels[getDayTone(day, dailyAvailableMinutes)]
}

export function getTaskTitle(task: PlanCalendarTask): string {
  return readTaskText((task as { title?: unknown }).title) || '未命名任务'
}

export function getTaskMinimumLine(task: PlanCalendarTask): string {
  const minimumLine = readTaskText((task as { minimumLine?: unknown }).minimumLine)

  return minimumLine || `先完成最小一步：${getTaskTitle(task)}`
}

export function getTaskMinutes(task: PlanCalendarTask): number {
  const minutes = Number((task as { estimatedMinutes?: unknown }).estimatedMinutes)

  return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 15
}

export function getTaskPriorityLabel(task: PlanCalendarTask): string {
  return PRIORITY_LABELS[getTaskPriority(task)]
}

export function isHighPriority(task: PlanCalendarTask): boolean {
  return getTaskPriority(task) === 'high'
}

function addDays(date: string, offset: number): string {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
  const value = new Date(year, month - 1, day)

  value.setDate(value.getDate() + offset)

  const nextYear = value.getFullYear()
  const nextMonth = String(value.getMonth() + 1).padStart(2, '0')
  const nextDay = String(value.getDate()).padStart(2, '0')

  return `${nextYear}-${nextMonth}-${nextDay}`
}

function readTaskText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getTaskPriority(task: PlanCalendarTask): keyof typeof PRIORITY_LABELS {
  const priority = (task as { priority?: unknown }).priority

  return priority === 'high' || priority === 'medium' || priority === 'low' ? priority : 'medium'
}
