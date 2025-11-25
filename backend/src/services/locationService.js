const axios = require('axios')

const PINCODE_REGEX = /^\d{6}$/
const cache = new Map()

function titleCase(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function cacheKey(value) {
  return value.toLowerCase()
}

function buildDetails({
  raw,
  city,
  state,
  pincode,
  source
}) {
  const displayName = [city, state].filter(Boolean).join(', ')
  const label = pincode ? `${displayName} (${pincode})` : displayName || titleCase(raw)
  return {
    raw,
    city,
    state,
    pincode,
    displayName: label || titleCase(raw),
    source,
    cacheKey: pincode || label.toLowerCase(),
    queryValue: pincode || titleCase(raw)
  }
}

async function lookupPincode(pincode) {
  const key = cacheKey(`pin:${pincode}`)
  if (cache.has(key)) {
    return cache.get(key)
  }
  try {
    const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, { timeout: 5000 })
    if (Array.isArray(data) && data[0]?.Status === 'Success') {
      const office = data[0].PostOffice?.[0]
      if (office) {
        const details = buildDetails({
          raw: pincode,
          city: office.District || office.Block || office.Name,
          state: office.State,
          pincode,
          source: 'postal'
        })
        cache.set(key, details)
        return details
      }
    }
  } catch (error) {
    // network hiccup, fall through to manual formatting
  }
  return null
}

async function resolveLocation(input) {
  const raw = (input || '').trim()
  if (!raw) {
    return buildDetails({ raw: 'Unknown', city: 'Unknown', state: null, source: 'unknown' })
  }

  if (PINCODE_REGEX.test(raw)) {
    const lookup = await lookupPincode(raw)
    if (lookup) {
      return lookup
    }
    return buildDetails({ raw, city: null, state: null, pincode: raw, source: 'pincode' })
  }

  const cached = cache.get(cacheKey(raw))
  if (cached) {
    return cached
  }

  const details = buildDetails({ raw, city: titleCase(raw), state: null, source: 'text' })
  cache.set(cacheKey(raw), details)
  return details
}

module.exports = {
  resolveLocation
}
