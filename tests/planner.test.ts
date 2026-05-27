import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Goal, UserProfile } from '../models'
import { buildStarterPlan, buildStarterPlanBundle } from '../services/planner'
import {
  getActivePlanBundle,
  getDailyPlans,
  saveDailyPlans,
  savePlanBundle
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

function createGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    title: '完成开题报告初稿',
    deadline: '2026-06-10',
    dailyAvailableMinutes: 60,
    status: 'active',
    createdAt: '2026-05-23T00:00:00.000Z',
    updatedAt: '2026-05-23T00:00:00.000Z',
    ...overrides
  }
}

function createLowEnergyProfile(): UserProfile {
  return {
    id: 'local-user',
    energyLevel: 'low',
    workStyle: 'evening',
    preferredFocusMinutes: 45,
    ritualPreference: 'simple',
    updatedAt: '2026-05-23T00:00:00.000Z'
  }
}

function expectOkPlan(result: ReturnType<typeof buildStarterPlan>) {
  expect(result.status).toBe('ok')

  if (result.status !== 'ok') {
    throw new Error(result.reason)
  }

  return result.plans
}

function expectOkBundle(result: ReturnType<typeof buildStarterPlanBundle>) {
  expect(result.status).toBe('ok')

  if (result.status !== 'ok') {
    throw new Error(result.reason)
  }

  return result.bundle
}

describe('starter planner', () => {
  it('generates a PlanBundle with near-term tasks and a far-term stage', () => {
    const bundle = expectOkBundle(
      buildStarterPlanBundle({
        goal: createGoal(),
        startDate: '2026-06-01'
      })
    )

    expect(bundle.plan).toMatchObject({
      goalId: 'goal-1',
      status: 'active',
      startDate: '2026-06-01',
      deadline: '2026-06-10',
      dailyAvailableMinutes: 60
    })
    expect(bundle.tasks).toHaveLength(7)
    expect(bundle.tasks[0]).toMatchObject({
      scheduledDate: '2026-06-01',
      type: 'focus',
      priority: 'high'
    })
    expect(bundle.tasks.at(-1)?.scheduledDate).toBe('2026-06-07')
    expect(bundle.stages).toEqual([
      expect.objectContaining({
        title: '后续阶段',
        startDate: '2026-06-08',
        endDate: '2026-06-10',
        status: 'planned'
      })
    ])
    expect(bundle.plan).not.toHaveProperty('dailyKeyword')
    expect(bundle.plan).not.toHaveProperty('recommendedFocusWindow')
  })

  it('generates only concrete tasks when the deadline is within 7 days', () => {
    const bundle = expectOkBundle(
      buildStarterPlanBundle({
        goal: createGoal({
          deadline: '2026-06-03'
        }),
        startDate: '2026-06-01'
      })
    )

    expect(bundle.tasks.map((task) => task.scheduledDate)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03'
    ])
    expect(bundle.stages).toEqual([])
  })

  it('keeps the legacy planner output available for near-term tasks', () => {
    const plans = expectOkPlan(
      buildStarterPlan({
        goal: createGoal(),
        startDate: '2026-06-01'
      })
    )

    expect(plans).toHaveLength(7)
    expect(plans[0]?.date).toBe('2026-06-01')
    expect(plans.at(-1)?.date).toBe('2026-06-07')
    expect(plans[0]?.dailyKeyword).toBe('启动')
  })

  it('keeps each concrete task within the goal daily available minutes', () => {
    const goal = createGoal({
      dailyAvailableMinutes: 20
    })
    const bundle = expectOkBundle(
      buildStarterPlanBundle({
        goal,
        startDate: '2026-06-01'
      })
    )

    for (const date of new Set(bundle.tasks.map((task) => task.scheduledDate))) {
      const totalMinutes = bundle.tasks
        .filter((task) => task.scheduledDate === date)
        .reduce((total, task) => total + task.estimatedMinutes, 0)
      expect(totalMinutes).toBeLessThanOrEqual(goal.dailyAvailableMinutes)
    }
  })

  it('creates executable tasks with title, duration, priority and minimum line', () => {
    const bundle = expectOkBundle(
      buildStarterPlanBundle({
        goal: createGoal(),
        startDate: '2026-06-01'
      })
    )

    for (const task of bundle.tasks) {
      expect(task.title).toContain('完成开题报告初稿')
      expect(task.estimatedMinutes).toBeGreaterThan(0)
      expect(['high', 'medium', 'low']).toContain(task.priority)
      expect(task.minimumLine.length).toBeGreaterThan(0)
    }
  })

  it('prioritizes minimum-line language for low energy users', () => {
    const userProfile = createLowEnergyProfile()
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
    const result = buildStarterPlanBundle({
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
    const result = buildStarterPlanBundle({
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

  it('saves generated legacy plans through the unified storage entry', async () => {
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

  it('saves generated PlanBundle through the unified storage entry', async () => {
    const goal = createGoal()
    const bundle = expectOkBundle(
      buildStarterPlanBundle({
        goal,
        startDate: '2026-06-01'
      })
    )

    await savePlanBundle(bundle)

    expect(uni.setStorageSync).toHaveBeenCalledWith('plan-bundle:goal-1', bundle)
    await expect(getActivePlanBundle(goal.id)).resolves.toMatchObject({
      plan: {
        id: bundle.plan.id,
        status: 'active'
      },
      tasks: expect.arrayContaining([
        expect.objectContaining({
          scheduledDate: '2026-06-01'
        })
      ])
    })
  })
})
