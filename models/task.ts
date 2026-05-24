import type { TaskPriority, TaskStatus } from './common'

export interface Task {
  id: string
  goalId: string
  title: string
  description?: string
  date: string
  estimatedMinutes: number
  priority: TaskPriority
  status: TaskStatus
  minimumLine: string
  focusSuggestion?: string
  caution?: string
}
