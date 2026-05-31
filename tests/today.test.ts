import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DailyPlan, UserProfile } from '../models'
import { buildTodayView } from '../services/plan-view'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readProjectFile(path: string): string {
  return readFileSync(resolve(rootDir, path), 'utf8')
}

function createPlans(): DailyPlan[] {
  return [
    {
      date: '2026-06-01',
      goalId: 'goal-1',
      dailyKeyword: '启动',
      recommendedFocusWindow: '上午安排最重要的一步',
      tasks: [
        {
          id: 'task-low',
          goalId: 'goal-1',
          title: '整理参考资料',
          date: '2026-06-01',
          scheduledDate: '2026-06-01',
          estimatedMinutes: 20,
          priority: 'low',
          status: 'todo',
          minimumLine: '找出 3 份可以参考的资料。'
        },
        {
          id: 'task-high',
          goalId: 'goal-1',
          title: '写出开题报告研究问题草稿',
          date: '2026-06-01',
          scheduledDate: '2026-06-01',
          estimatedMinutes: 30,
          priority: 'high',
          status: 'todo',
          minimumLine: '写出 3 个候选研究问题。'
        }
      ]
    },
    {
      date: '2026-06-02',
      goalId: 'goal-1',
      tasks: [
        {
          id: 'task-tomorrow',
          goalId: 'goal-1',
          title: '整理研究方法',
          date: '2026-06-02',
          scheduledDate: '2026-06-02',
          estimatedMinutes: 30,
          priority: 'medium',
          status: 'todo',
          minimumLine: '列出 2 个可选研究方法。'
        }
      ]
    }
  ]
}

function createLowEnergyProfile(): UserProfile {
  return {
    id: 'local-user',
    energyLevel: 'low',
    workStyle: 'evening',
    preferredFocusMinutes: 30,
    ritualPreference: 'simple',
    updatedAt: '2026-05-23T00:00:00.000Z'
  }
}

describe('today view', () => {
  it('shows the most important task for today', () => {
    const view = buildTodayView(createPlans(), {
      today: '2026-06-01'
    })

    expect(view?.focusTask.id).toBe('task-high')
    expect(view?.focusTask.title).toBe('写出开题报告研究问题草稿')
  })

  it('shows the minimum completion line for the focus task', () => {
    const view = buildTodayView(createPlans(), {
      today: '2026-06-01'
    })

    expect(view?.focusTask.minimumLine).toBe('写出 3 个候选研究问题。')
  })

  it('shows the recommended focus window from the daily plan', () => {
    const view = buildTodayView(createPlans(), {
      today: '2026-06-01'
    })

    expect(view?.recommendedFocusWindow).toBe('上午安排最重要的一步')
  })

  it('falls back to work-style focus window when the daily plan has no recommendation', () => {
    const plans = createPlans().map((plan) => ({
      ...plan,
      recommendedFocusWindow: undefined
    }))

    const view = buildTodayView(plans, {
      today: '2026-06-01',
      userProfile: createLowEnergyProfile()
    })

    expect(view?.recommendedFocusWindow).toBe('晚上用安静时间完成一个小块')
  })

  it('reduces pressure for low energy users by emphasizing the minimum line', () => {
    const view = buildTodayView(createPlans(), {
      today: '2026-06-01',
      userProfile: createLowEnergyProfile()
    })

    expect(view?.energyLevel).toBe('low')
    expect(view?.pressureNote).toContain('完成最低线')
  })

  it('returns no today view when today has no task plan', () => {
    const view = buildTodayView(createPlans(), {
      today: '2026-06-03'
    })

    expect(view).toBeNull()
  })

  it('keeps the today page focused on one execution task before status, advice and review', () => {
    const source = readProjectFile('pages/today/index.vue')
    const focusIndex = source.indexOf('<TodayFocusCard')
    const multipleTasksIndex = source.indexOf('class="today-entry"')
    const statusIndex = source.indexOf('class="status-card"')
    const adviceIndex = source.indexOf('class="advice-card"')
    const reviewIndex = source.indexOf('class="review-entry"')

    expect(focusIndex).toBeGreaterThan(-1)
    expect(multipleTasksIndex).toBeGreaterThan(focusIndex)
    expect(statusIndex).toBeGreaterThan(multipleTasksIndex)
    expect(adviceIndex).toBeGreaterThan(statusIndex)
    expect(reviewIndex).toBeGreaterThan(adviceIndex)
    expect(source).toContain('今日共 {{ taskCount }} 个任务')
    expect(source).toContain("{{ showAllTasks ? '收起' : '查看全部' }}")
    expect(source).toContain('v-if="showAllTasks"')
  })

  it('reads through TodaySuggestion and PlanBundle services without taking calendar duties', () => {
    const source = readProjectFile('pages/today/index.vue')

    expect(source).toContain('buildTodaySuggestionFromPlanBundle')
    expect(source).toContain('type TodaySuggestionView')
    expect(source).toContain('migrateLegacyDailyPlans')
    expect(source).toContain('suggestionTips.slice(0, 3)')
    expect(source).toContain('/pages/review/index')
    expect(source).not.toContain('buildPlanBundleCalendarView')
    expect(source).not.toContain('PlanBundleCalendarView')
    expect(source).not.toContain('/pages/plan-calendar/index')
  })
})
