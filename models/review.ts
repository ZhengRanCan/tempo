import type { EnergyLevel, TaskStatus } from './common'

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
