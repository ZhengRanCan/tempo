import { describe, expect, it } from 'vitest'
import type { AiTodaySuggestion, DailyPlan, TarotDraw, UserProfile } from '../models'
import { buildTodaySuggestion } from '../services/today-suggestion'

const today = '2026-06-01'

function createPlans(): DailyPlan[] {
  return [
    {
      date: today,
      goalId: 'goal-1',
      dailyKeyword: 'steady',
      recommendedFocusWindow: '09:00-09:30',
      tasks: [
        {
          id: 'task-high',
          goalId: 'goal-1',
          title: 'draft core argument',
          date: today,
          estimatedMinutes: 30,
          priority: 'high',
          status: 'todo',
          minimumLine: 'write three bullets',
          caution: 'start small'
        },
        {
          id: 'task-low',
          goalId: 'goal-1',
          title: 'collect references',
          date: today,
          estimatedMinutes: 20,
          priority: 'low',
          status: 'todo',
          minimumLine: 'save three links'
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
          title: 'outline methods',
          date: '2026-06-02',
          estimatedMinutes: 30,
          priority: 'medium',
          status: 'todo',
          minimumLine: 'write two methods'
        }
      ]
    }
  ]
}

function createLowEnergyProfile(): UserProfile {
  return {
    id: 'local-user',
    energyLevel: 'low',
    workStyle: 'morning',
    preferredFocusMinutes: 25,
    ritualPreference: 'simple',
    updatedAt: '2026-05-24T00:00:00.000Z'
  }
}

function createAiSuggestion(): AiTodaySuggestion {
  return {
    taskOrder: ['task-low', 'task-high'],
    dailyKeyword: 'focus',
    focusTaskId: 'task-low',
    minimumLineByTaskId: {
      'task-low': 'save one useful link',
      'task-high': 'write the first paragraph'
    },
    cautionByTaskId: {
      'task-low': 'stop after the first useful source'
    },
    note: 'Keep the plan small.'
  }
}

function createTarotDraw(): TarotDraw {
  return {
    id: 'tarot:2026-06-01:0',
    date: today,
    cardName: 'Temperance',
    orientation: 'upright',
    actionPrompt: 'Start with the smallest concrete step.',
    createdAt: '2026-05-24T00:00:00.000Z'
  }
}

describe('today suggestion service', () => {
  it('builds deterministic suggestions from stored daily plans without AI', () => {
    const view = buildTodaySuggestion(createPlans(), {
      today
    })

    expect(view?.source).toBe('stored_plan')
    expect(view?.dailyKeyword).toBe('steady')
    expect(view?.focusTask.id).toBe('task-high')
    expect(view?.tasks.map((task) => task.id)).toEqual(['task-high', 'task-low'])
  })

  it('applies AI ordering and expression without mutating the source plan', () => {
    const plans = createPlans()
    const before = JSON.stringify(plans)
    const view = buildTodaySuggestion(plans, {
      today,
      userProfile: createLowEnergyProfile(),
      aiSuggestion: createAiSuggestion()
    })

    expect(view?.source).toBe('ai_suggestion')
    expect(view?.dailyKeyword).toBe('focus')
    expect(view?.focusTask.id).toBe('task-low')
    expect(view?.focusTask.minimumLine).toBe('save one useful link')
    expect(view?.tasks.map((task) => task.id)).toEqual(['task-low', 'task-high'])
    expect(view?.tasks[0]?.caution).toBe('stop after the first useful source')
    expect(view?.energyLevel).toBe('low')
    expect(view?.pressureNote).toContain('最低线')
    expect(JSON.stringify(plans)).toBe(before)
    expect(plans[0]?.tasks[0]?.status).toBe('todo')
  })

  it('uses optional tarot draw as expression context only', () => {
    const plans = createPlans()
    const before = JSON.stringify(plans)
    const view = buildTodaySuggestion(plans, {
      today,
      tarotDraw: createTarotDraw()
    })

    expect(view?.source).toBe('tarot_context')
    expect(view?.focusTask.id).toBe('task-high')
    expect(view?.tasks[0]?.caution).toBe('Start with the smallest concrete step.')
    expect(view?.tasks.map((task) => task.status)).toEqual(['todo', 'todo'])
    expect(JSON.stringify(plans)).toBe(before)
  })

  it('returns null when there is no daily plan for today', () => {
    const view = buildTodaySuggestion(createPlans(), {
      today: '2026-06-03',
      aiSuggestion: createAiSuggestion(),
      tarotDraw: createTarotDraw()
    })

    expect(view).toBeNull()
  })
})
