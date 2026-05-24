import type { DailyPlan } from '../models/plan'
import type { Task } from '../models/task'
import type { UserProfile } from '../models/user-profile'

export interface TodaySuggestionView {
  date: string
  source: 'stored_plan'
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
  const tasks = (activeTasks.length > 0 ? activeTasks : todayPlan.tasks).slice(0, 4).map(cloneTask)
  const focusTask = cloneTask([...tasks].sort(compareTaskPriority)[0])
  const energyLevel = options.userProfile?.energyLevel ?? 'normal'

  return {
    date: todayPlan.date,
    source: 'stored_plan',
    dailyKeyword: todayPlan.dailyKeyword ?? '推进',
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

function cloneTask(task: Task): Task {
  return {
    ...task
  }
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
