const axios = require('axios')
const env = require('../config/env')

const client = axios.create({
  baseURL: env.mcpServerUrl,
  timeout: 20000,
  headers: {
    'x-scraper-auth': env.scraperAuthToken
  }
})

async function post(path, payload) {
  const { data } = await client.post(path, payload)
  return data
}

exports.fetchPlatform = (platform, item, location) => post(`/fetch/${platform}`, { item, location })

exports.comparePrices = ({ items, location }) => post('/compare', { items, location })

exports.recommendPlatform = (results) => post('/recommend', { results })

exports.saveHistory = (entry) => post('/history/save', entry)

exports.listHistory = () => post('/history/list', {})
