import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface PagesJson {
  pages: Array<{
    path: string
    style?: {
      navigationBarTitleText?: string
    }
  }>
  tabBar?: {
    list?: Array<{
      pagePath: string
      text: string
    }>
  }
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readPagesJson(): PagesJson {
  return JSON.parse(readFileSync(resolve(rootDir, 'pages.json'), 'utf8')) as PagesJson
}

function readProjectFile(path: string): string {
  return readFileSync(resolve(rootDir, path), 'utf8')
}

describe('navigation shell', () => {
  it('uses today as the first mini-program entry and first bottom tab', () => {
    const pagesJson = readPagesJson()

    expect(pagesJson.pages[0]?.path).toBe('pages/today/index')
    expect(pagesJson.tabBar?.list?.[0]).toEqual({
      pagePath: 'pages/today/index',
      text: '今日'
    })
  })

  it('provides the four required bottom tab entries in order', () => {
    const pagesJson = readPagesJson()

    expect(pagesJson.tabBar?.list).toEqual([
      {
        pagePath: 'pages/today/index',
        text: '今日'
      },
      {
        pagePath: 'pages/plan-calendar/index',
        text: '日历'
      },
      {
        pagePath: 'pages/goal-create/index',
        text: '创建'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ])
  })

  it('keeps all tab pages registered and backed by page files', () => {
    const pagesJson = readPagesJson()
    const pagePaths = new Set(pagesJson.pages.map((page) => page.path))

    for (const tab of pagesJson.tabBar?.list ?? []) {
      expect(pagePaths.has(tab.pagePath)).toBe(true)
      expect(existsSync(resolve(rootDir, `${tab.pagePath}.vue`))).toBe(true)
    }
  })

  it('uses the shared page header without duplicating bottom tab navigation work', () => {
    const header = readProjectFile('components/AppPageHeader.vue')
    const today = readProjectFile('pages/today/index.vue')
    const calendar = readProjectFile('pages/plan-calendar/index.vue')
    const profile = readProjectFile('pages/profile/index.vue')

    expect(header).toContain('defineProps')
    expect(header).toContain('eyebrow')
    expect(header).toContain('title')
    expect(today).toContain('AppPageHeader')
    expect(calendar).toContain('AppPageHeader')
    expect(profile).toContain('AppPageHeader')
    expect(header).not.toContain('switchTab')
    expect(header).not.toContain('navigateTo')
  })

  it('uses switchTab for primary routes that are now tab pages', () => {
    const today = readProjectFile('pages/today/index.vue')
    const calendar = readProjectFile('pages/plan-calendar/index.vue')
    const createGoal = readProjectFile('pages/goal-create/index.vue')
    const review = readProjectFile('pages/review/index.vue')

    expect(today).toContain("uni.switchTab({\n    url: '/pages/goal-create/index'")
    expect(today).toContain("uni.switchTab({\n    url: '/pages/plan-calendar/index'")
    expect(calendar).toContain("uni.switchTab({\n    url: '/pages/today/index'")
    expect(createGoal).toContain("uni.switchTab({\n      url: '/pages/plan-calendar/index'")
    expect(review).toContain("uni.switchTab({\n    url: '/pages/goal-create/index'")
  })
})
