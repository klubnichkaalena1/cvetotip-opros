import { questions } from '../data/questions'
import { seasonOrder } from '../data/seasons'
import type { SeasonId, SeasonScores } from '../types'

const emptyScores = (): SeasonScores => ({
  spring: 0,
  summer: 0,
  autumn: 0,
  winter: 0,
})

export function calculateSeason(
  answers: Record<string, string>,
): SeasonId {
  const total = emptyScores()

  for (const question of questions) {
    const optionId = answers[question.id]
    if (!optionId) continue
    const option = question.options.find((o) => o.id === optionId)
    if (!option) continue
    for (const season of seasonOrder) {
      total[season] += option.scores[season]
    }
  }

  let best: SeasonId = 'spring'
  let bestScore = -1

  for (const season of seasonOrder) {
    if (total[season] > bestScore) {
      bestScore = total[season]
      best = season
    }
  }

  const tied = seasonOrder.filter((s) => total[s] === bestScore)
  if (tied.length === 1) return best

  const warmCool = scoreWarmCool(answers)
  if (warmCool === 'warm') {
    const warm = tied.filter((s) => s === 'spring' || s === 'autumn')
    if (warm.length) return warm[0]
  }
  if (warmCool === 'cool') {
    const cool = tied.filter((s) => s === 'summer' || s === 'winter')
    if (cool.length) return cool[0]
  }

  return tied[0]
}

export function scoreWarmCool(
  answers: Record<string, string>,
): 'warm' | 'cool' | 'neutral' {
  let warm = 0
  let cool = 0

  const skin = answers.skin
  if (skin === 'cool-pink') cool += 2
  if (skin === 'peach' || skin === 'golden' || skin === 'olive') warm += 2

  const metal = answers.metal
  if (metal === 'silver') cool += 2
  if (metal === 'gold') warm += 2

  if (warm > cool) return 'warm'
  if (cool > warm) return 'cool'
  return 'neutral'
}
