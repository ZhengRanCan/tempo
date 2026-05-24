import type { AiTodaySuggestion } from '../models/ai-suggestion'

export type AiSuggestionValidationResult =
  | {
      ok: true
      data: AiTodaySuggestion
    }
  | {
      ok: false
      errors: string[]
    }

const FORBIDDEN_CLAIMS = ['命运', '预测', '诊断', '健康判断', '心理判断']

export function validateAiTodaySuggestion(
  value: unknown,
  options: {
    allowedTaskIds: string[]
  }
): AiSuggestionValidationResult {
  const errors: string[] = []

  if (!isRecord(value)) {
    return {
      ok: false,
      errors: ['suggestion must be an object']
    }
  }

  const allowedTaskIds = new Set(options.allowedTaskIds)
  const taskOrder = readStringArray(value.taskOrder)
  const unknownTaskIds = taskOrder.filter((taskId) => !allowedTaskIds.has(taskId))
  const duplicateTaskIds = taskOrder.filter((taskId, index) => taskOrder.indexOf(taskId) !== index)
  const dailyKeyword = readString(value.dailyKeyword)
  const focusTaskId = readString(value.focusTaskId)
  const minimumLineByTaskId = readStringRecord(value.minimumLineByTaskId)
  const cautionByTaskId = readStringRecord(value.cautionByTaskId)
  const note = readString(value.note)

  if (taskOrder.length === 0) {
    errors.push('taskOrder must include at least one task id')
  }

  if (unknownTaskIds.length > 0) {
    errors.push('taskOrder contains unknown task ids')
  }

  if (duplicateTaskIds.length > 0) {
    errors.push('taskOrder contains duplicate task ids')
  }

  if (!dailyKeyword) {
    errors.push('dailyKeyword is required')
  }

  if (focusTaskId && !allowedTaskIds.has(focusTaskId)) {
    errors.push('focusTaskId must reference an existing task')
  }

  for (const taskId of taskOrder) {
    if (!minimumLineByTaskId[taskId]) {
      errors.push('minimumLineByTaskId must cover every ordered task')
      break
    }
  }

  const allText = [
    dailyKeyword,
    focusTaskId,
    note,
    ...Object.values(minimumLineByTaskId),
    ...Object.values(cautionByTaskId)
  ].filter((text): text is string => !!text)

  if (allText.some((text) => containsForbiddenClaim(text))) {
    errors.push('suggestion contains forbidden prediction or diagnosis wording')
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors
    }
  }

  return {
    ok: true,
    data: {
      taskOrder,
      dailyKeyword: dailyKeyword ?? '',
      focusTaskId,
      minimumLineByTaskId,
      cautionByTaskId,
      note
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(readString).filter((item): item is string => !!item)
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string>>((result, [key, item]) => {
    const text = readString(item)

    if (text) {
      result[key] = text
    }

    return result
  }, {})
}

function containsForbiddenClaim(text: string): boolean {
  return FORBIDDEN_CLAIMS.some((claim) => text.includes(claim))
}
