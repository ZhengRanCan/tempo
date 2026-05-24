import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Goal, UserProfile } from '../models'
import { buildStarterPlan } from '../services/planner'
import { getDailyPlans, saveDailyPlans } from '../services/storage'

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

function createGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    title: '完成开题报告初稿',
    deadline: '2026-06-10',
    dailyAvailableMinutes: 60,
    createdAt: '2026-05-23T00:00:00.000Z',
    updatedAt: '2026-05-23T00:00:00.000Z',
    ...overrides
  }
}

function expectOkPlan(result: ReturnType<typeof buildStarterPlan>) {
  expect(result.status).toBe('ok')

  if (result.status !== 'ok') {
    throw new Error(result.reason)
  }

  return result.plans
}

describe('starter planner', () => {
  it('generates at least 7 days when the deadline leaves enough days', () => {
    const plans = expectOkPlan(
      buildStarterPlan({
        goal: createGoal(),
        startDate: '2026-06-01'
      })
    )

    expect(plans.length).toBeGreaterThanOrEqual(7)
    expect(plans[0]?.date).toBe('2026-06-01')
    expect(plans.at(-1)?.date).toBe('2026-06-10')
  })

  it('allows a shorter plan when the deadline is less than 7 days away', () => {
    const plans = expectOkPlan(
      buildStarterPlan({
        goal: createGoal({
          deadline: '2026-06-03'
        }),
        startDate: '2026-06-01'
      })
    )

    expect(plans).toHaveLength(3)
    expect(plans.at(-1)?.date).toBe('2026-06-03')
  })

  it('keeps each day within the goal daily available minutes', () => {
    const goal = createGoal({
      dailyAvailableMinutes: 20
    })
    const plans = expectOkPlan(
      buildStarterPlan({
        goal,
        startDate: '2026-06-01'
      })
    )

    for (const plan of plans) {
      const totalMinutes = plan.tasks.reduce((total, task) => total + task.estimatedMinutes, 0)
      expect(totalMinutes).toBeLessThanOrEqual(goal.dailyAvailableMinutes)
    }
  })

  it('creates executable tasks with title, duration, priority and minimum line', () => {
    const plans = expectOkPlan(
      buildStarterPlan({
        goal: createGoal(),
        startDate: '2026-06-01'
      })
    )

    for (const plan of plans) {
      for (const task of plan.tasks) {
        expect(task.title).toContain('完成开题报告初稿')
        expect(task.estimatedMinutes).toBeGreaterThan(0)
        expect(['high', 'medium', 'low']).toContain(task.priority)
        expect(task.minimumLine.length).toBeGreaterThan(0)
      }
    }
  })

  it('prioritizes minimum-line language for low energy users', () => {
    const userProfile: UserProfile = {
      id: 'local-user',
      energyLevel: 'low',
      workStyle: 'evening',
      preferredFocusMinutes: 45,
      ritualPreference: 'simple',
      updatedAt: '2026-05-23T00:00:00.000Z'
    }
    const plans = expectOkPlan(
      buildStarterPlan({
        goal: createGoal(),
        startDate: '2026-06-01',
        userProfile
      })
    )

    expect(plans[0]?.recommendedFocusWindow).toBe('晚上用安静时间完成一个小块')
    expect(plans[0]?.tasks[0]?.estimatedMinutes).toBeLessThanOrEqual(20)
    expect(plans[0]?.tasks[0]?.minimumLine).toContain('最低完成线')
  })

  it('returns infeasible when the plan cannot fit before the deadline', () => {
    const result = buildStarterPlan({
      goal: createGoal({
        deadline: '2026-06-01'
      }),
      startDate: '2026-06-02'
    })

    expect(result).toEqual({
      status: 'infeasible',
      reason: '开始日期不能晚于截止日期。',
      suggestions: ['extend_deadline']
    })
  })

  it('returns infeasible when daily time is too small for an executable task', () => {
    const result = buildStarterPlan({
      goal: createGoal({
        dailyAvailableMinutes: 10
      }),
      startDate: '2026-06-01'
    })

    expect(result.status).toBe('infeasible')

    if (result.status !== 'infeasible') {
      throw new Error('Expected an infeasible result.')
    }

    expect(result.suggestions).toContain('increase_daily_time')
    expect(result.suggestions).toContain('reduce_scope')
  })

  it('saves generated plans through the unified storage entry', async () => {
    const goal = createGoal()
    const plans = expectOkPlan(
      buildStarterPlan({
        goal,
        startDate: '2026-06-01'
      })
    )

    await saveDailyPlans(goal.id, plans)

    expect(uni.setStorageSync).toHaveBeenCalledWith('daily-plans:goal-1', plans)
    await expect(getDailyPlans(goal.id)).resolves.toEqual(plans)
  })
})
