import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getGoal,
  getActivePlanBundle,
  getUserProfile,
  migrateLegacyDailyPlans,
  readDailyPlans,
  readGoal,
  readPlanBundle,
  savePlanBundle,
  readUserProfile
} from '../services/storage'
import type { DailyPlan, PlanBundle } from '../models'

interface StorageRecord {
  [key: string]: unknown
}

const storage: StorageRecord = {}

function createPlanBundle(): PlanBundle {
  return {
    plan: {
      id: 'plan-1',
      goalId: 'goal-1',
      status: 'active',
      startDate: '2026-06-01',
      deadline: '2026-06-07',
      dailyAvailableMinutes: 45,
      createdAt: '2026-05-26T00:00:00.000Z',
      updatedAt: '2026-05-26T00:00:00.000Z'
    },
    stages: [],
    tasks: [
      {
        id: 'task-1',
        goalId: 'goal-1',
        planId: 'plan-1',
        title: 'draft outline',
        date: '2026-06-01',
        scheduledDate: '2026-06-01',
        estimatedMinutes: 30,
        priority: 'high',
        type: 'focus',
        status: 'done',
        minimumLine: 'write three bullets',
        createdAt: '2026-05-26T00:00:00.000Z',
        updatedAt: '2026-05-26T00:00:00.000Z'
      }
    ]
  }
}

function createLegacyDailyPlans(): DailyPlan[] {
  return [
    {
      date: '2026-06-01',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'task-1',
          goalId: 'goal-1',
          title: 'draft outline',
          date: '2026-06-01',
          estimatedMinutes: 30,
          priority: 'high',
          status: 'partial',
          minimumLine: 'write three bullets'
        },
        {
          id: 'task-2',
          goalId: 'goal-1',
          title: 'collect links',
          date: '2026-06-01',
          estimatedMinutes: 15,
          priority: 'medium',
          status: 'skipped',
          minimumLine: 'save one link'
        }
      ]
    }
  ]
}

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

  it('saves and reads PlanBundle with plan, stages, tasks and status', async () => {
    const bundle = createPlanBundle()

    await savePlanBundle(bundle)

    expect(uni.setStorageSync).toHaveBeenCalledWith('plan-bundle:goal-1', bundle)
    await expect(getActivePlanBundle('goal-1')).resolves.toMatchObject({
      plan: {
        id: 'plan-1',
        status: 'active'
      },
      stages: [],
      tasks: [
        {
          id: 'task-1',
          status: 'done',
          scheduledDate: '2026-06-01'
        }
      ]
    })
  })

  it('keeps legacy daily plans readable and migrates them to PlanBundle', async () => {
    storage['daily-plans:goal-1'] = createLegacyDailyPlans()

    await expect(readDailyPlans('goal-1')).resolves.toMatchObject({
      status: 'found',
      data: [
        {
          date: '2026-06-01',
          tasks: [
            {
              id: 'task-1',
              status: 'partial'
            },
            {
              id: 'task-2',
              status: 'skipped'
            }
          ]
        }
      ]
    })

    const result = await migrateLegacyDailyPlans('goal-1')

    expect(result.status).toBe('found')
    expect(result.data?.tasks).toHaveLength(2)
    expect(result.data?.tasks.map((task) => task.status)).toEqual(['partial', 'skipped'])
    expect(storage['plan-bundle:goal-1']).toMatchObject({
      plan: {
        goalId: 'goal-1',
        status: 'active'
      },
      tasks: [
        {
          id: 'task-1',
          scheduledDate: '2026-06-01'
        },
        {
          id: 'task-2',
          scheduledDate: '2026-06-01'
        }
      ]
    })
  })

  it('keeps legacy migration idempotent and does not overwrite existing task status', async () => {
    const existingBundle = createPlanBundle()

    storage['daily-plans:goal-1'] = createLegacyDailyPlans()
    storage['plan-bundle:goal-1'] = existingBundle

    const firstResult = await migrateLegacyDailyPlans('goal-1')
    const secondResult = await migrateLegacyDailyPlans('goal-1')

    expect(firstResult.data?.tasks).toHaveLength(1)
    expect(secondResult.data?.tasks).toHaveLength(1)
    expect(secondResult.data?.tasks[0]?.status).toBe('done')
    expect(storage['plan-bundle:goal-1']).toEqual(existingBundle)
  })

  it('returns explicit PlanBundle empty and invalid states', async () => {
    await expect(readPlanBundle('missing-goal')).resolves.toMatchObject({
      status: 'empty',
      data: null,
      issues: [{ code: 'not_found' }]
    })

    storage['plan-bundle:goal-1'] = {
      plan: {
        id: 'plan-1'
      },
      tasks: []
    }

    await expect(readPlanBundle('goal-1')).resolves.toMatchObject({
      status: 'invalid',
      data: null,
      issues: [{ code: 'invalid_data' }]
    })
  })

  it('returns an explicit migration write failure without silent success', async () => {
    storage['daily-plans:goal-1'] = createLegacyDailyPlans()
    vi.stubGlobal('uni', {
      setStorageSync: vi.fn(() => {
        throw new Error('quota')
      }),
      getStorageSync: vi.fn((key: string) => storage[key] ?? ''),
      removeStorageSync: vi.fn()
    })

    await expect(migrateLegacyDailyPlans('goal-1')).resolves.toMatchObject({
      status: 'error',
      data: null,
      issues: [{ code: 'write_failed' }]
    })
  })
})
