export interface AiClientResult<T> {
  ok: boolean
  data?: T
  error?: string
}

export async function requestAiPlan<T>(): Promise<AiClientResult<T>> {
  return {
    ok: false,
    error: 'AI plan generation is not configured.'
  }
}
