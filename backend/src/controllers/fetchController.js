const mcpClient = require('../services/mcpClient')

exports.fetch = async (req, res, next) => {
  try {
    const { platform } = req.validated.params
    const { item, location } = req.validated.body
    const result = await mcpClient.fetchPlatform(platform, item, location)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
