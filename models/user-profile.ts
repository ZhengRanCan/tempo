import type { EnergyLevel, WorkStyle } from './common'

export type RitualPreference = 'simple' | 'warm' | 'energetic'

export interface CreateUserProfileInput {
  mbti?: string
  workStyle?: WorkStyle
  energyLevel?: EnergyLevel
  preferredFocusMinutes?: string | number
  ritualPreference?: RitualPreference
}

export interface UserProfile {
  id: string
  energyLevel: EnergyLevel
  mbti?: string
  workStyle: WorkStyle
  preferredFocusMinutes: number
  ritualPreference: RitualPreference
  updatedAt: string
}

export type UserPreferenceEffect = 'expression' | 'ordering'

export interface UserPreferenceBoundary {
  effects: UserPreferenceEffect[]
  forbiddenClaims: string[]
  note: string
}

export const DEFAULT_ENERGY_LEVEL: EnergyLevel = 'normal'
export const DEFAULT_WORK_STYLE: WorkStyle = 'flexible'
export const DEFAULT_PREFERRED_FOCUS_MINUTES = 30
export const DEFAULT_RITUAL_PREFERENCE: RitualPreference = 'simple'

export function buildUserProfile(
  input: CreateUserProfileInput = {},
  options: {
    id?: string
    now?: Date
  } = {}
): UserProfile {
  const now = options.now ?? new Date()
  const mbti = normalizeMbti(input.mbti)

  return {
    id: options.id ?? 'local-user',
    energyLevel: input.energyLevel ?? DEFAULT_ENERGY_LEVEL,
    mbti,
    workStyle: input.workStyle ?? DEFAULT_WORK_STYLE,
    preferredFocusMinutes:
      parsePreferredFocusMinutes(input.preferredFocusMinutes) ?? DEFAULT_PREFERRED_FOCUS_MINUTES,
    ritualPreference: input.ritualPreference ?? DEFAULT_RITUAL_PREFERENCE,
    updatedAt: now.toISOString()
  }
}

export function getUserPreferenceBoundary(): UserPreferenceBoundary {
  return {
    effects: ['expression', 'ordering'],
    forbiddenClaims: ['psychological_diagnosis', 'health_prediction', 'fate_prediction'],
    note: '用户偏好只用于任务表达和轻量排序，不用于心理判断、健康判断或结果预测。'
  }
}

function normalizeMbti(value?: string): string | undefined {
  const mbti = value?.trim().toUpperCase()

  return mbti || undefined
}

function parsePreferredFocusMinutes(value?: string | number): number | null {
  if (value === undefined || value === '') {
    return null
  }

  const minutes = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return null
  }

  return Math.floor(minutes)
}
