import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildDailyReview } from '../models/review'
import { getDailyReviews, saveDailyReview } from '../services/storage'

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

describe('daily review', () => {
  it('records completed, partial and unfinished task ids', () => {
    const review = buildDailyReview(
      {
        date: '2026-06-01',
        goalId: 'goal-1',
        energy: 'normal',
        taskStatusById: {
          'task-1': 'done',
          'task-2': 'partial',
          'task-3': 'skipped'
        }
      },
      {
        now: new Date('2026-06-01T21:00:00.000Z')
      }
    )

    expect(review.completedTaskIds).toEqual(['task-1'])
    expect(review.partialTaskIds).toEqual(['task-2'])
    expect(review.skippedTaskIds).toEqual(['task-3'])
  })

  it('records the selected energy state', () => {
    const review = buildDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      energy: 'low',
      taskStatusById: {}
    })

    expect(review.energy).toBe('low')
  })

  it('saves an optional note when it is present', () => {
    const review = buildDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      energy: 'high',
      taskStatusById: {},
      note: ' 今天先完成了资料整理 '
    })

    expect(review.note).toBe('今天先完成了资料整理')
  })

  it('can save structured review data when the note is empty', async () => {
    const review = buildDailyReview(
      {
        date: '2026-06-01',
        goalId: 'goal-1',
        energy: 'normal',
        taskStatusById: {
          'task-1': 'done'
        },
        note: '   '
      },
      {
        now: new Date('2026-06-01T21:00:00.000Z')
      }
    )

    expect(review.note).toBeUndefined()

    await saveDailyReview(review)

    expect(uni.setStorageSync).toHaveBeenCalledWith('daily-reviews:goal-1', [review])
    await expect(getDailyReviews('goal-1')).resolves.toEqual([
      {
        id: 'goal-1:2026-06-01',
        date: '2026-06-01',
        goalId: 'goal-1',
        energy: 'normal',
        completedTaskIds: ['task-1'],
        partialTaskIds: [],
        skippedTaskIds: [],
        createdAt: '2026-06-01T21:00:00.000Z'
      }
    ])
  })

  it('replaces a review with the same id instead of duplicating it', async () => {
    const firstReview = buildDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      energy: 'normal',
      taskStatusById: {
        'task-1': 'partial'
      }
    })
    const nextReview = buildDailyReview({
      date: '2026-06-01',
      goalId: 'goal-1',
      energy: 'high',
      taskStatusById: {
        'task-1': 'done'
      }
    })

    await saveDailyReview(firstReview)
    await saveDailyReview(nextReview)

    await expect(getDailyReviews('goal-1')).resolves.toEqual([nextReview])
  })
})
