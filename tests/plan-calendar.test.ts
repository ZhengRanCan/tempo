import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DailyPlan, Goal, PlanBundle } from '../models'
import { buildCalendarWeekDays } from '../pages/plan-calendar/calendar-helpers'
import {
  buildPlanBundleCalendarView,
  buildPlanCalendarDays,
  getPlanStatusLabel,
  getTaskStatusLabel
} from '../services/plan-view'
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
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readProjectFile(path: string): string {
  return readFileSync(resolve(rootDir, path), 'utf8')
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

function createLongPlanBundle(): PlanBundle {
  return {
    plan: {
      id: 'plan-long',
      goalId: 'goal-1',
      status: 'active',
      startDate: '2026-06-01',
      deadline: '2026-06-30',
      dailyAvailableMinutes: 45,
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z'
    },
    stages: [
      {
        id: 'stage-far',
        goalId: 'goal-1',
        planId: 'plan-long',
        title: 'far stage only',
        startDate: '2026-06-08',
        endDate: '2026-06-30',
        status: 'planned',
        order: 1,
        createdAt: '2026-05-23T00:00:00.000Z',
        updatedAt: '2026-05-23T00:00:00.000Z'
      }
    ],
    tasks: Array.from({ length: 9 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      const scheduledDate = `2026-06-${day}`

      return {
        id: `task-${day}`,
        goalId: 'goal-1',
        planId: 'plan-long',
        title: `task ${day}`,
        date: scheduledDate,
        scheduledDate,
        estimatedMinutes: 30,
        priority: 'medium' as const,
        status: 'todo' as const,
        minimumLine: `finish task ${day}`
      }
    })
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
    expect(getPlanStatusLabel('active')).toBe('进行中')
    expect(getPlanStatusLabel('needs_adjustment')).toBe('需要调整')

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

  it('expands the calendar board to a continuous 7 day overview including empty days', () => {
    const sourceDays = buildPlanCalendarDays(createPlans(), {
      today: '2026-06-01',
      limit: 7
    })
    const weekDays = buildCalendarWeekDays(sourceDays, {
      today: '2026-06-01',
      limit: 7
    })

    expect(weekDays).toHaveLength(7)
    expect(weekDays.map((day) => day.date)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
      '2026-06-07'
    ])
    expect(weekDays[0]?.taskCount).toBe(2)
    expect(weekDays[1]?.taskCount).toBe(1)
    expect(weekDays[2]).toMatchObject({
      taskCount: 0,
      totalMinutes: 0,
      statusSummary: '缓冲日',
      tasks: []
    })
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
    expect(view.timePressure).toMatchObject({
      level: 'steady',
      remainingDays: 21,
      dailyAvailableMinutes: 60,
      requiredDailyMinutes: 3,
      remainingEstimatedMinutes: 60
    })
    expect(view.planAdvice).toHaveLength(3)
    expect(view.planAdvice.every((tip) => tip.length <= 28)).toBe(true)
  })

  it('keeps the calendar board to near 7 day tasks and far stage summaries', () => {
    const view = buildPlanBundleCalendarView(createLongPlanBundle(), {
      today: '2026-06-01',
      limit: 7
    })

    expect(view.days).toHaveLength(7)
    expect(view.days.map((day) => day.date)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
      '2026-06-07'
    ])
    expect(view.days.flatMap((day) => day.tasks).some((task) => task.id === 'task-09')).toBe(false)
    expect(view.stages.map((stage) => stage.id)).toEqual(['stage-far'])
  })

  it('marks a plan as tight when remaining work exceeds daily capacity', () => {
    const bundle = createPlanBundle()
    const view = buildPlanBundleCalendarView(
      {
        ...bundle,
        plan: {
          ...bundle.plan,
          deadline: '2026-06-01',
          dailyAvailableMinutes: 10
        }
      },
      {
        today: '2026-06-01',
        limit: 7
      }
    )

    expect(view.timePressure).toMatchObject({
      level: 'tight',
      label: '节奏偏紧',
      remainingDays: 1,
      requiredDailyMinutes: 60
    })
  })

  it('keeps the overview page as a goal plan board and opens native date detail page', () => {
    const source = readProjectFile('pages/plan-calendar/index.vue')
    const detail = readProjectFile('pages/plan-calendar/detail.vue')
    const pagesJson = readProjectFile('pages.json')
    const goalIndex = source.indexOf('class="goal-plan-card"')
    const progressIndex = source.indexOf('class="progress-card"')
    const weekIndex = source.indexOf('class="week-board"')
    const selectedDayIndex = source.indexOf('class="selected-day-card"')
    const adjustIndex = source.indexOf('class="adjust-card"')

    expect(goalIndex).toBeGreaterThan(-1)
    expect(progressIndex).toBeGreaterThan(goalIndex)
    expect(weekIndex).toBeGreaterThan(progressIndex)
    expect(selectedDayIndex).toBeGreaterThan(weekIndex)
    expect(adjustIndex).toBeGreaterThan(selectedDayIndex)
    expect(source).toContain('buildPlanBundleCalendarView')
    expect(source).toContain('migrateLegacyDailyPlans')
    expect(source).toContain('weekDays')
    expect(source).toContain('buildCalendarWeekDays')
    expect(source).toContain('todayDayId')
    expect(source).toContain('getDayId(day.date)')
    expect(source).toContain('scroll-view')
    expect(source).toContain('scroll-x')
    expect(source).toContain(':scroll-into-view="todayDayId"')
    expect(source).toContain('openDateDetail(day.date)')
    expect(source).toContain('/pages/plan-calendar/detail?date=')
    expect(source).toContain('selectedTasks')
    expect(source).toContain('getDayTone')
    expect(source).toContain('getDayStateLabel')
    expect(source).toContain('未来 7 天计划概览')
    expect(source).toContain('调整计划')
    expect(source).not.toContain('远期阶段')
    expect(source).not.toContain('stage-panel')
    expect(source).not.toContain('getStageStatusLabel')
    expect(source).not.toContain('v-for="stage in stages"')
    expect(source).not.toContain('isDateDetailMode')
    expect(source).not.toContain('返回概览')
    expect(source).not.toContain('.weekday-label,\n.date-label,\n.day-state')
    expect(detail).toContain('onLoad')
    expect(detail).toContain('setNavigationBarTitle')
    expect(detail).toContain('class="date-detail-card"')
    expect(detail).toContain('class="task-list-panel"')
    expect(detail).toContain('任务列表')
    expect(pagesJson).toContain('"path": "pages/plan-calendar/detail"')
    expect(source).not.toContain('getDailyPlans')
    expect(source).not.toContain('buildTodaySuggestion')
  })

  it('uses final calendar page icons as static mini-program image resources', () => {
    const source = readProjectFile('pages/plan-calendar/index.vue')
    const detail = readProjectFile('pages/plan-calendar/detail.vue')
    const combinedSource = `${source}\n${detail}`
    const compactTaskMarkup = source.slice(
      source.indexOf('class="compact-task-list"'),
      source.indexOf('<text\n          v-else', source.indexOf('class="compact-task-list"'))
    )
    const detailTaskMarkup = detail.slice(
      detail.indexOf('class="task-list"'),
      detail.indexOf('class="task-actions"', detail.indexOf('class="task-list"'))
    )

    expect(combinedSource).toContain('/static/icons/page/calendar/target.png')
    expect(combinedSource).toContain('/static/icons/page/calendar/calendar.png')
    expect(combinedSource).toContain('/static/icons/page/calendar/week.png')
    expect(combinedSource).toContain('/static/icons/page/calendar/adjust.png')
    expect(combinedSource).toContain('/static/icons/page/calendar/sparkle.png')
    expect(combinedSource).toContain('/static/icons/page/calendar/clock.png')
    expect(combinedSource).toContain('/static/icons/page/calendar/priority.png')
    expect(combinedSource).not.toContain('calendarIconPaths')
    expect(combinedSource).not.toContain(':src="')
    expect(combinedSource).toContain('getTaskTitle(task)')
    expect(combinedSource).toContain('getTaskMinimumLine(task)')
    expect(combinedSource).toContain('getTaskMinutes(task)')
    expect(combinedSource).toContain('getTaskPriorityLabel(task)')
    expect(compactTaskMarkup).toContain('class="meta-dot"')
    expect(detailTaskMarkup).toContain('class="meta-dot"')
    expect(compactTaskMarkup).not.toContain('<image')
    expect(detailTaskMarkup).not.toContain('<image')
  })
})
