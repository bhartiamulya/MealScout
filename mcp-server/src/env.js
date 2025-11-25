require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })

const required = ['MCP_PORT', 'SCRAPER_AUTH_TOKEN']

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing env ${key}`)
  }
})

module.exports = {
  port: Number(process.env.MCP_PORT) || 6060,
  token: process.env.SCRAPER_AUTH_TOKEN,
  headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  maxConcurrent: Number(process.env.MAX_CONCURRENT_SCRAPES || 4)
}
