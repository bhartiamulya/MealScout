const historyService = require('../services/historyService')

exports.list = async (_req, res, next) => {
  try {
    const entries = await historyService.list()
    res.json(entries)
  } catch (error) {
    next(error)
  }
}

exports.save = async (req, res, next) => {
  try {
    const entry = await historyService.record(req.validated.body)
    res.status(201).json(entry)
  } catch (error) {
    next(error)
  }
}
