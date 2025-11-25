const ResultHistory = require('../models/ResultHistory')
const ServiceabilityLog = require('../models/ServiceabilityLog')

const MAX_HISTORY_RECORDS = 200

function initCity(city) {
  return {
    city,
    totalComparisons: 0,
    totalSavings: 0,
    aggregateCartTotal: 0,
    totalEntriesWithResults: 0,
    totalPlatformRows: 0,
    couponHits: 0,
    platforms: {}
  }
}

function hotspotKey(log) {
  return `${log.platform}::${log.locationLabel || log.pincode || log.locationInput}`
}

exports.serviceabilityGaps = async () => {
  const logs = await ServiceabilityLog.find().sort({ createdAt: -1 }).limit(200).lean()
  const hotspots = new Map()
  const platformTotals = new Map()

  logs.forEach((log) => {
    const key = hotspotKey(log)
    if (!hotspots.has(key)) {
      hotspots.set(key, {
        platform: log.platform,
        locationLabel: log.locationLabel || log.locationInput,
        pincode: log.pincode,
        city: log.city,
        state: log.state,
        reason: log.reason,
        occurrences: 0,
        lastSeen: log.createdAt
      })
    }
    const bucket = hotspots.get(key)
    bucket.occurrences += 1
    if (log.createdAt > bucket.lastSeen) {
      bucket.lastSeen = log.createdAt
    }

    platformTotals.set(log.platform, (platformTotals.get(log.platform) || 0) + 1)
  })

  return {
    hotspots: Array.from(hotspots.values()).sort((a, b) => b.occurrences - a.occurrences).slice(0, 50),
    totals: Array.from(platformTotals.entries())
      .map(([platform, occurrences]) => ({ platform, occurrences }))
      .sort((a, b) => b.occurrences - a.occurrences)
  }
}

function platformBucket(bucket, platform) {
  if (!bucket.platforms[platform]) {
    bucket.platforms[platform] = {
      platform,
      appearances: 0,
      wins: 0,
      totalAmount: 0,
      couponHits: 0
    }
  }
  return bucket.platforms[platform]
}

function handleEntry(bucket, entry) {
  bucket.totalComparisons += 1
  if (entry.results?.length) {
    const totals = entry.results.map((result) => result.total)
    const maxTotal = Math.max(...totals)
    const minTotal = Math.min(...totals)
    bucket.totalSavings += maxTotal - minTotal
    const averageForEntry = totals.reduce((sum, value) => sum + value, 0) / totals.length
    bucket.aggregateCartTotal += averageForEntry
    bucket.totalEntriesWithResults += 1
  }

  entry.results?.forEach((result) => {
    bucket.totalPlatformRows += 1
    const platBucket = platformBucket(bucket, result.platform)
    platBucket.appearances += 1
    platBucket.totalAmount += result.total
    if (entry.bestPlatform === result.platform) {
      platBucket.wins += 1
    }
    if (result.discountTotal > 0) {
      platBucket.couponHits += 1
      bucket.couponHits += 1
    }
  })
}

function finalizeBucket(bucket) {
  const platformSummaries = Object.values(bucket.platforms).map((platform) => ({
    platform: platform.platform,
    appearances: platform.appearances,
    winRate: bucket.totalComparisons ? platform.wins / bucket.totalComparisons : 0,
    avgTotal: platform.appearances ? platform.totalAmount / platform.appearances : 0,
    couponRate: platform.appearances ? platform.couponHits / platform.appearances : 0
  }))

  const sortedByWinRate = [...platformSummaries].sort((a, b) => {
    if (b.winRate === a.winRate) {
      return a.avgTotal - b.avgTotal
    }
    return b.winRate - a.winRate
  })

  const sortedByAvgTotal = [...platformSummaries].sort((a, b) => a.avgTotal - b.avgTotal)

  return {
    city: bucket.city,
    totalComparisons: bucket.totalComparisons,
    avgCartTotal: bucket.totalEntriesWithResults
      ? bucket.aggregateCartTotal / bucket.totalEntriesWithResults
      : 0,
    avgSavingsPotential: bucket.totalComparisons ? bucket.totalSavings / bucket.totalComparisons : 0,
    couponUsageRate: bucket.totalPlatformRows ? bucket.couponHits / bucket.totalPlatformRows : 0,
    bestPlatform: sortedByWinRate[0] || null,
    cheapestPlatform: sortedByAvgTotal[0] || null,
    platforms: platformSummaries
  }
}

exports.citySummary = async () => {
  const history = await ResultHistory.find().sort({ createdAt: -1 }).limit(MAX_HISTORY_RECORDS).lean()
  const cityMap = new Map()

  history.forEach((entry) => {
    const city = entry.location?.trim() || 'Unknown'
    if (!cityMap.has(city)) {
      cityMap.set(city, initCity(city))
    }
    const bucket = cityMap.get(city)
    handleEntry(bucket, entry)
  })

  return Array.from(cityMap.values())
    .map(finalizeBucket)
    .sort((a, b) => b.totalComparisons - a.totalComparisons)
}
