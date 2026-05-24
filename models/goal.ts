export interface Goal {
  id: string
  title: string
  description?: string
  deadline: string
  dailyAvailableMinutes: number
  createdAt: string
  updatedAt: string
}

export interface CreateGoalInput {
  title: string
  deadline: string
  dailyAvailableMinutes: string | number
  description?: string
}

export type GoalValidationField = 'title' | 'deadline' | 'dailyAvailableMinutes'

export interface GoalValidationError {
  field: GoalValidationField
  message: string
}

export type BuildGoalResult =
  | {
      ok: true
      goal: Goal
    }
  | {
      ok: false
      errors: GoalValidationError[]
    }

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function validateGoalInput(
  input: CreateGoalInput,
  options: {
    today?: string
    now?: Date
  } = {}
): GoalValidationError[] {
  const errors: GoalValidationError[] = []
  const title = input.title.trim()
  const deadline = input.deadline.trim()
  const dailyAvailableMinutes = parseDailyAvailableMinutes(input.dailyAvailableMinutes)
  const today = options.today ?? formatGoalDate(options.now ?? new Date())

  if (!title) {
    errors.push({
      field: 'title',
      message: '先写一个具体目标名称。'
    })
  }

  if (!deadline) {
    errors.push({
      field: 'deadline',
      message: '请选择截止日期。'
    })
  } else if (!ISO_DATE_PATTERN.test(deadline)) {
    errors.push({
      field: 'deadline',
      message: '截止日期需要使用 YYYY-MM-DD。'
    })
  } else if (deadline < today) {
    errors.push({
      field: 'deadline',
      message: '截止日期不能早于今天，请重新选择一个日期。'
    })
  }

  if (dailyAvailableMinutes === null) {
    errors.push({
      field: 'dailyAvailableMinutes',
      message: '请选择或填写每天可用时间。'
    })
  }

  return errors
}

export function buildGoal(
  input: CreateGoalInput,
  options: {
    id?: string
    now?: Date
    today?: string
  } = {}
): BuildGoalResult {
  const now = options.now ?? new Date()
  const errors = validateGoalInput(input, {
    today: options.today,
    now
  })

  if (errors.length > 0) {
    return {
      ok: false,
      errors
    }
  }

  const timestamp = now.toISOString()
  const id = options.id ?? `goal-${now.getTime()}`
  const description = input.description?.trim()

  return {
    ok: true,
    goal: {
      id,
      title: input.title.trim(),
      description: description || undefined,
      deadline: input.deadline.trim(),
      dailyAvailableMinutes: parseDailyAvailableMinutes(input.dailyAvailableMinutes) ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  }
}

export function formatGoalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDailyAvailableMinutes(value: string | number): number | null {
  const minutes = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return null
  }

  return Math.floor(minutes)
}
