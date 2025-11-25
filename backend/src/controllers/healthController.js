exports.ping = (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
}
