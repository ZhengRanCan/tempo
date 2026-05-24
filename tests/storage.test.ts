import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getGoal,
  getUserProfile,
  readDailyPlans,
  readGoal,
  readUserProfile
} from '../services/storage'

interface StorageRecord {
  [key: string]: unknown
}

const storage: StorageRecord = {}

beforeEach(() => {
  for (const key of Object.keys(storage)) {
    delete storage[key]
  }

  vi.stubGlobal('uni', {
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storage[key] = value
    }),
    getStorageSync: vi.fn((key: string) => storage[key] ?? ''),
    removeStorageSync: vi.fn((key: string) => {
      delete storage[key]
    })
  })
})

describe('storage compatibility boundary', () => {
  it('reads legacy goals with stable defaults for missing timestamps', async () => {
    storage['goal:goal-1'] = {
      id: 'goal-1',
      title: 'legacy goal',
      deadline: '2026-06-01',
      dailyAvailableMinutes: 45,
      createdAt: '2026-05-24T00:00:00.000Z'
    }

    const result = await readGoal('goal-1')

    expect(result.status).toBe('found')
    expect(result.issues).toEqual([])
    expect(result.data?.updatedAt).toBe('2026-05-24T00:00:00.000Z')
    await expect(getGoal('goal-1')).resolves.toEqual(result.data)
  })

  it('reads legacy user profiles without adding diagnostic or prediction fields', async () => {
    storage['user-profile'] = {
      id: 'local-user',
      mbti: ' infj ',
      workStyle: 'evening',
      preferredFocusMinutes: 25
    }

    const profile = await getUserProfile()
    const result = await readUserProfile()

    expect(result.status).toBe('found')
    expect(profile).toMatchObject({
      id: 'local-user',
      mbti: 'INFJ',
      energyLevel: 'normal',
      workStyle: 'evening',
      preferredFocusMinutes: 25,
      ritualPreference: 'simple'
    })
    expect(profile).not.toHaveProperty('diagnosis')
    expect(profile).not.toHaveProperty('prediction')
  })

  it('returns explicit empty and invalid results instead of unsafe casts', async () => {
    await expect(readGoal('missing-goal')).resolves.toMatchObject({
      status: 'empty',
      data: null,
      issues: [{ code: 'not_found' }]
    })

    storage['goal:broken-goal'] = {
      id: 'broken-goal',
      dailyAvailableMinutes: -1
    }

    await expect(readGoal('broken-goal')).resolves.toMatchObject({
      status: 'invalid',
      data: null,
      issues: [{ code: 'invalid_data' }]
    })
  })

  it('returns an explicit read failure result when local storage throws', async () => {
    vi.stubGlobal('uni', {
      setStorageSync: vi.fn(),
      getStorageSync: vi.fn(() => {
        throw new Error('boom')
      }),
      removeStorageSync: vi.fn()
    })

    await expect(readDailyPlans('goal-1')).resolves.toMatchObject({
      status: 'error',
      data: [],
      issues: [{ code: 'read_failed' }]
    })
  })
})
