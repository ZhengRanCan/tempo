import { describe, expect, it } from 'vitest'
import { buildStarterPlan } from '../services/planner'
import type { Goal } from '../models'

describe('planner initialization smoke test', () => {
  it('builds a dated starter plan without exceeding daily available minutes', () => {
    const goal: Goal = {
      id: 'goal-1',
      title: '完成开题报告初稿',
      deadline: '2026-06-01',
      dailyAvailableMinutes: 60,
      status: 'active',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z'
    }

    const result = buildStarterPlan({
      goal,
      startDate: '2026-05-26'
    })

    expect(result.status).toBe('ok')

    if (result.status !== 'ok') {
      throw new Error(result.reason)
    }

    expect(result.plans.length).toBeGreaterThan(0)
    expect(result.plans.at(-1)?.date).toBe('2026-06-01')

    for (const plan of result.plans) {
      const totalMinutes = plan.tasks.reduce((total, task) => total + task.estimatedMinutes, 0)
      expect(totalMinutes).toBeLessThanOrEqual(goal.dailyAvailableMinutes)
    }
  })
})
