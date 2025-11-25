const { enrichResult, buildResult, pickUserAgent, randomViewport, runWithRetries } = require('./shared')

module.exports = async function scrapeBlinkit(page, item, location) {
  const url = `https://blinkit.com/s/?q=${encodeURIComponent(item)}&address=${encodeURIComponent(location)}`
  try {
    await page.setViewportSize(randomViewport())
    await page.setExtraHTTPHeaders({ 'user-agent': pickUserAgent(`${item}-${location}-blinkit`) })
    const snippet = await runWithRetries(async () => {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(1500)
      return page.locator('[data-test-id="product-card"]').first().innerText({ timeout: 2000 })
    })
    return enrichResult('blinkit', item, location, snippet, page.url())
  } catch (error) {
    return buildResult('blinkit', item, location)
  }
}
