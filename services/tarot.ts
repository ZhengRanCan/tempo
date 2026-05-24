import type { TarotDraw } from '../models/tarot'
import { buildTarotDraw, containsForbiddenTarotClaim } from '../models/tarot'

export function createDeterministicTarotDraw(options: {
  date: string
  seed: string
}): TarotDraw {
  const cards = ['节制', '星币二', '权杖三']
  const index = Math.abs(hashSeed(`${options.date}:${options.seed}`)) % cards.length
  const cardName = cards[index] ?? '节制'

  return (
    buildTarotDraw(
      {
        date: options.date,
        cardName,
        orientation: index % 2 === 0 ? 'upright' : 'reversed',
        actionPrompt: getActionPrompt(cardName)
      },
      {
        id: `tarot:${options.date}:${index}`
      }
    ) ?? {
      id: `tarot:${options.date}:fallback`,
      date: options.date,
      cardName: '节制',
      orientation: 'upright',
      actionPrompt: '先完成最小可执行的一步。',
      createdAt: new Date(0).toISOString()
    }
  )
}

export function getTarotActionPrompt(draw: TarotDraw): string {
  if (containsForbiddenTarotClaim(draw.actionPrompt)) {
    return '先完成最小可执行的一步。'
  }

  return draw.actionPrompt
}

function getActionPrompt(cardName: string): string {
  const prompts: Record<string, string> = {
    节制: '先把任务缩到可开始的一小步。',
    星币二: '先处理最能稳定推进的部分。',
    权杖三: '先确认下一段可交付内容。'
  }

  return prompts[cardName] ?? '先完成最小可执行的一步。'
}

function hashSeed(seed: string): number {
  return [...seed].reduce((hash, char) => hash + char.charCodeAt(0), 0)
}
