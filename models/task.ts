import type { TaskPriority, TaskStatus } from './common'
import {
  isRecord,
  isTaskPriority,
  isTaskStatus,
  readOptionalString,
  readPositiveInteger
} from './common'

export interface Task {
  id: string
  goalId: string
  title: string
  description?: string
  date: string
  estimatedMinutes: number
  priority: TaskPriority
  status: TaskStatus
  minimumLine: string
  focusSuggestion?: string
  caution?: string
}

const DEFAULT_TASK_MINUTES = 15
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export interface NormalizeTaskContext {
  goalId?: string
  date?: string
}

export function normalizeTask(value: unknown, context: NormalizeTaskContext = {}): Task | null {
  if (!isRecord(value)) {
    return null
  }

  const title = readOptionalString(value.title)
  const goalId = readOptionalString(value.goalId) ?? context.goalId
  const date = readOptionalString(value.date) ?? context.date

  if (!title || !goalId || !date || !ISO_DATE_PATTERN.test(date)) {
    return null
  }

  const id =
    readOptionalString(value.id) ??
    `legacy-task:${goalId}:${date}:${title.toLowerCase().replace(/\s+/g, '-')}`
  const estimatedMinutes = readPositiveInteger(value.estimatedMinutes) ?? DEFAULT_TASK_MINUTES
  const priority: TaskPriority = isTaskPriority(value.priority) ? value.priority : 'medium'
  const status: TaskStatus = isTaskStatus(value.status) ? value.status : 'todo'
  const minimumLine = readOptionalString(value.minimumLine) ?? `先完成最小一步：${title}`
  const description = readOptionalString(value.description)
  const focusSuggestion = readOptionalString(value.focusSuggestion)
  const caution = readOptionalString(value.caution)

  return {
    id,
    goalId,
    title,
    description,
    date,
    estimatedMinutes,
    priority,
    status,
    minimumLine,
    focusSuggestion,
    caution
  }
}
