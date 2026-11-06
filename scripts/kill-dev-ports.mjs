import { execSync } from 'child_process'

const PORTS = [3001, 5173, 5174]

function killPortWindows(port) {
  let out = ''
  try {
    out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
  } catch {
    return
  }

  const pids = new Set()
  for (const line of out.split('\n')) {
    if (!line.includes('LISTENING')) continue
    const parts = line.trim().split(/\s+/)
    const pid = parts.at(-1)
    if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid)
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
      console.log(`Освобождён порт ${port} (процесс ${pid})`)
    } catch {
      /* already gone */
    }
  }
}

function killPortUnix(port) {
  try {
    execSync(`npx --yes kill-port ${port}`, { stdio: 'pipe' })
    console.log(`Освобождён порт ${port}`)
  } catch {
    /* port free */
  }
}

for (const port of PORTS) {
  if (process.platform === 'win32') killPortWindows(port)
  else killPortUnix(port)
}
