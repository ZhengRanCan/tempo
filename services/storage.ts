import type { DailyPlan, DailyReview, Goal, PlanBundle, UserProfile } from '../models'
import { normalizeGoal } from '../models/goal'
import { dailyPlansToPlanBundle, normalizeDailyPlan, normalizePlanBundle } from '../models/plan'
import { normalizeDailyReview } from '../models/review'
import { normalizeUserProfile } from '../models/user-profile'

const USER_PROFILE_KEY = 'user-profile'
const CURRENT_GOAL_ID_KEY = 'current-goal-id'

export type StorageReadStatus = 'found' | 'empty' | 'invalid' | 'error'
export type StorageErrorCode = 'not_found' | 'read_failed' | 'write_failed' | 'invalid_data'

export interface StorageIssue {
  code: StorageErrorCode
  message: string
}

export interface StorageReadResult<T> {
  status: StorageReadStatus
  data: T
  issues: StorageIssue[]
}

function goalKey(goalId: string): string {
  return `goal:${goalId}`
}

function dailyPlansKey(goalId: string): string {
  return `daily-plans:${goalId}`
}

function dailyReviewsKey(goalId: string): string {
  return `daily-reviews:${goalId}`
}

function planBundleKey(goalId: string): string {
  return `plan-bundle:${goalId}`
}

export async function saveGoal(goal: Goal): Promise<void> {
  writeStorage(goalKey(goal.id), goal)
  writeStorage(CURRENT_GOAL_ID_KEY, goal.id)
}

export async function getGoal(goalId: string): Promise<Goal | null> {
  return (await readGoal(goalId)).data
}

export async function readGoal(goalId: string): Promise<StorageReadResult<Goal | null>> {
  return readStorageValue(goalKey(goalId), null, normalizeGoal)
}

export async function getCurrentGoalId(): Promise<string | null> {
  const result = await readStorageValue(CURRENT_GOAL_ID_KEY, null, (value) =>
    typeof value === 'string' && value.trim() ? value.trim() : null
  )

  return result.data
}

export async function getCurrentGoal(): Promise<Goal | null> {
  const goalId = await getCurrentGoalId()

  return goalId ? getGoal(goalId) : null
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  writeStorage(USER_PROFILE_KEY, profile)
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return (await readUserProfile()).data
}

export async function readUserProfile(): Promise<StorageReadResult<UserProfile | null>> {
  return readStorageValue(USER_PROFILE_KEY, null, normalizeUserProfile)
}

export async function saveDailyPlans(goalId: string, plans: DailyPlan[]): Promise<void> {
  writeStorage(dailyPlansKey(goalId), plans)
}

export async function getDailyPlans(goalId: string): Promise<DailyPlan[]> {
  return (await readDailyPlans(goalId)).data
}

export async function readDailyPlans(goalId: string): Promise<StorageReadResult<DailyPlan[]>> {
  const key = dailyPlansKey(goalId)

  return readStorageCollection(key, (value) => normalizeDailyPlan(value, goalId))
}

export async function savePlanBundle(bundle: PlanBundle): Promise<void> {
  writeStorage(planBundleKey(bundle.plan.goalId), bundle)
}

export async function getActivePlanBundle(goalId: string): Promise<PlanBundle | null> {
  return (await readPlanBundle(goalId)).data
}

export async function readPlanBundle(
  goalId: string
): Promise<StorageReadResult<PlanBundle | null>> {
  return readStorageValue(planBundleKey(goalId), null, normalizePlanBundle)
}

export async function migrateLegacyDailyPlans(
  goalId: string
): Promise<StorageReadResult<PlanBundle | null>> {
  const existingBundle = await readPlanBundle(goalId)

  if (existingBundle.status === 'found') {
    return existingBundle
  }

  if (existingBundle.status === 'error' || existingBundle.status === 'invalid') {
    return existingBundle
  }

  const legacyPlans = await readDailyPlans(goalId)

  if (legacyPlans.status !== 'found') {
    return {
      status: legacyPlans.status,
      data: null,
      issues: legacyPlans.issues
    }
  }

  const bundle = dailyPlansToPlanBundle(legacyPlans.data, {
    goalId
  })

  if (!bundle) {
    return {
      status: 'invalid',
      data: null,
      issues: [
        {
          code: 'invalid_data',
          message: 'Legacy daily plans could not be converted to a plan bundle.'
        }
      ]
    }
  }

  try {
    await savePlanBundle(bundle)
  } catch {
    return {
      status: 'error',
      data: null,
      issues: [
        {
          code: 'write_failed',
          message: 'PlanBundle migration write failed.'
        }
      ]
    }
  }

  return {
    status: 'found',
    data: bundle,
    issues: []
  }
}

export async function saveDailyReview(review: DailyReview): Promise<void> {
  const reviews = await getDailyReviews(review.goalId)
  const nextReviews = reviews.filter((item) => item.id !== review.id)

  nextReviews.push(review)
  writeStorage(dailyReviewsKey(review.goalId), nextReviews)
}

export async function getDailyReviews(goalId: string): Promise<DailyReview[]> {
  return (await readDailyReviews(goalId)).data
}

export async function readDailyReviews(goalId: string): Promise<StorageReadResult<DailyReview[]>> {
  return readStorageCollection(dailyReviewsKey(goalId), normalizeDailyReview)
}

export async function deleteGoal(goalId: string): Promise<void> {
  uni.removeStorageSync(goalKey(goalId))
  uni.removeStorageSync(dailyPlansKey(goalId))
  uni.removeStorageSync(dailyReviewsKey(goalId))
  uni.removeStorageSync(planBundleKey(goalId))

  if ((await getCurrentGoalId()) === goalId) {
    uni.removeStorageSync(CURRENT_GOAL_ID_KEY)
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, value)
  } catch {
    throw new Error('storage_write_failed')
  }
}

function readRawStorage(key: string): StorageReadResult<unknown> {
  try {
    const value = uni.getStorageSync(key)

    if (value === '' || value === null || value === undefined) {
      return {
        status: 'empty',
        data: null,
        issues: [
          {
            code: 'not_found',
            message: 'No local data exists for this key.'
          }
        ]
      }
    }

    return {
      status: 'found',
      data: value,
      issues: []
    }
  } catch {
    return {
      status: 'error',
      data: null,
      issues: [
        {
          code: 'read_failed',
          message: 'Local storage read failed.'
        }
      ]
    }
  }
}

function readStorageValue<T>(
  key: string,
  emptyData: T,
  normalize: (value: unknown) => T | null
): StorageReadResult<T> {
  const raw = readRawStorage(key)

  if (raw.status !== 'found') {
    return {
      status: raw.status,
      data: emptyData,
      issues: raw.issues
    }
  }

  const data = normalize(raw.data)

  if (data === null) {
    return {
      status: 'invalid',
      data: emptyData,
      issues: [
        {
          code: 'invalid_data',
          message: 'Local data did not match the supported schema.'
        }
      ]
    }
  }

  return {
    status: 'found',
    data,
    issues: []
  }
}

function readStorageCollection<T>(
  key: string,
  normalize: (value: unknown) => T | null
): StorageReadResult<T[]> {
  const raw = readRawStorage(key)

  if (raw.status !== 'found') {
    return {
      status: raw.status,
      data: [],
      issues: raw.issues
    }
  }

  const values = Array.isArray(raw.data) ? raw.data : [raw.data]
  const data: T[] = []
  let invalidCount = 0

  for (const value of values) {
    const normalized = normalize(value)

    if (normalized) {
      data.push(normalized)
    } else {
      invalidCount += 1
    }
  }

  if (data.length === 0 && invalidCount > 0) {
    return {
      status: 'invalid',
      data: [],
      issues: [
        {
          code: 'invalid_data',
          message: 'Local data did not match the supported schema.'
        }
      ]
    }
  }

  return {
    status: 'found',
    data,
    issues:
      invalidCount > 0
        ? [
            {
              code: 'invalid_data',
              message: 'Some local records were skipped because they did not match the schema.'
            }
          ]
        : []
  }
}
