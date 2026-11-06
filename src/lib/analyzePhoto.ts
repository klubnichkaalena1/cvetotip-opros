import { resolveSubtypeForSeason } from '../data/subtypes'
import type { SeasonId, SubtypeId } from '../types'

export type PhotoAnalysisResult = {
  season: SeasonId
  subtype: SubtypeId
  confidence: string
  note: string
}

export async function analyzePhoto(imageDataUrl: string): Promise<PhotoAnalysisResult> {
  let res: Response
  try {
    res = await fetch('/api/analyze-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl }),
    })
  } catch {
    throw new Error(
      'Сервер анализа не отвечает. Остановите терминал (Ctrl+C), снова выполните npm run dev и дождитесь строк про web и api.',
    )
  }

  const body = (await res.json().catch(() => ({}))) as {
    message?: string
    season?: SeasonId
    subtype?: SubtypeId
    confidence?: string
    note?: string
  }

  if (!res.ok) {
    throw new Error(
      body.message ??
        (res.status === 404
          ? 'Адрес API не найден. Запустите проект командой npm run dev (не только vite).'
          : 'Не удалось проанализировать фото. Проверьте ключ в файле .env и перезапустите npm run dev.'),
    )
  }

  if (!body.season) {
    throw new Error('Сервер не вернул цветотип.')
  }

  const subtype = resolveSubtypeForSeason(body.season, body.subtype)

  return {
    season: body.season,
    subtype,
    confidence: body.confidence ?? 'medium',
    note: body.note ?? '',
  }
}
