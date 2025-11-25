const analyticsService = require('../services/analyticsService')

exports.citySummary = async (_req, res, next) => {
  try {
    const summary = await analyticsService.citySummary()
    res.json(summary)
  } catch (error) {
    next(error)
  }
}

exports.serviceabilityGaps = async (_req, res, next) => {
  try {
    const summary = await analyticsService.serviceabilityGaps()
    res.json(summary)
  } catch (error) {
    next(error)
  }
}
