"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PlatformCard from './PlatformCard'
import { compareCart } from '../lib/api'
import type { ComparisonResponse, PlatformResult } from '../lib/types'
import { encodePayload } from '../lib/payload'

type Props = {
  item: string
  items?: string[]
  location: string
}

type State = {
  data?: ComparisonResponse
  error?: string
  loading: boolean
}

const initialState: State = {
  loading: true
}

const platformOrder: PlatformResult['platform'][] = ['zomato', 'swiggy', 'blinkit', 'zepto']

export default function CompareResults({ item, items = [], location }: Props) {
  const [state, setState] = useState<State>(initialState)
  const payloadItems = items.length ? items : [item]
  const cartKey = JSON.stringify(payloadItems)

  useEffect(() => {
    let cancelled = false
    compareCart(payloadItems, location)
      .then((payload) => {
        if (!cancelled) {
          setState({ data: payload, loading: false })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ error: error.message || 'Failed to compare', loading: false })
        }
      })
    return () => {
      cancelled = true
    }
  }, [cartKey, location])

  if (state.loading) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-semibold text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
          Crunching fresh menu data for {item}
        </p>
        <div className="w-12 h-12 border-4 border-white/80 border-b-transparent rounded-full animate-spin" />
      </section>
    )
  }

  if (state.error || !state.data) {
    return (
      <section className="max-w-3xl mx-auto text-center py-16 space-y-4">
        <p className="text-2xl font-semibold text-[#dc2626]">Unable to compare right now</p>
        <p className="text-[#475569]">{state.error}</p>
        <Link href="/" className="inline-flex px-6 py-3 rounded-xl bg-[#1d4ed8] text-white font-semibold">
          Try again
        </Link>
      </section>
    )
  }

  const { data } = state
  const payload = encodePayload(data)
  const sortedResults = [...data.results].sort(
    (a, b) => platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform)
  )
  const availablePlatforms = sortedResults.filter((platform) => platform.serviceable !== false)
  const bestPlatformServiceable = data.bestPlatform.serviceable !== false
  const disableRecommendation = availablePlatforms.length === 0 || !bestPlatformServiceable
  const locationDetails = data.locationDetails
  const locationLine = locationDetails?.displayName || data.location
  const locationHint = locationDetails?.pincode
    ? `${locationLine} · ${locationDetails.pincode}`
    : locationLine
  const primaryItem = data.items[0] || item
  const extraCount = Math.max(data.items.length - 1, 0)
  const headingTitle = extraCount > 0 ? `${primaryItem} +${extraCount}` : primaryItem

  return (
    <div className="space-y-10">
      <header className="bg-white rounded-3xl shadow-sm p-8 flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.4em] text-[#94a3b8]">Comparison results</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">{headingTitle}</h2>
          <p className="text-base text-[#475569]">Delivering around {locationHint}</p>
          <div className="flex flex-wrap gap-2">
            {data.items.map((value) => (
              <span key={value} className="px-3 py-1 rounded-full bg-[#f1f5f9] text-sm text-[#0f172a]">
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {availablePlatforms.length ? (
            <div className="badge-soft-orange rounded-2xl px-5 py-3">
              Best platform: <strong className="capitalize">{data.bestPlatform.platform}</strong>
            </div>
          ) : (
            <div className="badge-soft-red rounded-2xl px-5 py-3">
              No platforms currently available in this area
            </div>
          )}
          <div className="badge-soft-orange rounded-2xl px-5 py-3">
            Saves up to ₹{data.breakdown.difference.toFixed(0)}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={disableRecommendation ? '#' : `/recommend?payload=${payload}`}
            aria-disabled={disableRecommendation}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold ${
              disableRecommendation
                ? 'btn-primary cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {disableRecommendation ? 'No recommendation available' : 'View recommendation →'}
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl link-outline"
          >
            View search history
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedResults.map((platform) => (
          <PlatformCard
            key={platform.platform}
            platform={platform}
            highlight={platform.platform === data.bestPlatform.platform && bestPlatformServiceable}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[#94a3b8]">Price difference</p>
          <h3 className="text-2xl font-semibold mt-2">Base + delivery + tax</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={availablePlatforms.length ? availablePlatforms : sortedResults}>
                <XAxis dataKey="platform" tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toFixed(0)}`} />
                <Bar dataKey="total" fill="#1d4ed8" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[#94a3b8]">Delivery times</p>
          <h3 className="text-2xl font-semibold mt-2">Estimated arrival window</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(availablePlatforms.length ? availablePlatforms : sortedResults).map((platform) => ({
                platform: platform.platform,
                minutes: Number(platform.deliveryTime.split('-')[0] || '0')
              }))}>
                <XAxis dataKey="platform" tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value} min`} />
                <Bar dataKey="minutes" fill="#10b981" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}
