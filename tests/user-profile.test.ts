import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildUserProfile, getUserPreferenceBoundary } from '../models/user-profile'
import { getUserProfile, saveUserProfile } from '../services/storage'

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

describe('user profile preferences', () => {
  it('builds and saves user preferences through the storage service', async () => {
    const profile = buildUserProfile(
      {
        mbti: ' infp ',
        workStyle: 'evening',
        energyLevel: 'low',
        preferredFocusMinutes: '45'
      },
      {
        now: new Date('2026-05-23T09:00:00.000Z')
      }
    )

    await saveUserProfile(profile)

    expect(uni.setStorageSync).toHaveBeenCalledWith('user-profile', profile)
    await expect(getUserProfile()).resolves.toEqual({
      id: 'local-user',
      mbti: 'INFP',
      workStyle: 'evening',
      energyLevel: 'low',
      preferredFocusMinutes: 45,
      ritualPreference: 'simple',
      updatedAt: '2026-05-23T09:00:00.000Z'
    })
  })

  it('saves ritual preference as an expression preference', async () => {
    const profile = buildUserProfile(
      {
        mbti: ' enfj ',
        workStyle: 'morning',
        energyLevel: 'high',
        preferredFocusMinutes: 60,
        ritualPreference: 'energetic'
      },
      {
        now: new Date('2026-05-23T09:00:00.000Z')
      }
    )

    await saveUserProfile(profile)

    await expect(getUserProfile()).resolves.toMatchObject({
      mbti: 'ENFJ',
      workStyle: 'morning',
      energyLevel: 'high',
      preferredFocusMinutes: 60,
      ritualPreference: 'energetic'
    })
  })

  it('uses normal energy as the default state', () => {
    const profile = buildUserProfile(
      {},
      {
        now: new Date('2026-05-23T09:00:00.000Z')
      }
    )

    expect(profile.energyLevel).toBe('normal')
    expect(profile.workStyle).toBe('flexible')
    expect(profile.preferredFocusMinutes).toBe(30)
    expect(profile.ritualPreference).toBe('simple')
  })

  it('keeps preferences limited to task expression and ordering', () => {
    const boundary = getUserPreferenceBoundary()

    expect(boundary.effects).toEqual(['expression', 'ordering'])
    expect(boundary.effects).not.toContain('capacity')
    expect(boundary.effects).not.toContain('deadline')
  })

  it('does not allow serious psychology, health or fate claims', () => {
    const boundary = getUserPreferenceBoundary()

    expect(boundary.forbiddenClaims).toEqual([
      'psychological_diagnosis',
      'health_prediction',
      'fate_prediction'
    ])
    expect(boundary.note.length).toBeGreaterThan(20)
  })

  it('keeps the profile page focused on goal, preferences, expression, progress and settings', () => {
    const source = readProjectFile('pages/profile/index.vue')

    expect(source).toContain('greeting-strip')
    expect(source).toContain('goal-card')
    expect(source).toContain('no-goal-card')
    expect(source).toContain('schedule-card')
    expect(source).toContain('expression-card')
    expect(source).toContain('recent-card')
    expect(source).toContain('settings-card')
    expect(source).toContain('settings-list')
    expect(source).toContain('goPlanCalendar')
    expect(source).toContain('goCreateGoal')
    expect(source).toContain('manageGoal')
    expect(source).toContain('ritualText')
    expect(source).toContain('mbtiText')
    expect(source).toContain('planIntensityText')
    expect(source).toContain('streakDaysText')
    expect(source).not.toContain("/pages/today/index")
    expect(source).not.toContain('TodayFocusCard')
    expect(source).not.toContain('TaskCard')
    expect(source).not.toContain('任务日历')
    expect(source).not.toContain('今日任务')
  })

  it('keeps the F28 profile reference layout order and static profile icons', () => {
    const source = readProjectFile('pages/profile/index.vue')
    const greetingIndex = source.indexOf('greeting-strip')
    const goalIndex = source.indexOf('goal-card')
    const scheduleIndex = source.indexOf('schedule-card')
    const expressionIndex = source.indexOf('expression-card')
    const recentIndex = source.indexOf('recent-card')
    const settingsIndex = source.indexOf('settings-card')

    expect(greetingIndex).toBeGreaterThan(-1)
    expect(greetingIndex).toBeLessThan(goalIndex)
    expect(goalIndex).toBeLessThan(scheduleIndex)
    expect(scheduleIndex).toBeLessThan(expressionIndex)
    expect(expressionIndex).toBeLessThan(recentIndex)
    expect(recentIndex).toBeLessThan(settingsIndex)
    expect(source).toContain('嗨，今天也要好好推进目标哦')
    expect(source).toContain('当前目标')
    expect(source).toContain('默认安排偏好')
    expect(source).toContain('AI 表达与仪式感偏好')
    expect(source).toContain('最近推进')
    expect(source).toContain('目标管理')
    expect(source).toContain('复盘记录')
    expect(source).toContain('偏好设置')
    expect(source).toContain('关于与反馈')
    expect(source).toContain('以上内容仅用于表达风格和仪式感，不作为科学预测依据。')

    for (const icon of [
      'grass.png',
      'goal.png',
      'goal-hero.png',
      'calendar.png',
      'suggestion.png',
      'clock.png',
      'sun.png',
      'bar-chart.png',
      'smile.png',
      'sparkle.png',
      'chat.png',
      'star.png',
      'tarot.png',
      'mbti.png',
      'progress-chart.png',
      'folder.png',
      'document.png',
      'setting.png'
    ]) {
      expect(source).toContain(`src="/static/icons/page/profile/${icon}"`)
    }

    expect(source).not.toContain('profileIconPaths')
    expect(source).not.toContain(':src="')
    expect(source).not.toContain('src="/static/icons/tab/')
  })
})
