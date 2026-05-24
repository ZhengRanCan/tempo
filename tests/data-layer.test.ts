import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DailyPlan, DailyReview, UserProfile } from '../models'
import { normalizeDailyReview } from '../models/review'
import { buildTodaySuggestion } from '../services/today-suggestion'
import {
  getCurrentGoal,
  getDailyPlans,
  readDailyPlans,
  saveDailyPlans,
  saveGoal
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

describe('data layer compatibility', () => {
  it('supports the goal to stored plan to today suggestion path through storage', async () => {
    const goal = {
      id: 'goal-1',
      title: 'finish proposal',
      deadline: '2026-06-01',
      dailyAvailableMinutes: 45,
      createdAt: '2026-05-24T00:00:00.000Z',
      updatedAt: '2026-05-24T00:00:00.000Z'
    }
    const plans: DailyPlan[] = [
      {
        date: '2026-06-01',
        goalId: 'goal-1',
        tasks: [
          {
            id: 'task-1',
            goalId: 'goal-1',
            title: 'draft proposal outline',
            date: '2026-06-01',
            estimatedMinutes: 30,
            priority: 'high',
            status: 'todo',
            minimumLine: 'write three outline bullets'
          }
        ]
      }
    ]

    await saveGoal(goal)
    await saveDailyPlans(goal.id, plans)

    const currentGoal = await getCurrentGoal()
    const storedPlans = await getDailyPlans(goal.id)
    const view = buildTodaySuggestion(storedPlans, {
      today: '2026-06-01'
    })

    expect(currentGoal?.id).toBe('goal-1')
    expect(view?.focusTask.id).toBe('task-1')
    expect(view?.focusTask.minimumLine).toBe('write three outline bullets')
  })

  it('keeps the no local data path explicit and page-safe', async () => {
    await expect(getCurrentGoal()).resolves.toBeNull()
    await expect(readDailyPlans('goal-1')).resolves.toMatchObject({
      status: 'empty',
      data: [],
      issues: [{ code: 'not_found' }]
    })
  })

  it('normalizes legacy daily plans and tasks with compatible defaults', async () => {
    storage['daily-plans:goal-1'] = [
      {
        date: '2026-06-01',
        goalId: 'goal-1',
        tasks: [
          {
            id: 'task-1',
            title: 'legacy task',
            date: '2026-06-01'
          }
        ]
      }
    ]

    const plans = await getDailyPlans('goal-1')

    expect(plans[0]?.tasks[0]).toMatchObject({
      id: 'task-1',
      goalId: 'goal-1',
      title: 'legacy task',
      estimatedMinutes: 15,
      priority: 'medium',
      status: 'todo'
    })
    expect(plans[0]?.tasks[0]?.minimumLine).toContain('legacy task')
  })

  it('reports partially invalid plan collections without discarding valid records', async () => {
    storage['daily-plans:goal-1'] = [
      {
        date: '2026-06-01',
        goalId: 'goal-1',
        tasks: []
      },
      {
        goalId: 'goal-1',
        tasks: []
      }
    ]

    const result = await readDailyPlans('goal-1')

    expect(result.status).toBe('found')
    expect(result.data).toHaveLength(1)
    expect(result.issues).toEqual([
      {
        code: 'invalid_data',
        message: 'Some local records were skipped because they did not match the schema.'
      }
    ])
  })

  it('normalizes legacy daily reviews with stable energy and non-overlapping status ids', () => {
    const review = normalizeDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      completedTaskIds: ['task-1', 'task-1'],
      partialTaskIds: ['task-1', 'task-2'],
      skippedTaskIds: ['task-2', 'task-3']
    }) as DailyReview

    expect(review.energy).toBe('normal')
    expect(review.completedTaskIds).toEqual(['task-1'])
    expect(review.partialTaskIds).toEqual(['task-2'])
    expect(review.skippedTaskIds).toEqual(['task-3'])
    expect(review.createdAt).toBe('1970-01-01T00:00:00.000Z')
  })

  it('keeps today suggestion as a computed view and does not mutate stored task status', () => {
    const plans: DailyPlan[] = [
      {
        date: '2026-06-01',
        goalId: 'goal-1',
        tasks: [
          {
            id: 'task-1',
            goalId: 'goal-1',
            title: 'finish outline',
            date: '2026-06-01',
            estimatedMinutes: 30,
            priority: 'high',
            status: 'todo',
            minimumLine: 'write three bullets'
          }
        ]
      }
    ]
    const profile: UserProfile = {
      id: 'local-user',
      energyLevel: 'low',
      workStyle: 'morning',
      preferredFocusMinutes: 20,
      ritualPreference: 'simple',
      updatedAt: '2026-05-24T00:00:00.000Z'
    }

    const view = buildTodaySuggestion(plans, {
      today: '2026-06-01',
      userProfile: profile
    })

    expect(view?.source).toBe('stored_plan')
    expect(view?.energyLevel).toBe('low')
    expect(view?.pressureNote).toContain('最低线')
    expect(view?.focusTask).not.toBe(plans[0]?.tasks[0])

    if (view) {
      view.focusTask.status = 'done'
      view.tasks[0]!.status = 'skipped'
    }

    expect(plans[0]?.tasks[0]?.status).toBe('todo')
  })
})
