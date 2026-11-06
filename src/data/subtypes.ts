import type { SeasonId, SubtypeId, SubtypeInfo } from '../types'

export const subtypes: Record<SubtypeId, SubtypeInfo> = {
  'spring-light': {
    id: 'spring-light',
    seasonId: 'spring',
    name: 'Светлая весна',
    blurb:
      'Самые нежные и светлые тёплые оттенки — персик, ivory, мягкий блонд без резкого контраста.',
  },
  'spring-warm': {
    id: 'spring-warm',
    seasonId: 'spring',
    name: 'Тёплая весна',
    blurb:
      'Чистое тепло: золотистая кожа и волосы, коралл и мёд — без «пыли» и холодной сизости.',
  },
  'spring-bright': {
    id: 'spring-bright',
    seasonId: 'spring',
    name: 'Яркая весна',
    blurb:
      'Высокая ясность и контраст при тёплом подтоне — сочные, «солнечные» цвета без приглушения.',
  },
  'summer-light': {
    id: 'summer-light',
    seasonId: 'summer',
    name: 'Светлое лето',
    blurb:
      'Холодный подтон и общая светлость — пудровые розы, голубой, мягкий серый, лёгкий блонд.',
  },
  'summer-soft': {
    id: 'summer-soft',
    seasonId: 'summer',
    name: 'Мягкое лето',
    blurb:
      'Приглушённый холодный колорит, низкий контраст — пыльные и «дымчатые» оттенки без резких границ.',
  },
  'summer-cool': {
    id: 'summer-cool',
    seasonId: 'summer',
    name: 'Холодное лето',
    blurb:
      'Классическое «лето»: прохладный подтон, розово-сливовая гамма, серебро у лица.',
  },
  'autumn-soft': {
    id: 'autumn-soft',
    seasonId: 'autumn',
    name: 'Мягкая осень',
    blurb:
      'Тёплые, но приглушённые «землистые» тона — оливковый, мягкий терракот, без глубокой тени.',
  },
  'autumn-warm': {
    id: 'autumn-warm',
    seasonId: 'autumn',
    name: 'Тёплая осень',
    blurb:
      'Насыщенное золото и медь в коже и волосах — спелые тёплые цвета осенней листвы.',
  },
  'autumn-deep': {
    id: 'autumn-deep',
    seasonId: 'autumn',
    name: 'Глубокая осень',
    blurb:
      'Тёмные тёплые оттенки и выраженный контраст — бордо, шоколад, горчица, глубокий оливковый.',
  },
  'winter-deep': {
    id: 'winter-deep',
    seasonId: 'winter',
    name: 'Глубокая зима',
    blurb:
      'Тёмные волосы и глаза при холодном подтоне — насыщенные глубокие цвета без «бежевой» мути.',
  },
  'winter-cool': {
    id: 'winter-cool',
    seasonId: 'winter',
    name: 'Холодная зима',
    blurb:
      'Чистый холодный колорит, умеренный контраст — ледяные розы, синий, серебро.',
  },
  'winter-bright': {
    id: 'winter-bright',
    seasonId: 'winter',
    name: 'Яркая зима',
    blurb:
      'Максимальный контраст и чистота — чёрный, белый, фуксия, изумруд без приглушения.',
  },
}

export const subtypeIdsBySeason: Record<SeasonId, SubtypeId[]> = {
  spring: ['spring-light', 'spring-warm', 'spring-bright'],
  summer: ['summer-light', 'summer-soft', 'summer-cool'],
  autumn: ['autumn-soft', 'autumn-warm', 'autumn-deep'],
  winter: ['winter-deep', 'winter-cool', 'winter-bright'],
}

export function isSubtypeId(value: string, seasonId: SeasonId): value is SubtypeId {
  return subtypeIdsBySeason[seasonId].includes(value as SubtypeId)
}

/** Запасной подтип, если API вернул только сезон (старый сервер или ответ без subtype) */
export const defaultSubtypeBySeason: Record<SeasonId, SubtypeId> = {
  spring: 'spring-warm',
  summer: 'summer-cool',
  autumn: 'autumn-warm',
  winter: 'winter-cool',
}

export function resolveSubtypeForSeason(
  season: SeasonId,
  subtype: string | undefined,
): SubtypeId {
  const normalized = subtype?.trim().toLowerCase() ?? ''
  if (normalized && isSubtypeId(normalized, season)) {
    return normalized
  }
  return defaultSubtypeBySeason[season]
}
