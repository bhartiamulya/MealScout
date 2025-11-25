export function encodePayload<T>(data: T) {
  const json = JSON.stringify(data)
  if (typeof window === 'undefined') {
    return encodeURIComponent(Buffer.from(json).toString('base64'))
  }
  return encodeURIComponent(btoa(json))
}

export function decodePayload<T>(value: string): T {
  if (!value) {
    throw new Error('Missing payload')
  }
  const decoded = decodeURIComponent(value)
  const json = typeof window === 'undefined' ? Buffer.from(decoded, 'base64').toString() : atob(decoded)
  return JSON.parse(json)
}
