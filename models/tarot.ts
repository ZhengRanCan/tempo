export type TarotOrientation = 'upright' | 'reversed'

export interface TarotDraw {
  id: string
  date: string
  cardName: string
  orientation: TarotOrientation
  actionPrompt: string
  createdAt: string
}

export interface BuildTarotDrawInput {
  date: string
  cardName: string
  orientation: TarotOrientation
  actionPrompt: string
}

const FORBIDDEN_TAROT_CLAIMS = ['命运', '预测', '诊断', '健康判断', '心理判断']

export function buildTarotDraw(
  input: BuildTarotDrawInput,
  options: {
    id?: string
    now?: Date
  } = {}
): TarotDraw | null {
  const cardName = input.cardName.trim()
  const actionPrompt = input.actionPrompt.trim()

  if (!cardName || !actionPrompt || containsForbiddenTarotClaim(actionPrompt)) {
    return null
  }

  const now = options.now ?? new Date()

  return {
    id: options.id ?? `tarot:${input.date}:${cardName}:${input.orientation}`,
    date: input.date,
    cardName,
    orientation: input.orientation,
    actionPrompt,
    createdAt: now.toISOString()
  }
}

export function containsForbiddenTarotClaim(text: string): boolean {
  return FORBIDDEN_TAROT_CLAIMS.some((claim) => text.includes(claim))
}

export function getTarotBoundary(): {
  allowedEffects: Array<'expression' | 'ordering_hint'>
  forbiddenClaims: string[]
} {
  return {
    allowedEffects: ['expression', 'ordering_hint'],
    forbiddenClaims: ['fate_prediction', 'psychological_diagnosis', 'health_judgment']
  }
}
