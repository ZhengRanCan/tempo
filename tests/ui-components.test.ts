import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readProjectFile(path: string): string {
  return readFileSync(resolve(rootDir, path), 'utf8')
}

describe('core UI components', () => {
  it('TaskCard shows task essentials without high-pressure unfinished styling', () => {
    const source = readProjectFile('components/TaskCard.vue')

    expect(source).toContain('task.title')
    expect(source).toContain('task.estimatedMinutes')
    expect(source).toContain('priorityLabels')
    expect(source).toContain('getTaskStatusLabel')
    expect(source).toContain('../services/plan-view')
    expect(source).toContain('task.minimumLine')
    expect(source).toContain('status-todo')
    expect(source).toContain('slot name="action"')
    expect(source).not.toContain('#C75C54')
    expect(source).not.toContain('danger')
  })

  it('AppPageHeader keeps body chrome to hint and optional action only', () => {
    const source = readProjectFile('components/AppPageHeader.vue')

    expect(source).toContain('title')
    expect(source).toContain('hint')
    expect(source).toContain('slot name="action"')
    expect(source).not.toContain('class="title"')
    expect(source).not.toContain('eyebrow')
    expect(source).not.toContain('switchTab')
    expect(source).not.toContain('navigateTo')
  })

  it('TodayFocusCard exposes one focus task, minimum line and focus window', () => {
    const source = readProjectFile('components/TodayFocusCard.vue')

    expect(source).toContain('今日重点任务')
    expect(source).toContain('当前最值得推进的一步')
    expect(source).toContain('goalTitle')
    expect(source).toContain('task.title')
    expect(source).toContain('task.minimumLine')
    expect(source).toContain('recommendedFocusWindow')
    expect(source).toContain('priorityLabels')
    expect(source).toContain('taskCount')
    expect(source).toContain('extraTaskPreview')
    expect(source).toContain("今日共 {{ taskCount }} 个任务")
    expect(source).toContain('/static/icons/page/today/star.png')
    expect(source).toContain('/static/icons/page/today/clock.png')
    expect(source).toContain('/static/icons/page/today/flag.png')
    expect(source).toContain('/static/icons/page/today/list.png')
    expect(source).not.toContain('todayIconPaths')
    expect(source).not.toContain(':src="')
    expect(source).toContain('开始专注')
    expect(source).toContain('标记完成')
    expect(source).toContain('task.caution')
  })

  it('EmptyState always pairs soft copy with an optional next action', () => {
    const source = readProjectFile('components/EmptyState.vue')

    expect(source).toContain('title')
    expect(source).toContain('copy')
    expect(source).toContain('actionLabel')
    expect(source).toContain("$emit('action')")
  })

  it('EnergySelector supports low, normal and high without negative low-energy wording', () => {
    const source = readProjectFile('components/EnergySelector.vue')

    expect(source).toContain("value: 'low'")
    expect(source).toContain("value: 'normal'")
    expect(source).toContain("value: 'high'")
    expect(source).toContain('低能量')
    expect(source).not.toContain('失败')
    expect(source).not.toContain('状态差')
  })

  it('main pages use the shared components for the v0.3 shell baseline', () => {
    const today = readProjectFile('pages/today/index.vue')
    const calendar = readProjectFile('pages/plan-calendar/index.vue')
    const calendarDetail = readProjectFile('pages/plan-calendar/detail.vue')
    const goalCreate = readProjectFile('pages/goal-create/index.vue')
    const review = readProjectFile('pages/review/index.vue')
    const profile = readProjectFile('pages/profile/index.vue')

    for (const page of [today, calendar, goalCreate, review, profile]) {
      expect(page).toContain('AppPageHeader')
    }

    expect(today).toContain('TodayFocusCard')
    expect(today).toContain('TaskCard')
    expect(today).toContain('EmptyState')
    expect(calendar).toContain('EmptyState')
    expect(calendarDetail).toContain('EmptyState')
    expect(calendarDetail).toContain('class="detail-task"')
    expect(goalCreate).toContain('EnergySelector')
    expect(review).toContain('EnergySelector')
    expect(review).toContain('EmptyState')
    expect(profile).toContain('EmptyState')
  })

  it('tab pages do not copy component shell styles back into page scopes', () => {
    const pages = [
      readProjectFile('pages/today/index.vue'),
      readProjectFile('pages/plan-calendar/index.vue'),
      readProjectFile('pages/goal-create/index.vue'),
      readProjectFile('pages/profile/index.vue'),
      readProjectFile('pages/review/index.vue')
    ]

    for (const page of pages) {
      expect(page).not.toContain('.header')
      expect(page).not.toContain('.eyebrow')
      expect(page).not.toContain('.empty-state')
      expect(page).not.toContain('.energy-options')
      expect(page).not.toContain('.energy-option')
    }

    expect(pages[0]).not.toContain('.task-card')
    expect(pages[1]).not.toContain('.task-card')
  })

  it('tab pages keep native navigation from being duplicated by body title spacing', () => {
    const pages = [
      readProjectFile('pages/today/index.vue'),
      readProjectFile('pages/plan-calendar/index.vue'),
      readProjectFile('pages/goal-create/index.vue'),
      readProjectFile('pages/profile/index.vue'),
      readProjectFile('pages/review/index.vue')
    ]

    for (const page of pages) {
      expect(page.includes('@include ui.page-shell;') || page.includes('padding: 32rpx 32rpx 48rpx;')).toBe(true)
      expect(page).not.toContain('padding: 96rpx 32rpx 48rpx;')
    }
  })

  it('F24 main tab pages and shared components use the unified style baseline', () => {
    const baseline = readProjectFile('styles/ui.scss')
    const app = readProjectFile('App.vue')
    const mainTabPages = [
      readProjectFile('pages/today/index.vue'),
      readProjectFile('pages/plan-calendar/index.vue'),
      readProjectFile('pages/goal-create/index.vue'),
      readProjectFile('pages/profile/index.vue')
    ]
    const sharedComponents = [
      readProjectFile('components/AppPageHeader.vue'),
      readProjectFile('components/TaskCard.vue'),
      readProjectFile('components/TodayFocusCard.vue'),
      readProjectFile('components/EmptyState.vue'),
      readProjectFile('components/EnergySelector.vue')
    ]

    expect(baseline).toContain('$canvas: #faf8f3;')
    expect(baseline).toContain('@mixin page-shell')
    expect(baseline).toContain('@mixin card')
    expect(baseline).toContain('@mixin primary-button')
    expect(baseline).toContain('@mixin secondary-button')
    expect(baseline).toContain('@mixin text-button')
    expect(baseline).toContain('@mixin status-tag')
    expect(app).toContain('@use "./styles/ui" as ui;')
    expect(app).not.toContain('#f8f4ec')
    expect(app).not.toContain('#28312f')

    for (const page of mainTabPages) {
      expect(page).toContain('@use "../../styles/ui" as ui;')
      expect(page).toContain('@include ui.page-shell;')
      expect(page).toContain('@include ui.card')
      expect(page).not.toContain('border-radius: 36rpx')
      expect(page).not.toContain('background: #f8f4ec')
    }

    for (const component of sharedComponents) {
      expect(component).toContain('@use "../styles/ui" as ui;')
    }
  })

  it('main pages read v0.3 PlanBundle view services instead of assembling raw storage', () => {
    const today = readProjectFile('pages/today/index.vue')
    const calendar = readProjectFile('pages/plan-calendar/index.vue')
    const goalCreate = readProjectFile('pages/goal-create/index.vue')
    const review = readProjectFile('pages/review/index.vue')
    const profile = readProjectFile('pages/profile/index.vue')

    expect(goalCreate).toContain('buildStarterPlanBundle')
    expect(goalCreate).toContain('savePlanBundle')
    expect(goalCreate).toContain('buildLegacyDailyPlansFromBundle')
    expect(today).toContain('buildTodaySuggestionFromPlanBundle')
    expect(today).toContain('migrateLegacyDailyPlans')
    expect(calendar).toContain('buildPlanBundleCalendarView')
    expect(calendar).toContain('../../services/plan-view')
    expect(calendar).not.toContain('stage-panel')
    expect(review).toContain('replanPlanBundleAfterReview')
    expect(review).toContain('savePlanBundle')
    expect(review).toContain('buildDailyReview')
    expect(review).not.toContain('review.taskResults =')
    expect(profile).toContain('buildPlanProgress')
    expect(profile).toContain('../../services/plan-view')
    expect(profile).toContain('migrateLegacyDailyPlans')
  })
})
