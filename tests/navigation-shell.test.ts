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
  globalStyle?: {
    navigationBarBackgroundColor?: string
    backgroundColor?: string
  }
  tabBar?: {
    backgroundColor?: string
    list?: Array<{
      pagePath: string
      text: string
    }>
  }
}

interface ProjectConfig {
  miniprogramRoot?: string
}

interface PackageJson {
  scripts?: Record<string, string>
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readPagesJson(): PagesJson {
  return JSON.parse(readFileSync(resolve(rootDir, 'pages.json'), 'utf8')) as PagesJson
}

function readProjectConfig(): ProjectConfig {
  return JSON.parse(readFileSync(resolve(rootDir, 'project.config.json'), 'utf8')) as ProjectConfig
}

function readPackageJson(): PackageJson {
  return JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8')) as PackageJson
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

  it('aligns native chrome colors with the F24 page style baseline', () => {
    const pagesJson = readPagesJson()

    expect(pagesJson.globalStyle?.navigationBarBackgroundColor).toBe('#faf8f3')
    expect(pagesJson.globalStyle?.backgroundColor).toBe('#faf8f3')
    expect(pagesJson.tabBar?.backgroundColor).toBe('#ffffff')
  })

  it('keeps all tab pages registered and backed by page files', () => {
    const pagesJson = readPagesJson()
    const pagePaths = new Set(pagesJson.pages.map((page) => page.path))

    for (const tab of pagesJson.tabBar?.list ?? []) {
      expect(pagePaths.has(tab.pagePath)).toBe(true)
      expect(existsSync(resolve(rootDir, `${tab.pagePath}.vue`))).toBe(true)
    }
  })

  it('registers calendar date detail as a native non-tab subpage', () => {
    const pagesJson = readPagesJson()
    const pagePaths = new Set(pagesJson.pages.map((page) => page.path))
    const tabPaths = new Set((pagesJson.tabBar?.list ?? []).map((tab) => tab.pagePath))

    expect(pagePaths.has('pages/plan-calendar/detail')).toBe(true)
    expect(tabPaths.has('pages/plan-calendar/detail')).toBe(false)
    expect(existsSync(resolve(rootDir, 'pages/plan-calendar/detail.vue'))).toBe(true)
  })

  it('points WeChat DevTools at the same mp-weixin output used by local dev', () => {
    const projectConfig = readProjectConfig()
    const packageJson = readPackageJson()

    expect(projectConfig.miniprogramRoot).toBe('dist/dev/mp-weixin/')
    expect(packageJson.scripts?.['dev:mp-weixin']).toBe('node scripts/uni-run.mjs -p mp-weixin')
  })

  it('uses the shared page header without duplicating bottom tab navigation work', () => {
    const header = readProjectFile('components/AppPageHeader.vue')
    const today = readProjectFile('pages/today/index.vue')
    const calendar = readProjectFile('pages/plan-calendar/index.vue')
    const createGoal = readProjectFile('pages/goal-create/index.vue')
    const profile = readProjectFile('pages/profile/index.vue')
    const review = readProjectFile('pages/review/index.vue')

    expect(header).toContain('defineProps')
    expect(header).toContain('title')
    expect(header).toContain('hint')
    expect(header).not.toContain('eyebrow')
    expect(today).toContain('AppPageHeader')
    expect(calendar).toContain('AppPageHeader')
    expect(createGoal).toContain('AppPageHeader')
    expect(profile).toContain('AppPageHeader')
    expect(review).toContain('AppPageHeader')
    expect(header).not.toContain('switchTab')
    expect(header).not.toContain('navigateTo')
  })

  it('keeps workflow switchTab calls without restoring peer tab hub buttons', () => {
    const today = readProjectFile('pages/today/index.vue')
    const calendar = readProjectFile('pages/plan-calendar/index.vue')
    const createGoal = readProjectFile('pages/goal-create/index.vue')
    const profile = readProjectFile('pages/profile/index.vue')
    const review = readProjectFile('pages/review/index.vue')

    expect(today).toContain("uni.switchTab({\n    url: '/pages/goal-create/index'")
    expect(today).toContain("uni.switchTab({\n    url: '/pages/plan-calendar/index'")
    expect(createGoal).toContain("uni.switchTab({\n      url: '/pages/plan-calendar/index'")
    expect(review).toContain("uni.switchTab({\n    url: '/pages/goal-create/index'")
    expect(calendar).not.toContain("url: '/pages/today/index'")
    expect(profile).not.toContain("url: '/pages/today/index'")
    expect(profile).toContain("uni.switchTab({\n    url: '/pages/plan-calendar/index'")
  })
})
