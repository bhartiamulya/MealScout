const crypto = require('crypto')
const { pickUserAgent, randomViewport, runWithRetries } = require('./stealth')

function hashNumber(platform, value, location, slice) {
  const hash = crypto.createHash('sha256').update(`${platform}:${value}:${location}`).digest('hex')
  return parseInt(hash.slice(slice, slice + 6), 16)
}

function normalizeWindow(value) {
  if (!value) {
    return null
  }
  const windowMatch = value.match(/(\d{2})\s*-\s*(\d{2})\s*min/i)
  if (windowMatch) {
    return `${windowMatch[1]}-${windowMatch[2]} min`
  }
  const singleMatch = value.match(/(\d{2})\s*min/i)
  if (singleMatch) {
    const start = Number(singleMatch[1])
    const end = start + 8
    return `${start}-${end} min`
  }
  return null
}

function parsePrice(value) {
  if (!value) {
    return null
  }
  const match = value.match(/₹\s*(\d{2,4})/)
  if (match) {
    return Number(match[1])
  }
  return null
}

function buildLineItems(platform, items, location) {
  return items.map((name, idx) => {
    const seed = hashNumber(platform, `${name}-${idx}`, location, idx)
    const basePrice = 80 + (seed % 160)
    const inStock = seed % 9 !== 0
    const replacement = !inStock ? `${name} (alt)` : null
    return {
      name,
      price: basePrice,
      inStock,
      replacement
    }
  })
}

function deriveDiscounts(platform, subtotal, location, itemsCount) {
  const discounts = []
  if (subtotal > 500) {
    discounts.push({ type: 'coupon', code: 'SAVE80', description: 'Platform coupon on carts above ₹500', amount: 80 })
  }
  if (itemsCount >= 3) {
    discounts.push({ type: 'delivery', description: 'Multi-item delivery waiver', amount: 30 })
  }
  if (['swiggy', 'zomato'].includes(platform) && location.toLowerCase().includes('bengaluru')) {
    discounts.push({ type: 'bank', description: 'ICICI dining partner offer', amount: 50 })
  }
  return discounts
}

function citySlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

function fallbackLink(platform, item, location) {
  const encodedItem = encodeURIComponent(item)
  const encodedLocation = encodeURIComponent(location)
  switch (platform) {
    case 'swiggy':
      return `https://www.swiggy.com/${citySlug(location)}?query=${encodedItem}`
    case 'zomato':
      return `https://www.zomato.com/${citySlug(location)}/restaurants?search=${encodedItem}`
    case 'blinkit':
      return `https://blinkit.com/s/?q=${encodedItem}&address=${encodedLocation}`
    case 'zepto':
      return `https://www.zeptonow.com/search?query=${encodedItem}&address=${encodedLocation}`
    default:
      return `https://${platform}.com/search?items=${encodedItem}&location=${encodedLocation}`
  }
}

function buildResult(platform, items, location, overrides = {}) {
  const normalizedItems = Array.isArray(items) ? items : [items]
  const lineItems = overrides.lineItems ?? buildLineItems(platform, normalizedItems, location)
  const subtotal = overrides.subtotal ?? lineItems.reduce((sum, line) => sum + line.price, 0)
  const tax = overrides.tax ?? Math.round(subtotal * 0.05)
  const deliveryFee = overrides.deliveryFee ?? (normalizedItems.length > 2 ? 20 : 35)
  const discounts = overrides.discounts ?? deriveDiscounts(platform, subtotal, location, normalizedItems.length)
  const discountTotal = discounts.reduce((sum, discount) => sum + discount.amount, 0)
  const deliveryTimeSeed = hashNumber(platform, normalizedItems.join('-'), location, 2)
  const deliveryTime = overrides.deliveryTime ?? `${25 + (deliveryTimeSeed % 10)}-${35 + (deliveryTimeSeed % 12)} min`
  const fallback = fallbackLink(platform, normalizedItems[0], location)
  const deepLink = overrides.link ?? fallback
  const totalBeforeDiscount = subtotal + deliveryFee + tax
  const total = Math.max(totalBeforeDiscount - discountTotal, 0)
  return {
    platform,
    items: normalizedItems,
    lineItems,
    subtotal,
    deliveryTime,
    deliveryFee,
    tax,
    discounts,
    discountTotal,
    link: deepLink,
    total
  }
}

function enrichResult(platform, items, location, html, pageUrl) {
  const normalizedItems = Array.isArray(items) ? items : [items]
  const price = parsePrice(html)
  const deliveryTime = normalizeWindow(html)
  return buildResult(platform, normalizedItems, location, {
    subtotal: price ?? undefined,
    deliveryTime: deliveryTime ?? undefined,
    link: pageUrl
  })
}

module.exports = {
  buildResult,
  enrichResult,
  pickUserAgent,
  randomViewport,
  runWithRetries
}
