import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const isProd = process.env.NODE_ENV === 'production'

const VALID_SEASONS = new Set(['spring', 'summer', 'autumn', 'winter'])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const app = express()
app.use(express.json({ limit: '8mb' }))

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-zA-Z0-9+/=]+)$/i.exec(
    dataUrl.trim(),
  )
  if (!match) return null
  const mime = match[1].toLowerCase().replace('jpg', 'jpeg')
  const base64 = match[2]
  const bytes = Buffer.byteLength(base64, 'base64')
  if (bytes > MAX_IMAGE_BYTES) {
    return { error: 'too_large' }
  }
  return { mime, dataUrl: `data:${mime};base64,${base64}` }
}

const SYSTEM_PROMPT = `You are a seasonal color analysis assistant (4-season system: spring, summer, autumn, winter).
Analyze the face in the photo: skin undertone, hair, eyes, overall contrast.
Return ONLY one JSON object, no markdown:
{"season":"spring"|"summer"|"autumn"|"winter","confidence":"high"|"medium"|"low","note":"1-2 short sentences in Russian for the user"}
If the photo is unusable (no face, heavy filters, full makeup), still pick the best guess but set confidence to low and explain in note.`

app.post('/api/analyze-photo', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    res.status(503).json({
      error: 'missing_key',
      message: 'На сервере не настроен OPENROUTER_API_KEY. Добавьте ключ в файл .env',
    })
    return
  }

  const parsed = parseDataUrl(req.body?.image)
  if (!parsed) {
    res.status(400).json({
      error: 'invalid_image',
      message: 'Загрузите фото в формате JPG, PNG или WebP (до 5 МБ).',
    })
    return
  }
  if (parsed.error === 'too_large') {
    res.status(400).json({
      error: 'too_large',
      message: 'Фото слишком большое. Пожалуйста, выберите файл до 5 МБ.',
    })
    return
  }

  const model =
    process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-2.0-flash-001'

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
        'X-Title': 'Cvetotip Opros',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Определи цветотип по этому фото лица (естественный свет, без фильтров — если видно).',
              },
              {
                type: 'image_url',
                image_url: { url: parsed.dataUrl },
              },
            ],
          },
        ],
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      const msg =
        payload?.error?.message ||
        payload?.message ||
        'OpenRouter вернул ошибку. Проверьте ключ и модель.'
      res.status(response.status >= 500 ? 502 : 400).json({
        error: 'openrouter',
        message: msg,
      })
      return
    }

    const raw = payload?.choices?.[0]?.message?.content?.trim() ?? ''
    const jsonText = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    let data
    try {
      data = JSON.parse(jsonText)
    } catch {
      res.status(502).json({
        error: 'parse',
        message: 'Не удалось разобрать ответ нейросети. Попробуйте другое фото.',
      })
      return
    }

    const season = String(data.season ?? '').toLowerCase()
    if (!VALID_SEASONS.has(season)) {
      res.status(502).json({
        error: 'parse',
        message: 'Нейросеть вернула неожиданный результат. Попробуйте ещё раз.',
      })
      return
    }

    res.json({
      season,
      confidence: data.confidence ?? 'medium',
      note: typeof data.note === 'string' ? data.note : '',
    })
  } catch {
    res.status(502).json({
      error: 'network',
      message: 'Не удалось связаться с OpenRouter. Проверьте интернет и попробуйте позже.',
    })
  }
})

if (isProd) {
  const dist = path.join(__dirname, '../dist')
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(
    isProd
      ? `Сайт и API: http://localhost:${PORT}`
      : `API: http://localhost:${PORT} (для разработки подключите Vite)`,
  )
})
