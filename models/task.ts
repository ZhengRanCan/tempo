import type { TaskPriority, TaskStatus } from './common'
import {
  isRecord,
  isTaskPriority,
  isTaskStatus,
  readOptionalString,
  readPositiveInteger
} from './common'

export type TaskType = 'focus' | 'support' | 'buffer' | 'review'

export interface Task {
  id: string
  goalId: string
  planId?: string
  stageId?: string
  title: string
  description?: string
  date: string
  scheduledDate?: string
  estimatedMinutes: number
  priority: TaskPriority
  type?: TaskType
  status: TaskStatus
  minimumLine: string
  focusSuggestion?: string
  caution?: string
  createdAt?: string
  updatedAt?: string
}

const DEFAULT_TASK_MINUTES = 15
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TASK_TYPES: readonly TaskType[] = ['focus', 'support', 'buffer', 'review']

export interface NormalizeTaskContext {
  goalId?: string
  date?: string
  planId?: string
  stageId?: string
}

export function normalizeTask(value: unknown, context: NormalizeTaskContext = {}): Task | null {
  if (!isRecord(value)) {
    return null
  }

  const title = readOptionalString(value.title)
  const goalId = readOptionalString(value.goalId) ?? context.goalId
  const scheduledDate = readOptionalString(value.scheduledDate)
  const date = readOptionalString(value.date) ?? scheduledDate ?? context.date

  if (!title || !goalId || !date || !ISO_DATE_PATTERN.test(date)) {
    return null
  }

  const planId = readOptionalString(value.planId) ?? context.planId
  const stageId = readOptionalString(value.stageId) ?? context.stageId
  const id =
    readOptionalString(value.id) ??
    `legacy-task:${goalId}:${date}:${title.toLowerCase().replace(/\s+/g, '-')}`
  const estimatedMinutes = readPositiveInteger(value.estimatedMinutes) ?? DEFAULT_TASK_MINUTES
  const priority: TaskPriority = isTaskPriority(value.priority) ? value.priority : 'medium'
  const status: TaskStatus = isTaskStatus(value.status) ? value.status : 'todo'
  const type = isTaskType(value.type) ? value.type : undefined
  const minimumLine = readOptionalString(value.minimumLine) ?? `先完成最小一步：${title}`
  const description = readOptionalString(value.description)
  const focusSuggestion = readOptionalString(value.focusSuggestion)
  const caution = readOptionalString(value.caution)
  const createdAt = readOptionalString(value.createdAt)
  const updatedAt = readOptionalString(value.updatedAt)

  return {
    id,
    goalId,
    ...(planId ? { planId } : {}),
    ...(stageId ? { stageId } : {}),
    title,
    description,
    date,
    ...(scheduledDate ? { scheduledDate } : {}),
    estimatedMinutes,
    priority,
    ...(type ? { type } : {}),
    status,
    minimumLine,
    focusSuggestion,
    caution,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {})
  }
}

export function isTaskType(value: unknown): value is TaskType {
  return TASK_TYPES.includes(value as TaskType)
}
