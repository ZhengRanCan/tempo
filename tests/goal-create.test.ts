import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildGoal } from '../models/goal'
import { getGoal, saveGoal } from '../services/storage'

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
      createdAt: '2026-05-21T08:00:00.000Z',
      updatedAt: '2026-05-21T08:00:00.000Z'
    })
  })
})
