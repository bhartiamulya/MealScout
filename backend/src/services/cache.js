const env = require('../config/env')

const store = new Map()

function keyFor(item, location) {
  return `${item.toLowerCase()}::${location.toLowerCase()}`
}

exports.get = (item, location) => {
  const key = keyFor(item, location)
  const record = store.get(key)
  if (!record) {
    return null
  }
  if (record.expires < Date.now()) {
    store.delete(key)
    return null
  }
  return record.value
}

exports.set = (item, location, value) => {
  const key = keyFor(item, location)
  store.set(key, {
    value,
    expires: Date.now() + env.cacheTtlMinutes * 60 * 1000
  })
}
