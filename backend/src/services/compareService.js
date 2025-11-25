const mcpClient = require('./mcpClient')
const historyService = require('./historyService')
const cache = require('./cache')
const { resolveLocation } = require('./locationService')
const { annotateResults } = require('./serviceabilityService')

function formatCart(item, items = []) {
  if (items.length) {
    return items
  }
  if (item) {
    return [item]
  }
  return []
}

function summarize(results) {
  const sorted = [...results].sort((a, b) => a.total - b.total)
  const fastest = [...results].sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
  return {
    cheapest: sorted[0]?.total || 0,
    fastest: fastest[0]?.deliveryTime || '0 min',
    difference: sorted[sorted.length - 1]?.total - sorted[0]?.total || 0
  }
}

exports.compare = async ({ item, items, location }) => {
  const cartItems = formatCart(item, items)
  if (!cartItems.length) {
    throw new Error('No items provided for comparison')
  }
  const resolvedLocation = await resolveLocation(location)
  const cacheKey = cartItems.join('|')
  const cacheLocationKey = resolvedLocation.cacheKey || resolvedLocation.displayName || location
  const cached = cache.get(cacheKey, cacheLocationKey)
  if (cached) {
    return cached
  }

  const comparison = await mcpClient.comparePrices({ items: cartItems, location: resolvedLocation.queryValue })
  const annotatedResults = await annotateResults(comparison.results, resolvedLocation)
  const availableResults = annotatedResults.filter((result) => result.serviceable)
  const recommendationBase = availableResults.length ? availableResults : annotatedResults
  const recommendation = await mcpClient.recommendPlatform(recommendationBase)
  const payload = {
    item: cartItems[0],
    items: cartItems,
    location: resolvedLocation.displayName,
    locationDetails: resolvedLocation,
    results: annotatedResults,
    bestPlatform: recommendation.bestPlatform,
    breakdown: summarize(comparison.results)
  }
  cache.set(cacheKey, cacheLocationKey, payload)
  await historyService.record(payload)
  return payload
}
