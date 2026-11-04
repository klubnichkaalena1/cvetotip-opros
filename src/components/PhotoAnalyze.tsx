import { useRef, useState } from 'react'
import { analyzePhoto } from '../lib/analyzePhoto'
import type { SeasonId } from '../types'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

type Props = {
  onResult: (season: SeasonId, note: string) => void
  onBack: () => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('read_failed'))
    }
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })
}

export function PhotoAnalyze({ onResult, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | null) {
    setError(null)
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Нужен файл-картинка: JPG, PNG или WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Фото больше 5 МБ. Сожмите или выберите другое.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPreview(dataUrl)
      setFileName(file.name)
    } catch {
      setError('Не удалось прочитать файл. Попробуйте другое фото.')
    }
  }

  async function submit() {
    if (!preview || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await analyzePhoto(preview)
      onResult(result.season, result.note)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel photo-panel">
      <h1>Цветотип по фото</h1>
      <p className="photo-intro">
        Загрузите портрет при дневном свете, без фильтров и по возможности без
        макияжа. Нейросеть подскажет сезон — результат ориентировочный.
      </p>

      <div className="photo-upload">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="photo-input-hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />

        {preview ? (
          <div className="photo-preview-wrap">
            <img src={preview} alt="Ваше фото для анализа" className="photo-preview" />
            {fileName && <p className="photo-file-name">{fileName}</p>}
          </div>
        ) : (
          <button
            type="button"
            className="photo-drop"
            onClick={() => inputRef.current?.click()}
          >
            <span className="photo-drop-title">Выбрать фото</span>
            <span className="photo-drop-hint">JPG, PNG или WebP · до 5 МБ</span>
          </button>
        )}

        {preview && (
          <button
            type="button"
            className="btn ghost photo-change"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            Другое фото
          </button>
        )}
      </div>

      {error && (
        <p className="photo-error" role="alert">
          {error}
        </p>
      )}

      <div className="actions photo-actions">
        <button type="button" className="btn ghost" onClick={onBack} disabled={loading}>
          Назад
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => void submit()}
          disabled={!preview || loading}
        >
          {loading ? 'Анализ…' : 'Определить цветотип'}
        </button>
      </div>
    </section>
  )
}
