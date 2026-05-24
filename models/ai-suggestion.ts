export interface AiTodaySuggestion {
  taskOrder: string[]
  dailyKeyword: string
  focusTaskId?: string
  minimumLineByTaskId: Record<string, string>
  cautionByTaskId?: Record<string, string>
  note?: string
}

export interface AiSuggestionBoundary {
  allowedEffects: Array<'expression' | 'ordering'>
  forbiddenMutations: string[]
  forbiddenClaims: string[]
}

export function getAiSuggestionBoundary(): AiSuggestionBoundary {
  return {
    allowedEffects: ['expression', 'ordering'],
    forbiddenMutations: ['Task.status', 'DailyReview', 'DailyPlan.history'],
    forbiddenClaims: ['fate_prediction', 'psychological_diagnosis', 'health_judgment']
  }
}
