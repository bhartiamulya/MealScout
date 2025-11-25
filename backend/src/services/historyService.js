const ResultHistory = require('../models/ResultHistory')
const Query = require('../models/Query')
const { syncHistory } = require('./notionService')

exports.record = async (payload) => {
  await Query.create({ item: payload.item, location: payload.location })
  const entry = await ResultHistory.create({
    item: payload.item,
    location: payload.location,
    locationDetails: payload.locationDetails,
    bestPlatform: payload.bestPlatform.platform,
    bestPlatformTotal: payload.bestPlatform.total,
    results: payload.results.map((result) => ({
      platform: result.platform,
      subtotal: result.subtotal,
      lineItems: result.lineItems,
      discounts: result.discounts,
      discountTotal: result.discountTotal,
      deliveryFee: result.deliveryFee,
      tax: result.tax,
      deliveryTime: result.deliveryTime,
      link: result.link,
      total: result.total,
      serviceable: result.serviceable,
      unavailableReason: result.unavailableReason
    }))
  })
  syncHistory(payload)
  return entry
}

exports.list = async () => ResultHistory.find().sort({ createdAt: -1 }).limit(25).lean()
