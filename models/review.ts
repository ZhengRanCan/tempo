import type { EnergyLevel, TaskStatus } from './common'
import {
  LEGACY_FALLBACK_TIMESTAMP,
  isEnergyLevel,
  isRecord,
  readOptionalString
} from './common'

export interface DailyReview {
  id: string
  date: string
  goalId: string
  energy: EnergyLevel
  completedTaskIds: string[]
  partialTaskIds: string[]
  skippedTaskIds: string[]
  note?: string
  createdAt: string
}

export type ReviewTaskStatus = Extract<TaskStatus, 'done' | 'partial' | 'skipped'>

export interface BuildDailyReviewInput {
  date: string
  goalId: string
  energy?: EnergyLevel
  taskStatusById: Record<string, ReviewTaskStatus>
  note?: string
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function normalizeDailyReview(value: unknown): DailyReview | null {
  if (!isRecord(value)) {
    return null
  }

  const date = readOptionalString(value.date)
  const goalId = readOptionalString(value.goalId)

  if (!date || !goalId || !ISO_DATE_PATTERN.test(date)) {
    return null
  }

  const completedTaskIds = readStringList(value.completedTaskIds)
  const partialTaskIds = readStringList(value.partialTaskIds).filter(
    (taskId) => !completedTaskIds.includes(taskId)
  )
  const skippedTaskIds = readStringList(value.skippedTaskIds).filter(
    (taskId) => !completedTaskIds.includes(taskId) && !partialTaskIds.includes(taskId)
  )
  const note = readOptionalString(value.note)

  return {
    id: readOptionalString(value.id) ?? `${goalId}:${date}`,
    date,
    goalId,
    energy: isEnergyLevel(value.energy) ? value.energy : 'normal',
    completedTaskIds,
    partialTaskIds,
    skippedTaskIds,
    note,
    createdAt: readOptionalString(value.createdAt) ?? LEGACY_FALLBACK_TIMESTAMP
  }
}

export function buildDailyReview(
  input: BuildDailyReviewInput,
  options: {
    now?: Date
    id?: string
  } = {}
): DailyReview {
  const completedTaskIds = collectTaskIds(input.taskStatusById, 'done')
  const partialTaskIds = collectTaskIds(input.taskStatusById, 'partial')
  const skippedTaskIds = collectTaskIds(input.taskStatusById, 'skipped')
  const note = input.note?.trim()
  const now = options.now ?? new Date()

  return {
    id: options.id ?? `${input.goalId}:${input.date}`,
    date: input.date,
    goalId: input.goalId,
    energy: input.energy ?? 'normal',
    completedTaskIds,
    partialTaskIds,
    skippedTaskIds,
    note: note || undefined,
    createdAt: now.toISOString()
  }
}

function collectTaskIds(
  taskStatusById: Record<string, ReviewTaskStatus>,
  status: ReviewTaskStatus
): string[] {
  return Object.entries(taskStatusById)
    .filter(([, taskStatus]) => taskStatus === status)
    .map(([taskId]) => taskId)
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.map(readOptionalString).filter((item): item is string => !!item))]
}
