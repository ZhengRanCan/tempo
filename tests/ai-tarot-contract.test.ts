import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { DailyPlan, UserProfile } from '../models'
import { getAiSuggestionBoundary } from '../models/ai-suggestion'
import { buildTarotDraw, getTarotBoundary } from '../models/tarot'
import { validateAiTodaySuggestion } from '../schemas/ai-suggestion'
import { requestTodaySuggestion } from '../services/ai-client'
import { createDeterministicTarotDraw, getTarotActionPrompt } from '../services/tarot'

const today = '2026-06-01'

function createPlans(): DailyPlan[] {
  return [
    {
      date: today,
      goalId: 'goal-1',
      dailyKeyword: 'steady',
      tasks: [
        {
          id: 'task-low',
          goalId: 'goal-1',
          title: 'collect references',
          date: today,
          estimatedMinutes: 20,
          priority: 'low',
          status: 'todo',
          minimumLine: 'save three links'
        },
        {
          id: 'task-high',
          goalId: 'goal-1',
          title: 'draft core argument',
          date: today,
          estimatedMinutes: 30,
          priority: 'high',
          status: 'todo',
          minimumLine: 'write three bullets',
          caution: 'start with the smallest paragraph'
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

describe('AI and tarot contracts', () => {
  it('keeps tarot draws limited to draw result, orientation, and action prompt', () => {
    const draw = buildTarotDraw(
      {
        date: today,
        cardName: 'Temperance',
        orientation: 'upright',
        actionPrompt: 'Start with the smallest concrete step.'
      },
      {
        now: new Date('2026-05-24T00:00:00.000Z')
      }
    )

    expect(draw).toEqual({
      id: 'tarot:2026-06-01:Temperance:upright',
      date: today,
      cardName: 'Temperance',
      orientation: 'upright',
      actionPrompt: 'Start with the smallest concrete step.',
      createdAt: '2026-05-24T00:00:00.000Z'
    })
    expect(Object.keys(draw ?? {})).not.toContain('interpretation')
    expect(Object.keys(draw ?? {})).not.toContain('prediction')
  })

  it('rejects tarot wording that makes fate, diagnosis, or health claims', () => {
    const draw = buildTarotDraw({
      date: today,
      cardName: 'Tower',
      orientation: 'reversed',
      actionPrompt: `Do a ${'\u547d\u8fd0'}${'\u9884\u6d4b'} before work.`
    })

    expect(draw).toBeNull()
    expect(getTarotBoundary().forbiddenClaims).toEqual([
      'fate_prediction',
      'psychological_diagnosis',
      'health_judgment'
    ])
  })

  it('creates deterministic tarot fallback without unsafe claims', () => {
    const first = createDeterministicTarotDraw({
      date: today,
      seed: 'goal-1'
    })
    const second = createDeterministicTarotDraw({
      date: today,
      seed: 'goal-1'
    })

    expect(first).toEqual(second)
    expect(getTarotActionPrompt(first)).toBe(first.actionPrompt)
    expect(first.actionPrompt).not.toContain('\u9884\u6d4b')
  })

  it('validates structured AI today suggestion JSON', () => {
    const result = validateAiTodaySuggestion(
      {
        taskOrder: ['task-high', 'task-low'],
        dailyKeyword: 'focus',
        focusTaskId: 'task-high',
        minimumLineByTaskId: {
          'task-high': 'write the first paragraph',
          'task-low': 'save one useful link'
        },
        cautionByTaskId: {
          'task-high': 'avoid expanding the scope'
        },
        note: 'Keep the plan small.'
      },
      {
        allowedTaskIds: ['task-low', 'task-high']
      }
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.taskOrder).toEqual(['task-high', 'task-low'])
      expect(result.data.minimumLineByTaskId['task-low']).toBe('save one useful link')
    }
  })

  it('rejects invalid AI suggestion order, minimum lines, and unsafe wording', () => {
    const result = validateAiTodaySuggestion(
      {
        taskOrder: ['task-high', 'task-high', 'task-missing'],
        dailyKeyword: `daily ${'\u5fc3\u7406\u5224\u65ad'}`,
        minimumLineByTaskId: {
          'task-high': 'write the first paragraph'
        }
      },
      {
        allowedTaskIds: ['task-low', 'task-high']
      }
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('taskOrder contains unknown task ids')
      expect(result.errors).toContain('taskOrder contains duplicate task ids')
      expect(result.errors).toContain('minimumLineByTaskId must cover every ordered task')
      expect(result.errors).toContain('suggestion contains forbidden prediction or diagnosis wording')
    }
  })

  it('exposes a typed deterministic AI fallback without frontend secrets', async () => {
    const result = await requestTodaySuggestion({
      plans: createPlans(),
      today,
      userProfile: createLowEnergyProfile()
    })

    expect(result.ok).toBe(true)
    expect(result.data?.taskOrder).toEqual(['task-high', 'task-low'])
    expect(result.data?.focusTaskId).toBe('task-high')
    expect(result.data?.minimumLineByTaskId['task-low']).toBe('save three links')
    expect(getAiSuggestionBoundary().forbiddenMutations).toEqual([
      'Task.status',
      'DailyReview',
      'DailyPlan.history'
    ])
  })

  it('keeps ai-client free of frontend API keys and real network calls', () => {
    const source = readFileSync('services/ai-client.ts', 'utf8')

    expect(source).not.toMatch(/apiKey|appSecret|sk-/i)
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('uni.request')
    expect(source).not.toContain('wx.request')
  })
})
