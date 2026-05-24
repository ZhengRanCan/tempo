export type EnergyLevel = 'low' | 'normal' | 'high'

export type TaskStatus = 'todo' | 'done' | 'partial' | 'skipped'

export type TaskPriority = 'high' | 'medium' | 'low'

export type WorkStyle = 'morning' | 'afternoon' | 'evening' | 'flexible'

export const LEGACY_FALLBACK_TIMESTAMP = '1970-01-01T00:00:00.000Z'

const ENERGY_LEVELS: readonly EnergyLevel[] = ['low', 'normal', 'high']
const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'done', 'partial', 'skipped']
const TASK_PRIORITIES: readonly TaskPriority[] = ['high', 'medium', 'low']
const WORK_STYLES: readonly WorkStyle[] = ['morning', 'afternoon', 'evening', 'flexible']

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function readPositiveInteger(value: unknown): number | null {
  const numberValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null
  }

  return Math.floor(numberValue)
}

export function isEnergyLevel(value: unknown): value is EnergyLevel {
  return ENERGY_LEVELS.includes(value as EnergyLevel)
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus)
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority)
}

export function isWorkStyle(value: unknown): value is WorkStyle {
  return WORK_STYLES.includes(value as WorkStyle)
}
