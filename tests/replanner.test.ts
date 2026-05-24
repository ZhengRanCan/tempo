import { describe, expect, it } from 'vitest'
import type { DailyPlan, DailyReview, Goal } from '../models'
import { replanAfterReview } from '../services/replanner'

function createGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    title: '完成开题报告初稿',
    deadline: '2026-06-03',
    dailyAvailableMinutes: 60,
    createdAt: '2026-05-23T00:00:00.000Z',
    updatedAt: '2026-05-23T00:00:00.000Z',
    ...overrides
  }
}

function createPlans(): DailyPlan[] {
  return [
    {
      date: '2026-06-01',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'task-done',
          goalId: 'goal-1',
          title: '已经完成的资料整理',
          date: '2026-06-01',
          estimatedMinutes: 15,
          priority: 'medium',
          status: 'todo',
          minimumLine: '整理出 3 条资料。'
        },
        {
          id: 'task-high',
          goalId: 'goal-1',
          title: '高优先级研究问题草稿',
          date: '2026-06-01',
          estimatedMinutes: 30,
          priority: 'high',
          status: 'todo',
          minimumLine: '写出 3 个候选研究问题。'
        },
        {
          id: 'task-low',
          goalId: 'goal-1',
          title: '低优先级格式整理',
          date: '2026-06-01',
          estimatedMinutes: 15,
          priority: 'low',
          status: 'todo',
          minimumLine: '统一 2 个标题格式。'
        }
      ]
    },
    {
      date: '2026-06-02',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'existing-next-day',
          goalId: 'goal-1',
          title: '次日已有任务',
          date: '2026-06-02',
          estimatedMinutes: 30,
          priority: 'medium',
          status: 'todo',
          minimumLine: '完成一个小块。'
        }
      ]
    },
    {
      date: '2026-06-03',
      goalId: 'goal-1',
      tasks: []
    }
  ]
}

function createReview(): DailyReview {
  return {
    id: 'goal-1:2026-06-01',
    date: '2026-06-01',
    goalId: 'goal-1',
    energy: 'normal',
    completedTaskIds: ['task-done'],
    partialTaskIds: ['task-high'],
    skippedTaskIds: ['task-low'],
    createdAt: '2026-06-01T21:00:00.000Z'
  }
}

function expectOk(result: ReturnType<typeof replanAfterReview>): DailyPlan[] {
  expect(result.status).toBe('ok')

  if (result.status !== 'ok') {
    throw new Error(result.reason)
  }

  return result.plans
}

describe('replanner', () => {
  it('moves unfinished tasks to following dates', () => {
    const plans = expectOk(
      replanAfterReview({
        plans: createPlans(),
        review: createReview(),
        goal: createGoal()
      })
    )

    const movedTasks = plans
      .filter((plan) => plan.date > '2026-06-01')
      .flatMap((plan) => plan.tasks)
      .filter((task) => task.id.includes('carryover'))

    expect(movedTasks.map((task) => task.id)).toEqual([
      'task-high:carryover:2026-06-01',
      'task-low:carryover:2026-06-01'
    ])
    expect(movedTasks.every((task) => task.status === 'todo')).toBe(true)
  })

  it('keeps high priority tasks ahead when rescheduling carryover work', () => {
    const plans = expectOk(
      replanAfterReview({
        plans: createPlans(),
        review: createReview(),
        goal: createGoal()
      })
    )

    const juneSecond = plans.find((plan) => plan.date === '2026-06-02')
    const juneThird = plans.find((plan) => plan.date === '2026-06-03')

    expect(juneSecond?.tasks.some((task) => task.id === 'task-high:carryover:2026-06-01')).toBe(
      true
    )
    expect(juneThird?.tasks.some((task) => task.id === 'task-low:carryover:2026-06-01')).toBe(true)
    expect(juneSecond?.tasks.find((task) => task.id.includes('task-high'))?.priority).toBe('high')
  })

  it('keeps each replanned day within daily available minutes', () => {
    const goal = createGoal({
      dailyAvailableMinutes: 60
    })
    const plans = expectOk(
      replanAfterReview({
        plans: createPlans(),
        review: createReview(),
        goal
      })
    )

    for (const plan of plans) {
      const totalMinutes = plan.tasks.reduce((total, task) => total + task.estimatedMinutes, 0)
      expect(totalMinutes).toBeLessThanOrEqual(goal.dailyAvailableMinutes)
    }
  })

  it('preserves completed task history on the reviewed date', () => {
    const plans = expectOk(
      replanAfterReview({
        plans: createPlans(),
        review: createReview(),
        goal: createGoal()
      })
    )

    const reviewDatePlan = plans.find((plan) => plan.date === '2026-06-01')

    expect(reviewDatePlan?.tasks.find((task) => task.id === 'task-done')?.status).toBe('done')
    expect(reviewDatePlan?.tasks.find((task) => task.id === 'task-high')?.status).toBe('partial')
    expect(reviewDatePlan?.tasks.find((task) => task.id === 'task-low')?.status).toBe('skipped')
  })

  it('returns infeasible when carryover work cannot fit before the deadline', () => {
    const result = replanAfterReview({
      plans: createPlans(),
      review: createReview(),
      goal: createGoal({
        deadline: '2026-06-02',
        dailyAvailableMinutes: 30
      })
    })

    expect(result.status).toBe('infeasible')

    if (result.status !== 'infeasible') {
      throw new Error('Expected infeasible replanning result.')
    }

    expect(result.suggestions).toEqual(['extend_deadline', 'increase_daily_time', 'reduce_scope'])
  })
})
