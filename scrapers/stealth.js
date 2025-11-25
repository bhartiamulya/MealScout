const crypto = require('crypto')

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
]

function pickUserAgent(seed = '') {
  const hash = crypto.createHash('sha256').update(`${seed}:${Date.now()}:${Math.random()}`).digest('hex')
  const index = parseInt(hash.slice(0, 8), 16) % userAgents.length
  return userAgents[index]
}

function randomViewport() {
  const width = 1280 + Math.floor(Math.random() * 160)
  const height = 720 + Math.floor(Math.random() * 180)
  return { width, height }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runWithRetries(task, { attempts = 2, delayMs = 500, label = 'scraper' } = {}) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task(attempt)
    } catch (error) {
      lastError = error
      console.warn(`[${label}] attempt ${attempt} failed: ${error?.message || error}`)
      if (attempt < attempts && delayMs) {
        await delay(delayMs)
      }
    }
  }
  console.error(`[${label}] exhausted ${attempts} attempts`)
  throw lastError
}

module.exports = {
  pickUserAgent,
  randomViewport,
  runWithRetries
}
