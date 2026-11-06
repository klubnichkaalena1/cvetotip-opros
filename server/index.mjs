import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const isProd = process.env.NODE_ENV === 'production'

const VALID_SEASONS = new Set(['spring', 'summer', 'autumn', 'winter'])

const SUBTYPES_BY_SEASON = {
  spring: ['spring-light', 'spring-warm', 'spring-bright'],
  summer: ['summer-light', 'summer-soft', 'summer-cool'],
  autumn: ['autumn-soft', 'autumn-warm', 'autumn-deep'],
  winter: ['winter-deep', 'winter-cool', 'winter-bright'],
}

/** Если модель вернула неверный subtype — типичный, не «мягкий» по умолчанию */
const DEFAULT_SUBTYPE_BY_SEASON = {
  spring: 'spring-warm',
  summer: 'summer-cool',
  autumn: 'autumn-warm',
  winter: 'winter-cool',
}
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

if (
  !isProd &&
  process.env.OPENROUTER_INSECURE_TLS?.trim() === '1'
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.warn(
    '[api] OPENROUTER_INSECURE_TLS=1 — ослаблена проверка HTTPS (только локальная отладка)',
  )
}

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

const SYSTEM_PROMPT = `You are a seasonal color analysis assistant (12-season refinement on 4 base seasons).
Analyze the face: skin undertone, hair, eyes, overall contrast.
Return ONLY one JSON object, no markdown:
{"season":"spring"|"summer"|"autumn"|"winter","subtype":"<id>","confidence":"high"|"medium"|"low","note":"1-2 short sentences in Russian"}
subtype must match season:
spring: spring-light | spring-warm | spring-bright
summer: summer-light | summer-soft | summer-cool (summer is cool-toned; there is no warm summer)
autumn: autumn-soft | autumn-warm | autumn-deep
winter: winter-deep | winter-cool | winter-bright
If the photo is unusable, still pick best guess but set confidence to low and explain in note.`

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
    process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-2.5-flash'

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

    const allowedSubtypes = SUBTYPES_BY_SEASON[season] ?? []
    let subtype = String(data.subtype ?? '').toLowerCase()
    if (!allowedSubtypes.includes(subtype)) {
      subtype = DEFAULT_SUBTYPE_BY_SEASON[season] ?? allowedSubtypes[0] ?? ''
    }

    res.json({
      season,
      subtype,
      confidence: data.confidence ?? 'medium',
      note: typeof data.note === 'string' ? data.note : '',
    })
  } catch (err) {
    const code = err?.cause?.code || err?.code || ''
    console.error('[api] OpenRouter:', code || err?.message || err)

    let message =
      'Не удалось связаться с OpenRouter. Проверьте интернет и попробуйте позже.'

    if (
      code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
      code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
    ) {
      message =
        'Связь с OpenRouter блокирует антivirus или VPN (ошибка сертификата). Добавьте в .env строку OPENROUTER_INSECURE_TLS=1, сохраните файл и перезапустите npm run dev. Используйте только на своём компьютере.'
    }

    res.status(502).json({
      error: 'network',
      message,
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

const server = app.listen(PORT, () => {
  console.log(
    isProd
      ? `Сайт и API: http://localhost:${PORT}`
      : `API: http://localhost:${PORT} (для разработки подключите Vite)`,
  )
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nПорт ${PORT} уже занят другим процессом.`,
      `\nЗакройте лишние терминалы или выполните: npm run dev:stop`,
      `\nЗатем снова: npm run dev\n`,
    )
    process.exit(1)
  }
  console.error(err)
  process.exit(1)
})

// concurrently на Windows иногда закрывает stdin — без этого процесс может сразу завершиться
process.stdin.resume()
