const { enrichResult, buildResult, pickUserAgent, randomViewport, runWithRetries } = require('./shared')

module.exports = async function scrapeZepto(page, item, location) {
  const url = `https://www.zeptonow.com/search?query=${encodeURIComponent(item)}&address=${encodeURIComponent(location)}`
  try {
    await page.setViewportSize(randomViewport())
    await page.setExtraHTTPHeaders({ 'user-agent': pickUserAgent(`${item}-${location}-zepto`) })
    const snippet = await runWithRetries(async () => {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(1500)
      return page.locator('[data-testid="product-card"]').first().innerText({ timeout: 2000 })
    })
    return enrichResult('zepto', item, location, snippet, page.url())
  } catch (error) {
    return buildResult('zepto', item, location)
  }
}
