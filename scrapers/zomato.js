const { enrichResult, buildResult, pickUserAgent, randomViewport, runWithRetries } = require('./shared')

module.exports = async function scrapeZomato(page, item, location) {
  const url = `https://www.zomato.com/${encodeURIComponent(location.toLowerCase())}/restaurants?search=${encodeURIComponent(item)}`
  try {
    await page.setViewportSize(randomViewport())
    await page.setExtraHTTPHeaders({ 'user-agent': pickUserAgent(`${item}-${location}`) })
    const snippet = await runWithRetries(async () => {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(2000)
      return page.locator('[data-testid="restaurant-card"]').first().innerText({ timeout: 2000 }).catch(async () => {
        return page.locator('body').innerText()
      })
    })
    return enrichResult('zomato', item, location, snippet, page.url())
  } catch (error) {
    return buildResult('zomato', item, location)
  }
}
