const { chromium } = require('playwright')
const pLimit = require('p-limit').default || require('p-limit')
const env = require('./env')
const path = require('path')
const rootScraper = (name) => path.join(__dirname, '..', '..', 'scrapers', name)
const scrapeZomato = require(rootScraper('zomato'))
const scrapeSwiggy = require(rootScraper('swiggy'))
const scrapeBlinkit = require(rootScraper('blinkit'))
const scrapeZepto = require(rootScraper('zepto'))
const { buildResult, pickUserAgent } = require(rootScraper('shared'))

const limit = pLimit(env.maxConcurrent)
const historyStore = []

const scraperMap = {
  zomato: scrapeZomato,
  swiggy: scrapeSwiggy,
  blinkit: scrapeBlinkit,
  zepto: scrapeZepto
}

function normalizeItems(item, items = []) {
  if (Array.isArray(items) && items.length) {
    return items
  }
  if (item) {
    return [item]
  }
  return []
}

async function runScraper(platform, item, items, location) {
  const scraper = scraperMap[platform]
  if (!scraper) {
    const normalizedItems = normalizeItems(item, items)
    return buildResult(platform, normalizedItems, location)
  }
  return limit(async () => {
    const browser = await chromium.launch({ headless: env.headless })
    const page = await browser.newPage()
    const userAgent = pickUserAgent(`${platform}-${item}-${location}`)
    try {
      await page.setExtraHTTPHeaders({ 'user-agent': userAgent })
      return await scraper(page, normalizeItems(item, items), location)
    } catch (error) {
      console.error(`[scraper:${platform}] failed with UA=${userAgent}:`, error)
      return buildResult(platform, normalizeItems(item, items), location)
    } finally {
      await page.close()
      await browser.close()
    }
  })
}

exports.fetchPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params
    const { item, items, location } = req.body
    const result = await runScraper(platform, item, items, location)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

exports.compare = async (req, res, next) => {
  try {
    const { item, items, location } = req.body
    const cartItems = normalizeItems(item, items)
    if (!cartItems.length) {
      throw new Error('No items supplied for comparison')
    }
    const platforms = ['zomato', 'swiggy', 'blinkit', 'zepto']
    const results = await Promise.all(platforms.map((platform) => runScraper(platform, cartItems[0], cartItems, location)))
    res.json({ items: cartItems, location, results })
  } catch (error) {
    next(error)
  }
}

exports.recommend = async (req, res, next) => {
  try {
    const { results } = req.body
    const sorted = [...results].sort((a, b) => a.total - b.total)
    const best = sorted[0]
    res.json({ bestPlatform: best })
  } catch (error) {
    next(error)
  }
}

exports.saveHistory = async (req, res) => {
  historyStore.unshift({
    item: req.body.item,
    location: req.body.location,
    bestPlatform: req.body.bestPlatform,
    ts: Date.now()
  })
  historyStore.splice(50)
  res.json({ status: 'saved' })
}

exports.listHistory = async (_req, res) => {
  res.json(historyStore.slice(0, 25))
}
