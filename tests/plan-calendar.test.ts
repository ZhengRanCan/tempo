import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DailyPlan, Goal, PlanBundle } from '../models'
import { buildPlanBundleCalendarView, buildPlanCalendarDays, getTaskStatusLabel } from '../models/plan'
import {
  getCurrentGoal,
  getDailyPlans,
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

function createGoal(): Goal {
  return {
    id: 'goal-1',
    title: '完成开题报告初稿',
    deadline: '2026-06-10',
    dailyAvailableMinutes: 60,
    status: 'active',
    createdAt: '2026-05-23T00:00:00.000Z',
    updatedAt: '2026-05-23T00:00:00.000Z'
  }
}

function createPlans(): DailyPlan[] {
  return [
    {
      date: '2026-06-02',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'task-2',
          goalId: 'goal-1',
          title: '整理已有材料：完成开题报告初稿',
          date: '2026-06-02',
          scheduledDate: '2026-06-02',
          estimatedMinutes: 30,
          priority: 'medium',
          status: 'partial',
          minimumLine: '列出 3 条已有信息或待补材料。'
        }
      ]
    },
    {
      date: '2026-06-01',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'task-1',
          goalId: 'goal-1',
          title: '明确目标范围：完成开题报告初稿',
          date: '2026-06-01',
          scheduledDate: '2026-06-01',
          estimatedMinutes: 30,
          priority: 'high',
          status: 'todo',
          minimumLine: '写下今天最先推进的 1 个小步骤。'
        },
        {
          id: 'task-1b',
          goalId: 'goal-1',
          title: '检查任务入口',
          date: '2026-06-01',
          scheduledDate: '2026-06-01',
          estimatedMinutes: 15,
          priority: 'low',
          status: 'done',
          minimumLine: '确认入口能打开。'
        }
      ]
    }
  ]
}

function createPlanBundle(): PlanBundle {
  return {
    plan: {
      id: 'plan-1',
      goalId: 'goal-1',
      status: 'active',
      startDate: '2026-06-01',
      deadline: '2026-06-21',
      dailyAvailableMinutes: 60,
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z'
    },
    stages: [
      {
        id: 'stage-1',
        goalId: 'goal-1',
        planId: 'plan-1',
        title: 'later research stage',
        startDate: '2026-06-08',
        endDate: '2026-06-21',
        status: 'planned',
        order: 1,
        createdAt: '2026-05-23T00:00:00.000Z',
        updatedAt: '2026-05-23T00:00:00.000Z'
      }
    ],
    tasks: createPlans().flatMap((plan) =>
      plan.tasks.map((task) => ({
        ...task,
        planId: 'plan-1',
        scheduledDate: plan.date
      }))
    )
  }
}

describe('plan calendar', () => {
  it('loads the current goal and its stored daily plans through storage', async () => {
    const goal = createGoal()
    const plans = createPlans()

    await saveGoal(goal)
    await saveDailyPlans(goal.id, plans)

    await expect(getCurrentGoal()).resolves.toEqual(goal)
    await expect(getDailyPlans(goal.id)).resolves.toEqual(plans)
  })

  it('builds date-grouped visible calendar days sorted from today', () => {
    const days = buildPlanCalendarDays(createPlans(), {
      today: '2026-06-01',
      limit: 7
    })

    expect(days).toHaveLength(2)
    expect(days[0]?.date).toBe('2026-06-01')
    expect(days[0]?.isToday).toBe(true)
    expect(days[0]?.taskCount).toBe(2)
    expect(days[0]?.totalMinutes).toBe(45)
    expect(days[1]?.date).toBe('2026-06-02')
  })

  it('distinguishes task status with clear labels', () => {
    expect(getTaskStatusLabel('todo')).toBe('未开始')
    expect(getTaskStatusLabel('done')).toBe('已完成')
    expect(getTaskStatusLabel('partial')).toBe('部分完成')
    expect(getTaskStatusLabel('skipped')).toBe('已跳过')

    const days = buildPlanCalendarDays(createPlans(), {
      today: '2026-06-01'
    })

    expect(days[0]?.tasks.map((task) => task.statusLabel)).toEqual(['未开始', '已完成'])
    expect(days[1]?.tasks[0]?.statusLabel).toBe('部分完成')
  })

  it('returns an empty view when there is no plan data', () => {
    const days = buildPlanCalendarDays([], {
      today: '2026-06-01'
    })

    expect(days).toEqual([])
  })

  it('summarizes PlanBundle calendar data with near tasks, far stages, progress, and plan status', () => {
    const view = buildPlanBundleCalendarView(createPlanBundle(), {
      today: '2026-06-01',
      limit: 7
    })

    expect(view.plan.status).toBe('active')
    expect(view.days.map((day) => day.date)).toEqual(['2026-06-01', '2026-06-02'])
    expect(view.days[0]?.tasks.map((task) => task.id)).toEqual(['task-1', 'task-1b'])
    expect(view.stages.map((stage) => stage.id)).toEqual(['stage-1'])
    expect(view.progress).toMatchObject({
      planId: 'plan-1',
      completedTaskCount: 1,
      totalTaskCount: 3,
      progressPercent: 33
    })
  })
})
