import type { AiTodaySuggestion } from '../models/ai-suggestion'
import type { DailyPlan, PlanBundle } from '../models/plan'
import type { TarotDraw } from '../models/tarot'
import type { Task } from '../models/task'
import type { UserProfile } from '../models/user-profile'
import { buildDailyTaskViews, type DailyTaskView } from './plan-view'
import { getTarotActionPrompt } from './tarot'

export interface TodaySuggestionView {
  date: string
  source: 'stored_plan' | 'ai_suggestion' | 'tarot_context'
  dailyKeyword: string
  recommendedFocusWindow: string
  focusTask: Task
  tasks: Task[]
  energyLevel: UserProfile['energyLevel']
  pressureNote: string
}

export interface BuildTodaySuggestionOptions {
  today: string
  userProfile?: UserProfile | null
  aiSuggestion?: AiTodaySuggestion | null
  tarotDraw?: TarotDraw | null
}

export function buildTodaySuggestion(
  plans: DailyPlan[],
  options: BuildTodaySuggestionOptions
): TodaySuggestionView | null {
  const todayPlan = plans.find((plan) => plan.date === options.today)

  if (!todayPlan || todayPlan.tasks.length === 0) {
    return null
  }

  const activeTasks = todayPlan.tasks.filter((task) => task.status !== 'done')
  const baseTasks = (activeTasks.length > 0 ? activeTasks : todayPlan.tasks).slice(0, 4)
  const tasks = applySuggestion(baseTasks, options.aiSuggestion, options.tarotDraw)
  const focusTask = selectFocusTask(tasks, options.aiSuggestion)
  const energyLevel = options.userProfile?.energyLevel ?? 'normal'
  const source = options.aiSuggestion
    ? 'ai_suggestion'
    : options.tarotDraw
      ? 'tarot_context'
      : 'stored_plan'

  return {
    date: todayPlan.date,
    source,
    dailyKeyword: options.aiSuggestion?.dailyKeyword ?? todayPlan.dailyKeyword ?? '推进',
    recommendedFocusWindow:
      todayPlan.recommendedFocusWindow ?? getFallbackFocusWindow(options.userProfile),
    focusTask,
    tasks,
    energyLevel,
    pressureNote:
      energyLevel === 'low'
        ? '今天先保留一点推进感，完成最低线就算往前走了一步。'
        : '先完成最重要的一小步，再决定是否继续加量。'
  }
}

export function buildTodaySuggestionFromPlanBundle(
  bundle: PlanBundle,
  options: BuildTodaySuggestionOptions
): TodaySuggestionView | null {
  return buildTodaySuggestionFromDailyTaskViews(buildDailyTaskViews(bundle), options)
}

export function buildTodaySuggestionFromDailyTaskViews(
  dailyTaskViews: DailyTaskView[],
  options: BuildTodaySuggestionOptions
): TodaySuggestionView | null {
  return buildTodaySuggestion(
    dailyTaskViews.map((view) => ({
      date: view.date,
      goalId: view.goalId,
      tasks: view.tasks.map(cloneTask)
    })),
    options
  )
}

function applySuggestion(
  tasks: Task[],
  aiSuggestion?: AiTodaySuggestion | null,
  tarotDraw?: TarotDraw | null
): Task[] {
  const clonedTasks = tasks.map(cloneTask)
  const orderedTasks = aiSuggestion ? orderTasks(clonedTasks, aiSuggestion.taskOrder) : clonedTasks

  return orderedTasks.map((task, index) => {
    const minimumLine = aiSuggestion?.minimumLineByTaskId[task.id] ?? task.minimumLine
    const aiCaution = aiSuggestion?.cautionByTaskId?.[task.id]
    const tarotPrompt = tarotDraw && index === 0 ? getTarotActionPrompt(tarotDraw) : undefined

    return {
      ...task,
      minimumLine,
      caution: aiCaution ?? tarotPrompt ?? task.caution
    }
  })
}

function orderTasks(tasks: Task[], taskOrder: string[]): Task[] {
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const orderedTasks = taskOrder
    .map((taskId) => taskById.get(taskId))
    .filter((task): task is Task => !!task)
  const orderedIds = new Set(orderedTasks.map((task) => task.id))
  const restTasks = tasks.filter((task) => !orderedIds.has(task.id))

  return [...orderedTasks, ...restTasks].slice(0, 4)
}

function cloneTask(task: Task): Task {
  return {
    ...task
  }
}

function selectFocusTask(tasks: Task[], aiSuggestion?: AiTodaySuggestion | null): Task {
  const suggestedFocusTask = tasks.find((task) => task.id === aiSuggestion?.focusTaskId)
  const priorityFocusTask = [...tasks].sort(compareTaskPriority)[0]

  return cloneTask(suggestedFocusTask ?? priorityFocusTask ?? tasks[0]!)
}

function compareTaskPriority(left: Task, right: Task): number {
  const priorityScore = {
    high: 0,
    medium: 1,
    low: 2
  }

  return priorityScore[left.priority] - priorityScore[right.priority]
}

function getFallbackFocusWindow(userProfile?: UserProfile | null): string {
  const workStyle = userProfile?.workStyle ?? 'flexible'
  const windows: Record<UserProfile['workStyle'], string> = {
    morning: '上午安排最重要的一步',
    afternoon: '下午选择一段稳定时间推进',
    evening: '晚上用安静时间完成一个小块',
    flexible: '选择今天最稳定的一段时间'
  }

  return windows[workStyle]
}
