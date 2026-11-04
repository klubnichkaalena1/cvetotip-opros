export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter'

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
}
