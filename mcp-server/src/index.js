const express = require('express')
const pinoHttp = require('pino-http')
const cors = require('cors')
const env = require('./env')
const router = require('./router')

const app = express()
const logger = pinoHttp()

app.use(cors())
app.use(express.json())
app.use(logger)
app.use((req, res, next) => {
  if (req.header('x-scraper-auth') !== env.token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return next()
})
app.use(router)

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message || 'MCP error' })
})

app.listen(env.port, () => {
  process.stdout.write(`MCP server running on ${env.port}\n`)
})
