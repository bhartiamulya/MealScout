import type { CitySummary, ComparisonResponse, HistoryEntry, ServiceabilitySummary } from './types'

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Request failed')
  }
  return res.json()
}

export const compareCart = (items: string[], location: string) => {
  const normalized = items.map((value) => value.trim()).filter(Boolean)
  const primary = normalized[0]
  return request<ComparisonResponse>('/compare', {
    method: 'POST',
    body: JSON.stringify({ item: primary, items: normalized, location })
  })
}

export const compareItem = (item: string, location: string) => compareCart([item], location)

export const fetchHistory = () => request<HistoryEntry[]>('/history/list', { method: 'GET' })

export const fetchCitySummary = () => request<CitySummary[]>('/analytics/city-summary', { method: 'GET' })

export const fetchServiceabilitySummary = () =>
  request<ServiceabilitySummary>('/analytics/serviceability-gaps', { method: 'GET' })
