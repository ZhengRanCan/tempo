import type { AiTodaySuggestion, DailyPlan, Task, UserProfile } from '../models'
import { validateAiTodaySuggestion } from '../schemas/ai-suggestion'

export interface AiClientResult<T> {
  ok: boolean
  data?: T
  error?: string
}

export interface RequestTodaySuggestionInput {
  plans: DailyPlan[]
  today: string
  userProfile?: UserProfile | null
  rawSuggestion?: unknown
}

export interface RequestTodayTaskSuggestionInput {
  today: string
  todayTasks: Task[]
  userProfile?: UserProfile | null
  rawSuggestion?: unknown
  dailyKeyword?: string
}

export async function requestAiPlan<T>(): Promise<AiClientResult<T>> {
  return {
    ok: false,
    error: 'AI plan generation is not configured.'
  }
}

export async function requestTodaySuggestion(
  input: RequestTodaySuggestionInput
): Promise<AiClientResult<AiTodaySuggestion>> {
  const todayPlan = input.plans.find((plan) => plan.date === input.today)

  if (!todayPlan) {
    return {
      ok: false,
      error: 'No today plan is available for AI suggestion fallback.'
    }
  }

  return requestTodayTaskSuggestion({
    today: input.today,
    todayTasks: todayPlan.tasks,
    userProfile: input.userProfile,
    rawSuggestion: input.rawSuggestion,
    dailyKeyword: todayPlan.dailyKeyword
  })
}

export async function requestTodayTaskSuggestion(
  input: RequestTodayTaskSuggestionInput
): Promise<AiClientResult<AiTodaySuggestion>> {
  const taskIds = input.todayTasks.map((task) => task.id)

  if (taskIds.length === 0) {
    return {
      ok: false,
      error: 'No today task context is available for AI suggestion fallback.'
    }
  }

  const todayPlan = {
    tasks: input.todayTasks,
    dailyKeyword: input.dailyKeyword
  }

  if (input.rawSuggestion !== undefined) {
    const validation = validateAiTodaySuggestion(input.rawSuggestion, {
      allowedTaskIds: taskIds
    })

    if (validation.ok) {
      return {
        ok: true,
        data: validation.data
      }
    }
  }

  const orderedTasks = [...todayPlan.tasks].sort((left, right) => {
    const priorityScore = {
      high: 0,
      medium: 1,
      low: 2
    }

    return priorityScore[left.priority] - priorityScore[right.priority]
  })

  return {
    ok: true,
    data: {
      taskOrder: orderedTasks.map((task) => task.id),
      dailyKeyword: todayPlan.dailyKeyword ?? '推进',
      focusTaskId: orderedTasks[0]?.id,
      minimumLineByTaskId: Object.fromEntries(
        todayPlan.tasks.map((task) => [task.id, task.minimumLine])
      ),
      cautionByTaskId: Object.fromEntries(
        todayPlan.tasks
          .filter((task) => !!task.caution)
          .map((task) => [task.id, task.caution as string])
      ),
      note:
        input.userProfile?.energyLevel === 'low'
          ? '先保留最低完成线，不增加任务压力。'
          : '先推进最重要的一小步。'
    }
  }
}
