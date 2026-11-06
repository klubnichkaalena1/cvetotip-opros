export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter'

export type SubtypeId =
  | 'spring-light'
  | 'spring-warm'
  | 'spring-bright'
  | 'summer-light'
  | 'summer-soft'
  | 'summer-cool'
  | 'autumn-soft'
  | 'autumn-warm'
  | 'autumn-deep'
  | 'winter-deep'
  | 'winter-cool'
  | 'winter-bright'

export type SeasonScores = Record<SeasonId, number>

export type QuizOption = {
  id: string
  label: string
  scores: SeasonScores
  /** Локальный файл: public/quiz/refs/{id}.jpg (см. npm run fetch-photos) */
  photo: string
  /** Заглушка, если фото не загрузилось */
  placeholderColor: string
}

export type QuizQuestion = {
  id: string
  title: string
  hint?: string
  options: QuizOption[]
}

export type SeasonTheme = {
  bg: string
  surface: string
  border: string
  accent: string
  accentBg: string
  accentBorder: string
  text: string
  textH: string
  textMuted: string
}

export type SeasonInfo = {
  id: SeasonId
  name: string
  tagline: string
  description: string
  suits: string[]
  avoid: string[]
  accent: string
  palette: string[]
  theme: SeasonTheme
  checklist: string[]
  /** Ориентиры для вдохновения, не официальная классификация */
  examples: string[]
}

export type SubtypeInfo = {
  id: SubtypeId
  seasonId: SeasonId
  name: string
  blurb: string
}
