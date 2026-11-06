import { useEffect, useMemo, useState } from 'react'
import { ColorSwatches } from './components/ColorSwatches'
import { OptionVisual } from './components/OptionVisual'
import { FaqSection } from './components/FaqSection'
import { PhotoAnalyze } from './components/PhotoAnalyze'
import { ThemeToggle } from './components/ThemeToggle'
import { questions } from './data/questions'
import { seasonThemeStyle, seasons } from './data/seasons'
import { subtypes } from './data/subtypes'
import { calculateSeason } from './lib/calculateSeason'
import { calculateSubtype } from './lib/calculateSubtype'
import { applyTheme, readStoredTheme, type ColorTheme } from './lib/theme'
import type { SeasonId, SubtypeId } from './types'
import './App.css'

type Screen = 'welcome' | 'quiz' | 'photo' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [photoSeasonId, setPhotoSeasonId] = useState<SeasonId | null>(null)
  const [photoSubtypeId, setPhotoSubtypeId] = useState<SubtypeId | null>(null)
  const [photoNote, setPhotoNote] = useState<string | null>(null)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => readStoredTheme())

  useEffect(() => {
    applyTheme(colorTheme)
  }, [colorTheme])

  const question = questions[step]
  const progress = screen === 'quiz' ? ((step + 1) / questions.length) * 100 : 0

  const resultId = useMemo(() => {
    if (screen !== 'result') return null
    if (photoSeasonId) return photoSeasonId
    return calculateSeason(answers)
  }, [screen, answers, photoSeasonId])

  const result = resultId ? seasons[resultId] : null

  const subtypeId = useMemo((): SubtypeId | null => {
    if (screen !== 'result' || !resultId) return null
    if (photoSubtypeId && photoSeasonId === resultId) return photoSubtypeId
    return calculateSubtype(resultId, answers)
  }, [screen, resultId, answers, photoSeasonId, photoSubtypeId])

  const subtype = subtypeId ? subtypes[subtypeId] : null

  const appClassName = [
    'app',
    screen === 'result' && resultId ? `theme-${resultId}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const appStyle = useMemo((): React.CSSProperties | undefined => {
    if (screen !== 'result' || !resultId) return undefined
    if (colorTheme === 'light') {
      return seasonThemeStyle(resultId) as React.CSSProperties
    }
    return {
      '--season-accent': seasons[resultId].accent,
    } as React.CSSProperties
  }, [screen, resultId, colorTheme])

  function startQuiz() {
    setAnswers({})
    setCheckedItems({})
    setPhotoSeasonId(null)
    setPhotoSubtypeId(null)
    setPhotoNote(null)
    setStep(0)
    setScreen('quiz')
  }

  function startPhoto() {
    setAnswers({})
    setCheckedItems({})
    setPhotoSeasonId(null)
    setPhotoSubtypeId(null)
    setPhotoNote(null)
    setStep(0)
    setScreen('photo')
  }

  function finishPhoto(seasonId: SeasonId, subtype: SubtypeId, note: string) {
    setPhotoSeasonId(seasonId)
    setPhotoSubtypeId(subtype)
    setPhotoNote(note || null)
    setCheckedItems({})
    setScreen('result')
  }

  function pickOption(optionId: string) {
    if (!question) return
    const next = { ...answers, [question.id]: optionId }
    setAnswers(next)
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      setScreen('result')
    }
  }

  function goBack() {
    if (step === 0) {
      setScreen('welcome')
      return
    }
    setStep(step - 1)
  }

  function restart() {
    setAnswers({})
    setCheckedItems({})
    setPhotoSeasonId(null)
    setPhotoSubtypeId(null)
    setPhotoNote(null)
    setStep(0)
    setScreen('welcome')
  }

  function toggleChecklist(index: number) {
    const key = `${resultId}-${index}`
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className={appClassName} style={appStyle}>
      <header className="header">
        <span className="logo">Цветотип</span>
        <div className="header-end">
          {screen === 'quiz' && (
            <span className="step-label">
              Вопрос {step + 1} из {questions.length}
            </span>
          )}
          <ThemeToggle theme={colorTheme} onChange={setColorTheme} />
        </div>
      </header>

      {screen === 'quiz' && (
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className="main">
        {screen === 'welcome' && (
          <section className="panel welcome">
            <h1>Узнайте свой цветотип</h1>
            <p className="welcome-subtitle">
              Система четырёх сезонов — бесплатно, без регистрации
            </p>

            <div className="welcome-cards">
              <article className="welcome-card welcome-card--active">
                <h2 className="welcome-card-title">Опрос за 3–4 минуты</h2>
                <p className="welcome-card-text">
                  {questions.length} вопросов про естественные оттенки кожи,
                  волос и глаз. В конце — ваш сезон, палитра и чеклист.
                </p>
                <button
                  type="button"
                  className="btn primary welcome-card-btn"
                  onClick={startQuiz}
                >
                  Начать опрос
                </button>
              </article>

              <article className="welcome-card welcome-card--active">
                <h2 className="welcome-card-title">По фото лица</h2>
                <p className="welcome-card-text">
                  Загрузите фото без макияжа и фильтров — нейросеть подскажет
                  цветотип автоматически — обычно это занимает несколько секунд.
                </p>
                <button
                  type="button"
                  className="btn primary welcome-card-btn"
                  onClick={startPhoto}
                >
                  Загрузить фото
                </button>
              </article>
            </div>

            <FaqSection />

            <p className="disclaimer">
              Результат ориентировочный и не заменяет очный разбор у
              специалиста.
            </p>
          </section>
        )}

        {screen === 'photo' && (
          <PhotoAnalyze
            onResult={finishPhoto}
            onBack={() => setScreen('welcome')}
          />
        )}

        {screen === 'quiz' && question && (
          <section className="panel quiz">
            <h2>{question.title}</h2>
            {question.hint && <p className="hint">{question.hint}</p>}
            <div className="options">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`option${answers[question.id] === opt.id ? ' selected' : ''}`}
                  onClick={() => pickOption(opt.id)}
                >
                  <OptionVisual
                    photo={opt.photo}
                    placeholderColor={opt.placeholderColor}
                    label={opt.label}
                  />
                </button>
              ))}
            </div>
            <div className="actions">
              <button type="button" className="btn ghost" onClick={goBack}>
                Назад
              </button>
            </div>
          </section>
        )}

        {screen === 'result' && result && resultId && (
          <section
            key={resultId}
            className="panel result result--enter"
          >
            <p className="result-label">Ваш цветотип</p>
            {photoSeasonId && (
              <p className="result-source">Определено по фото с помощью нейросети</p>
            )}
            <h1 className="result-title">{result.name}</h1>
            {subtype && (
              <>
                <p className="subtype-name">{subtype.name}</p>
                <p className="subtype-blurb">{subtype.blurb}</p>
              </>
            )}
            <p className="tagline">{result.tagline}</p>
            {photoNote && (
              <p className="photo-result-note">{photoNote}</p>
            )}
            <p className="description">{result.description}</p>

            <div className="result-block palette-block">
              <ColorSwatches
                colors={result.palette}
                size="lg"
                label="Ваша палитра"
              />
            </div>

            <div className="result-block examples-block">
              <h3>Часто относят к этому типу</h3>
              <p className="examples-hint">
                Ориентир для вдохновения — не официальная классификация
                знаменитостей.
              </p>
              <ul className="examples-list">
                {result.examples.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>

            <div className="result-block">
              <h3>Что вам подходит</h3>
              <ul>
                {result.suits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="result-block checklist-block">
              <h3>Мини-чеклист</h3>
              <p className="checklist-hint">
                Отметьте, что уже попробовали или хотите проверить:
              </p>
              <ul className="checklist">
                {result.checklist.map((item, index) => {
                  const key = `${resultId}-${index}`
                  const checked = !!checkedItems[key]
                  return (
                    <li key={item}>
                      <label className="checklist-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecklist(index)}
                        />
                        <span className={checked ? 'done' : undefined}>
                          {item}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="result-block muted">
              <h3>Что лучше смягчить или избегать</h3>
              <ul>
                {result.avoid.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="actions">
              <button type="button" className="btn primary" onClick={restart}>
                Пройти заново
              </button>
            </div>
            <p className="disclaimer">
              Результат ориентировочный и не заменяет очный разбор у
              специалиста.
            </p>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} · Опрос «4 сезона»</span>
      </footer>
    </div>
  )
}

export default App
