import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public', 'quiz', 'refs')
const urls = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'photo-urls.json'), 'utf8'),
)

fs.mkdirSync(outDir, { recursive: true })

for (const [id, url] of Object.entries(urls)) {
  const dest = path.join(outDir, `${id}.jpg`)
  process.stdout.write(`Fetching ${id}… `)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.statusText)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(dest, buf)
    console.log('ok')
  } catch (e) {
    console.log('failed', e.message)
  }
}

console.log('Done.')
