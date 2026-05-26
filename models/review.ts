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
  planId?: string
  energy: EnergyLevel
  taskResults?: DailyReviewTaskResult[]
  completedTaskIds: string[]
  partialTaskIds: string[]
  skippedTaskIds: string[]
  note?: string
  createdAt: string
}

export type ReviewTaskStatus = Extract<TaskStatus, 'done' | 'partial' | 'skipped'>

export interface DailyReviewTaskResult {
  taskId: string
  status: ReviewTaskStatus
}

export interface BuildDailyReviewInput {
  date: string
  goalId: string
  planId?: string
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

  const taskResults = readTaskResults(value.taskResults)
  const completedTaskIdsFromResults = taskResults
    .filter((result) => result.status === 'done')
    .map((result) => result.taskId)
  const partialTaskIdsFromResults = taskResults
    .filter((result) => result.status === 'partial')
    .map((result) => result.taskId)
  const skippedTaskIdsFromResults = taskResults
    .filter((result) => result.status === 'skipped')
    .map((result) => result.taskId)
  const completedTaskIds = [
    ...new Set([...readStringList(value.completedTaskIds), ...completedTaskIdsFromResults])
  ]
  const partialTaskIds = [
    ...new Set([...readStringList(value.partialTaskIds), ...partialTaskIdsFromResults])
  ].filter(
    (taskId) => !completedTaskIds.includes(taskId)
  )
  const skippedTaskIds = [
    ...new Set([...readStringList(value.skippedTaskIds), ...skippedTaskIdsFromResults])
  ].filter(
    (taskId) => !completedTaskIds.includes(taskId) && !partialTaskIds.includes(taskId)
  )
  const note = readOptionalString(value.note)
  const planId = readOptionalString(value.planId)

  return {
    id: readOptionalString(value.id) ?? `${goalId}:${date}`,
    date,
    goalId,
    ...(planId ? { planId } : {}),
    energy: isEnergyLevel(value.energy) ? value.energy : 'normal',
    ...(taskResults.length > 0 ? { taskResults } : {}),
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
    ...(input.planId ? { planId: input.planId } : {}),
    energy: input.energy ?? 'normal',
    completedTaskIds,
    partialTaskIds,
    skippedTaskIds,
    note: note || undefined,
    createdAt: now.toISOString()
  }
}

function readTaskResults(value: unknown): DailyReviewTaskResult[] {
  if (!Array.isArray(value)) {
    return []
  }

  const results: DailyReviewTaskResult[] = []
  const seenTaskIds = new Set<string>()

  for (const item of value) {
    if (!isRecord(item)) {
      continue
    }

    const taskId = readOptionalString(item.taskId)
    const status = item.status

    if (
      taskId &&
      !seenTaskIds.has(taskId) &&
      (status === 'done' || status === 'partial' || status === 'skipped')
    ) {
      results.push({
        taskId,
        status
      })
      seenTaskIds.add(taskId)
    }
  }

  return results
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
