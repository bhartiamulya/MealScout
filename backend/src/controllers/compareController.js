const compareService = require('../services/compareService')

exports.compare = async (req, res, next) => {
  try {
    const { item, items, location } = req.validated.body
    const result = await compareService.compare({ item, items, location })
    res.json(result)
  } catch (error) {
    next(error)
  }
}
