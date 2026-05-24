import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildUserProfile, getUserPreferenceBoundary } from '../models/user-profile'
import { getUserProfile, saveUserProfile } from '../services/storage'

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
    expect(boundary.note).toContain('不用于心理判断')
  })
})
