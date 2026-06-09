import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoal } from '../models/goal'
import { buildUserProfile } from '../models/user-profile'
import { buildLegacyDailyPlansFromBundle, buildStarterPlanBundle } from '../services/planner'
import {
  getActivePlanBundle,
  getDailyPlans,
  getGoal,
  getUserProfile,
  saveDailyPlans,
  saveGoal,
  savePlanBundle,
  saveUserProfile
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

describe('goal create', () => {
  it('blocks empty title with a clear validation message', () => {
    const result = buildGoal({
      title: '',
      deadline: '2026-06-01',
      dailyAvailableMinutes: '60'
    })

    expect(result.ok).toBe(false)

    if (result.ok) {
      throw new Error('Expected title validation to fail.')
    }

    expect(result.errors).toContainEqual({
      field: 'title',
      message: '先写一个具体目标名称。'
    })
  })

  it('blocks empty deadline with a clear validation message', () => {
    const result = buildGoal({
      title: '完成开题报告初稿',
      deadline: '',
      dailyAvailableMinutes: '60'
    })

    expect(result.ok).toBe(false)

    if (result.ok) {
      throw new Error('Expected deadline validation to fail.')
    }

    expect(result.errors).toContainEqual({
      field: 'deadline',
      message: '请选择截止日期。'
    })
  })

  it('blocks deadline earlier than today with a clear validation message', () => {
    const result = buildGoal(
      {
        title: '完成开题报告初稿',
        deadline: '2026-05-20',
        dailyAvailableMinutes: '60'
      },
      {
        now: new Date('2026-05-21T08:00:00.000Z')
      }
    )

    expect(result.ok).toBe(false)

    if (result.ok) {
      throw new Error('Expected past deadline validation to fail.')
    }

    expect(result.errors).toContainEqual({
      field: 'deadline',
      message: '截止日期不能早于今天，请重新选择一个日期。'
    })
  })

  it('allows deadline on today', () => {
    const result = buildGoal(
      {
        title: '完成开题报告初稿',
        deadline: '2026-05-21',
        dailyAvailableMinutes: '60'
      },
      {
        now: new Date('2026-05-21T08:00:00.000Z')
      }
    )

    expect(result.ok).toBe(true)
  })

  it('blocks invalid daily available minutes with a clear validation message', () => {
    const result = buildGoal({
      title: '完成开题报告初稿',
      deadline: '2026-06-01',
      dailyAvailableMinutes: '0'
    })

    expect(result.ok).toBe(false)

    if (result.ok) {
      throw new Error('Expected daily time validation to fail.')
    }

    expect(result.errors).toContainEqual({
      field: 'dailyAvailableMinutes',
      message: '请选择或填写每天可用时间。'
    })
  })

  it('builds a valid goal and saves it through the storage service', async () => {
    const result = buildGoal(
      {
        title: ' 完成开题报告初稿 ',
        deadline: '2026-06-01',
        dailyAvailableMinutes: '60',
        description: ' 写出第一版结构 '
      },
      {
        id: 'goal-test',
        now: new Date('2026-05-21T08:00:00.000Z')
      }
    )

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error('Expected goal creation to succeed.')
    }

    await saveGoal(result.goal)

    expect(uni.setStorageSync).toHaveBeenCalledWith('goal:goal-test', result.goal)
    await expect(getGoal('goal-test')).resolves.toEqual({
      id: 'goal-test',
      title: '完成开题报告初稿',
      deadline: '2026-06-01',
      dailyAvailableMinutes: 60,
      description: '写出第一版结构',
      status: 'active',
      createdAt: '2026-05-21T08:00:00.000Z',
      updatedAt: '2026-05-21T08:00:00.000Z'
    })
  })

  it('persists the generated Goal, UserProfile, PlanBundle and legacy daily view path', async () => {
    const goalResult = buildGoal(
      {
        title: 'finish proposal',
        deadline: '2026-06-10',
        dailyAvailableMinutes: '60',
        description: 'first version'
      },
      {
        id: 'goal-plan',
        now: new Date('2026-06-01T08:00:00.000Z'),
        today: '2026-06-01'
      }
    )

    expect(goalResult.ok).toBe(true)

    if (!goalResult.ok) {
      throw new Error('Expected goal creation to succeed.')
    }

    const profile = buildUserProfile(
      {
        workStyle: 'morning',
        energyLevel: 'low',
        preferredFocusMinutes: '45',
        ritualPreference: 'warm'
      },
      {
        now: new Date('2026-06-01T08:00:00.000Z')
      }
    )
    const planResult = buildStarterPlanBundle({
      goal: goalResult.goal,
      startDate: '2026-06-01',
      userProfile: profile
    })

    expect(planResult.status).toBe('ok')

    if (planResult.status !== 'ok') {
      throw new Error(planResult.reason)
    }

    await saveGoal(goalResult.goal)
    await saveUserProfile(profile)
    await savePlanBundle(planResult.bundle)
    await saveDailyPlans(
      goalResult.goal.id,
      buildLegacyDailyPlansFromBundle(planResult.bundle, profile)
    )

    await expect(getGoal(goalResult.goal.id)).resolves.toMatchObject({
      id: 'goal-plan',
      title: 'finish proposal'
    })
    await expect(getUserProfile()).resolves.toMatchObject({
      workStyle: 'morning',
      energyLevel: 'low',
      ritualPreference: 'warm'
    })
    await expect(getActivePlanBundle(goalResult.goal.id)).resolves.toMatchObject({
      plan: {
        goalId: 'goal-plan',
        status: 'active'
      }
    })
    await expect(getDailyPlans(goalResult.goal.id)).resolves.not.toHaveLength(0)
  })

  it('keeps the create page as step cards that trigger plan generation without task views', () => {
    const source = readProjectFile('pages/goal-create/index.vue')

    expect(source).toContain('create-hero')
    expect(source).toContain('step-card')
    expect(source).toContain('core-step')
    expect(source).toContain('preference-step')
    expect(source).toContain('isPreferenceOpen')
    expect(source).toContain('ritualOptions')
    expect(source).toContain('ritualPreference')
    expect(source).toContain('EnergySelector')
    expect(source).toContain('buildStarterPlanBundle')
    expect(source).toContain('savePlanBundle')
    expect(source).toContain('buildLegacyDailyPlansFromBundle')
    expect(source).not.toContain('TaskCard')
    expect(source).not.toContain('TodayFocusCard')
    expect(source).not.toContain('buildPlanBundleCalendarView')
    expect(source).not.toContain("/pages/today/index")
  })

  it('keeps the F27 reference-image-first create flow and runtime-safe CSS marks', () => {
    const source = readProjectFile('pages/goal-create/index.vue')
    const heroIndex = source.indexOf('先设定一个目标')
    const titleStepIndex = source.indexOf('你想完成什么？')
    const deadlineStepIndex = source.indexOf('什么时候完成？')
    const timeStepIndex = source.indexOf('每天大概能投入多久？')
    const noteIndex = source.indexOf('补充说明')
    const preferenceIndex = source.indexOf('个性化安排偏好')
    const submitIndex = source.indexOf('生成计划')

    expect(heroIndex).toBeGreaterThan(-1)
    expect(heroIndex).toBeLessThan(titleStepIndex)
    expect(titleStepIndex).toBeLessThan(deadlineStepIndex)
    expect(deadlineStepIndex).toBeLessThan(timeStepIndex)
    expect(timeStepIndex).toBeLessThan(noteIndex)
    expect(noteIndex).toBeLessThan(preferenceIndex)
    expect(preferenceIndex).toBeLessThan(submitIndex)
    expect(source).toContain('const timeOptions = [15, 30, 45, 60]')
    expect(source).toContain("dailyAvailableMinutes: '30'")
    expect(source).toContain('自定义分钟数')
    expect(source).not.toContain('90 分钟')

    for (const marker of [
      'hero-mark',
      'field-mark-calendar',
      'heading-mark-clock',
      'field-mark-edit',
      'section-mark-note',
      'section-mark-preference',
      'safe-mark'
    ]) {
      expect(source).toContain(marker)
    }

    expect(source).not.toContain('<image')
    expect(source).not.toContain('createIconPaths')
    expect(source).not.toContain('src="/static/icons/page/create/')
    expect(source).not.toContain('url("/static/icons/page/create/')
    expect(source).not.toContain('background-image: url(')
    expect(source).not.toContain('create-icon')
    expect(source).not.toContain(':src="')
    expect(source).not.toContain('mode="aspectFit"')
    expect(source).toContain('塔罗、MBTI、每日关键词只影响提醒文案，不作为任务安排依据。')
    expect(source).toContain('生成后可随时调整')
  })
})
