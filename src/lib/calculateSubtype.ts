import { scoreWarmCool } from './calculateSeason'
import { subtypeIdsBySeason } from '../data/subtypes'
import type { SeasonId, SubtypeId } from '../types'

type ScoreMap = Record<SubtypeId, number>

function pickBest(candidates: SubtypeId[], scores: ScoreMap): SubtypeId {
  let best = candidates[0]
  let bestScore = -Infinity
  for (const id of candidates) {
    const s = scores[id] ?? 0
    if (s > bestScore) {
      bestScore = s
      best = id
    }
  }
  return best
}

function add(scores: ScoreMap, id: SubtypeId, points: number) {
  scores[id] = (scores[id] ?? 0) + points
}

function contrastScores(
  scores: ScoreMap,
  ids: { soft: SubtypeId; light: SubtypeId; strong: SubtypeId },
  contrast: string | undefined,
) {
  if (contrast === 'low') {
    add(scores, ids.soft, 3)
    add(scores, ids.light, 1)
  } else if (contrast === 'medium') {
    add(scores, ids.light, 2)
    add(scores, ids.soft, 1)
    add(scores, ids.strong, 1)
  } else if (contrast === 'high') {
    add(scores, ids.strong, 3)
    add(scores, ids.light, 1)
  }
}

export function calculateSubtype(
  season: SeasonId,
  answers: Record<string, string>,
): SubtypeId {
  const contrast = answers.contrast
  const warmCool = scoreWarmCool(answers)
  const warm = warmCool === 'warm'
  const cool = warmCool === 'cool'
  const hair = answers.hair
  const eyes = answers.eyes
  const skin = answers.skin
  const metal = answers.metal

  const scores = {} as ScoreMap
  const ids = subtypeIdsBySeason[season]

  switch (season) {
    case 'spring': {
      contrastScores(scores, {
        soft: 'spring-light',
        light: 'spring-light',
        strong: 'spring-bright',
      }, contrast)
      if (warm) add(scores, 'spring-warm', 2)
      if (skin === 'peach' || skin === 'golden' || skin === 'olive') {
        add(scores, 'spring-warm', 2)
      }
      if (metal === 'gold') add(scores, 'spring-warm', 2)
      if (hair === 'warm-blond' || hair === 'red') add(scores, 'spring-warm', 2)
      if (hair === 'cool-blond') add(scores, 'spring-light', 2)
      if (cool && metal === 'silver') add(scores, 'spring-light', 1)
      if (contrast === 'high') add(scores, 'spring-bright', 2)
      return pickBest(ids, scores)
    }

    case 'summer': {
      contrastScores(scores, {
        soft: 'summer-soft',
        light: 'summer-light',
        strong: 'summer-cool',
      }, contrast)
      if (cool) add(scores, 'summer-cool', 2)
      if (skin === 'cool-pink') add(scores, 'summer-cool', 2)
      if (metal === 'silver') add(scores, 'summer-cool', 2)
      if (eyes === 'blue-gray') add(scores, 'summer-cool', 1)
      if (hair === 'cool-blond' || hair === 'ash-brown') {
        add(scores, 'summer-light', 2)
      }
      if (contrast === 'low') add(scores, 'summer-soft', 2)
      if (contrast === 'medium') {
        add(scores, 'summer-light', 1)
        add(scores, 'summer-cool', 2)
      }
      if (contrast === 'high') add(scores, 'summer-cool', 2)
      if (warm || hair === 'warm-blond' || hair === 'red' || metal === 'gold') {
        add(scores, 'summer-light', 1)
      }
      return pickBest(ids, scores)
    }

    case 'autumn': {
      contrastScores(scores, {
        soft: 'autumn-soft',
        light: 'autumn-warm',
        strong: 'autumn-deep',
      }, contrast)
      if (warm) add(scores, 'autumn-warm', 2)
      if (skin === 'golden' || skin === 'olive' || skin === 'peach') {
        add(scores, 'autumn-warm', 2)
      }
      if (metal === 'gold') add(scores, 'autumn-warm', 2)
      if (hair === 'red' || hair === 'chestnut' || hair === 'warm-blond') {
        add(scores, 'autumn-warm', 2)
      }
      if (hair === 'dark') add(scores, 'autumn-deep', 3)
      if (eyes === 'dark-brown') add(scores, 'autumn-deep', 2)
      if (contrast === 'high') add(scores, 'autumn-deep', 2)
      if (contrast === 'low') add(scores, 'autumn-soft', 2)
      if (contrast === 'medium') {
        add(scores, 'autumn-warm', 2)
        add(scores, 'autumn-deep', 1)
      }
      if (cool && metal === 'silver') add(scores, 'autumn-soft', 1)
      return pickBest(ids, scores)
    }

    case 'winter': {
      contrastScores(scores, {
        soft: 'winter-cool',
        light: 'winter-cool',
        strong: 'winter-bright',
      }, contrast)
      if (cool) add(scores, 'winter-cool', 2)
      if (metal === 'silver') add(scores, 'winter-cool', 2)
      if (skin === 'cool-pink') add(scores, 'winter-cool', 1)
      if (hair === 'dark') add(scores, 'winter-deep', 3)
      if (eyes === 'dark-brown') add(scores, 'winter-deep', 2)
      if (contrast === 'high') add(scores, 'winter-bright', 3)
      if (contrast === 'medium') {
        add(scores, 'winter-deep', 2)
        add(scores, 'winter-cool', 1)
      }
      if (contrast === 'low') add(scores, 'winter-cool', 2)
      return pickBest(ids, scores)
    }
  }
}
