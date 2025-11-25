const ServiceabilityLog = require('../models/ServiceabilityLog')

const PLATFORM_NAMES = {
  swiggy: 'Swiggy',
  zomato: 'Zomato',
  blinkit: 'Blinkit',
  zepto: 'Zepto'
}

const PLATFORM_COVERAGE = {
  swiggy: {
    cities: ['bengaluru', 'bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'pune', 'kolkata'],
    states: ['karnataka', 'maharashtra', 'delhi', 'tamil nadu', 'telangana', 'west bengal']
  },
  zomato: {
    cities: ['bengaluru', 'bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'pune', 'kolkata'],
    states: ['karnataka', 'maharashtra', 'delhi', 'tamil nadu', 'telangana', 'west bengal']
  },
  blinkit: {
    cities: ['delhi', 'gurgaon', 'gurugram', 'noida', 'mumbai', 'bengaluru', 'bangalore', 'pune'],
    states: ['delhi', 'haryana', 'uttar pradesh', 'maharashtra', 'karnataka']
  },
  zepto: {
    cities: ['bengaluru', 'bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'pune'],
    states: ['karnataka', 'maharashtra', 'delhi', 'tamil nadu', 'telangana']
  }
}

function normalize(value) {
  return (value || '').trim().toLowerCase()
}

function platformDisplay(platform) {
  return PLATFORM_NAMES[platform] || platform
}

function inList(value, list = []) {
  const normalized = normalize(value)
  if (!normalized) {
    return false
  }
  return list.some((entry) => normalized.includes(entry))
}

function evaluatePlatform(platform, locationDetails) {
  const rules = PLATFORM_COVERAGE[platform]
  if (!rules) {
    return { serviceable: true }
  }

  const city = normalize(locationDetails.city)
  const state = normalize(locationDetails.state)
  const pincode = normalize(locationDetails.pincode)
  const label = locationDetails.displayName || locationDetails.raw || 'this area'

  const cityMatch = inList(city, rules.cities)
  const stateMatch = inList(state, rules.states)

  if (cityMatch || stateMatch) {
    return { serviceable: true }
  }

  if (pincode && (city || state)) {
    return {
      serviceable: false,
      reason: `${platformDisplay(platform)} is not yet available in ${label}`
    }
  }

  if (pincode) {
    return {
      serviceable: false,
      reason: `${platformDisplay(platform)} does not service pincode ${locationDetails.pincode}`
    }
  }

  return {
    serviceable: false,
    reason: `${platformDisplay(platform)} is currently limited to major metros`
  }
}

async function logGap(platform, locationDetails, reason, meta = {}) {
  await ServiceabilityLog.create({
    platform,
    locationInput: locationDetails.raw,
    locationLabel: locationDetails.displayName,
    pincode: locationDetails.pincode,
    city: locationDetails.city,
    state: locationDetails.state,
    reason,
    meta
  })
}

async function annotateResults(results, locationDetails) {
  const annotated = []
  for (const result of results) {
    const evaluation = evaluatePlatform(result.platform, locationDetails)
    if (!evaluation.serviceable) {
      await logGap(result.platform, locationDetails, evaluation.reason)
    }
    annotated.push({
      ...result,
      serviceable: evaluation.serviceable,
      unavailableReason: evaluation.reason || null
    })
  }
  return annotated
}

module.exports = {
  annotateResults,
  evaluatePlatform,
  logGap
}
