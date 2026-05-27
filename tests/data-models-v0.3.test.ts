import { describe, expect, it } from 'vitest'
import type { DailyPlan, GoalStatus, PlanStatus, StageStatus, TaskType } from '../models'
import { normalizeGoal } from '../models/goal'
import {
  dailyPlansToPlanBundle,
  planBundleToDailyPlans
} from '../models/plan'
import { buildDailyReview, normalizeDailyReview } from '../models/review'
import { normalizeTask } from '../models/task'
import { buildDailyTaskViews, buildPlanProgress, type PlanProgress } from '../services/plan-view'

function createLegacyDailyPlans(): DailyPlan[] {
  return [
    {
      date: '2026-06-01',
      goalId: 'goal-1',
      dailyKeyword: 'legacy keyword',
      recommendedFocusWindow: '09:00-09:30',
      tasks: [
        {
          id: 'task-1',
          goalId: 'goal-1',
          title: 'draft proposal outline',
          date: '2026-06-01',
          scheduledDate: '2026-06-01',
          estimatedMinutes: 30,
          priority: 'high',
          status: 'partial',
          minimumLine: 'write three outline bullets',
          caution: 'keep it short'
        }
      ]
    },
    {
      date: '2026-06-02',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'task-2',
          goalId: 'goal-1',
          title: 'collect references',
          date: '2026-06-02',
          scheduledDate: '2026-06-02',
          estimatedMinutes: 20,
          priority: 'medium',
          status: 'done',
          minimumLine: 'save three links'
        }
      ]
    }
  ]
}

describe('v0.3 data models', () => {
  it('exposes target status and task type contracts without removing legacy DailyPlan', () => {
    const goalStatus: GoalStatus = 'active'
    const planStatus: PlanStatus = 'needs_adjustment'
    const stageStatus: StageStatus = 'planned'
    const taskType: TaskType = 'focus'
    const plans: DailyPlan[] = createLegacyDailyPlans()

    expect(goalStatus).toBe('active')
    expect(planStatus).toBe('needs_adjustment')
    expect(stageStatus).toBe('planned')
    expect(taskType).toBe('focus')
    expect(plans[0]?.tasks[0]?.date).toBe('2026-06-01')
  })

  it('normalizes Goal status while legacy goals remain readable', () => {
    const legacyGoal = normalizeGoal({
        id: 'goal-1',
        title: 'finish proposal',
        deadline: '2026-06-10',
        dailyAvailableMinutes: 45
      })

    expect(legacyGoal).toMatchObject({
      id: 'goal-1',
      status: 'active',
      updatedAt: '1970-01-01T00:00:00.000Z'
    })

    expect(
      normalizeGoal({
        id: 'goal-1',
        title: 'finish proposal',
        status: 'completed',
        deadline: '2026-06-10',
        dailyAvailableMinutes: 45
      })
    ).toMatchObject({
      status: 'completed'
    })
  })

  it('supports scheduledDate and maps legacy DailyPlan task dates through the adapter', () => {
    const legacyTask = normalizeTask({
      id: 'task-legacy',
      goalId: 'goal-1',
      title: 'legacy standalone task',
      date: '2026-06-04'
    })

    expect(legacyTask).toMatchObject({
      date: '2026-06-04',
      scheduledDate: '2026-06-04'
    })

    const normalizedTask = normalizeTask({
      id: 'task-new',
      goalId: 'goal-1',
      planId: 'plan-1',
      title: 'write intro',
      scheduledDate: '2026-06-03',
      estimatedMinutes: 25,
      priority: 'medium',
      type: 'focus',
      status: 'todo',
      minimumLine: 'write the first paragraph'
    })

    expect(normalizedTask).toMatchObject({
      planId: 'plan-1',
      date: '2026-06-03',
      scheduledDate: '2026-06-03',
      type: 'focus'
    })

    const bundle = dailyPlansToPlanBundle(createLegacyDailyPlans(), {
      planId: 'plan-legacy',
      deadline: '2026-06-10'
    })

    expect(bundle?.tasks[0]).toMatchObject({
      id: 'task-1',
      planId: 'plan-legacy',
      date: '2026-06-01',
      scheduledDate: '2026-06-01',
      status: 'partial',
      minimumLine: 'write three outline bullets',
      estimatedMinutes: 30,
      priority: 'high'
    })
  })

  it('supports target DailyReview taskResults and keeps legacy task id arrays readable', () => {
    const targetReview = normalizeDailyReview({
      id: 'review-1',
      date: '2026-06-01',
      goalId: 'goal-1',
      planId: 'plan-1',
      energy: 'low',
      taskResults: [
        {
          taskId: 'task-1',
          status: 'done'
        },
        {
          taskId: 'task-2',
          status: 'skipped'
        }
      ]
    })

    expect(targetReview).toMatchObject({
      planId: 'plan-1',
      taskResults: [
        { taskId: 'task-1', status: 'done' },
        { taskId: 'task-2', status: 'skipped' }
      ],
      completedTaskIds: ['task-1'],
      skippedTaskIds: ['task-2']
    })

    const legacyReview = normalizeDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      completedTaskIds: ['task-1'],
      partialTaskIds: ['task-1', 'task-2'],
      skippedTaskIds: ['task-2', 'task-3']
    })

    expect(legacyReview).toMatchObject({
      taskResults: [
        { taskId: 'task-1', status: 'done' },
        { taskId: 'task-2', status: 'partial' },
        { taskId: 'task-3', status: 'skipped' }
      ],
      completedTaskIds: ['task-1'],
      partialTaskIds: ['task-2'],
      skippedTaskIds: ['task-3']
    })

    const builtReview = buildDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      taskStatusById: {
        'task-1': 'done',
        'task-2': 'partial',
        'task-3': 'skipped'
      }
    })

    expect(builtReview.taskResults).toEqual([
      { taskId: 'task-1', status: 'done' },
      { taskId: 'task-2', status: 'partial' },
      { taskId: 'task-3', status: 'skipped' }
    ])
  })

  it('converts DailyPlan arrays to PlanBundle and back without losing task facts', () => {
    const bundle = dailyPlansToPlanBundle(createLegacyDailyPlans(), {
      planId: 'plan-legacy',
      status: 'active',
      deadline: '2026-06-10',
      dailyAvailableMinutes: 45,
      now: new Date('2026-05-26T00:00:00.000Z')
    })

    expect(bundle?.plan).toMatchObject({
      id: 'plan-legacy',
      goalId: 'goal-1',
      status: 'active',
      startDate: '2026-06-01',
      deadline: '2026-06-10',
      dailyAvailableMinutes: 45
    })
    expect(bundle?.stages).toEqual([])
    expect(bundle?.tasks).toHaveLength(2)

    const legacyPlans = planBundleToDailyPlans(bundle!)
    expect(legacyPlans.map((plan) => plan.date)).toEqual(['2026-06-01', '2026-06-02'])
    expect(legacyPlans[0]?.tasks[0]).toMatchObject({
      id: 'task-1',
      status: 'partial',
      minimumLine: 'write three outline bullets',
      estimatedMinutes: 30,
      priority: 'high',
      date: '2026-06-01',
      scheduledDate: '2026-06-01'
    })

    const views = buildDailyTaskViews(bundle!)
    const progress: PlanProgress = buildPlanProgress(bundle!)

    expect(views[0]).toMatchObject({
      date: '2026-06-01',
      planId: 'plan-legacy',
      totalEstimatedMinutes: 30
    })
    expect(progress).toMatchObject({
      planId: 'plan-legacy',
      completedTaskCount: 1,
      totalTaskCount: 2,
      progressPercent: 50,
      remainingEstimatedMinutes: 30
    })
  })
})
