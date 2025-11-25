import CityPerformanceChart from '../../components/CityPerformanceChart'
import type { CitySummary, ServiceabilitySummary } from '../../lib/types'

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'

async function loadCitySummary(): Promise<CitySummary[]> {
  const res = await fetch(`${base}/analytics/city-summary`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to load analytics')
  }
  return res.json()
}

async function loadServiceabilitySummary(): Promise<ServiceabilitySummary> {
  const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'
  const res = await fetch(`${base}/analytics/serviceability-gaps`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to load serviceability insights')
  }
  return res.json()
}

function currency(value: number) {
  return `₹${value.toFixed(0)}`
}

function percent(value: number) {
  return `${(value * 100).toFixed(0)}%`
}

function dateTime(value: string) {
  return new Date(value).toLocaleString()
}

function summaryCard(label: string, value: string, helper: string) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">{label}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
      <p className="text-sm text-[#475569] mt-1">{helper}</p>
    </div>
  )
}

export default async function AnalyticsPage() {
  let summary: CitySummary[] = []
  let error: string | null = null
  let serviceability: ServiceabilitySummary | null = null
  let serviceabilityError: string | null = null

  try {
    summary = await loadCitySummary()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  try {
    serviceability = await loadServiceabilitySummary()
  } catch (err) {
    serviceabilityError = err instanceof Error ? err.message : 'Unknown error'
  }

  const chartData = summary.slice(0, 6).map((city) => ({
    city: city.city,
    avgTotal: Math.round(city.avgCartTotal),
    savings: Math.round(city.avgSavingsPotential)
  }))

  const sortedByComparisons = [...summary].sort((a, b) => b.totalComparisons - a.totalComparisons)
  const sortedBySavings = [...summary].sort((a, b) => b.avgSavingsPotential - a.avgSavingsPotential)
  const sortedByCoupons = [...summary].sort((a, b) => b.couponUsageRate - a.couponUsageRate)

  const busiestCity = sortedByComparisons[0]
  const biggestSavings = sortedBySavings[0]
  const couponChampion = sortedByCoupons[0]

  return (
    <main className="max-w-6xl mx-auto py-16 px-6 space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-[#94a3b8]">City analytics</p>
        <h1 className="text-4xl font-semibold">Where should you order next?</h1>
        <p className="text-[#475569]">
          We look at the last 200 live comparisons to highlight the most competitive cities, average cart totals, and
          coupon-heavy platforms.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-[#b91c1c]">{error}</div>
      ) : summary.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5f5] p-6 text-center text-[#475569]">
          Run a few comparisons to unlock analytics.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summaryCard(
              'Busiest city',
              busiestCity ? busiestCity.city : '—',
              busiestCity ? `${busiestCity.totalComparisons} recent comparisons` : 'No data'
            )}
            {summaryCard(
              'Biggest savings',
              biggestSavings ? biggestSavings.city : '—',
              biggestSavings ? `${currency(biggestSavings.avgSavingsPotential)} avg savings` : 'No data'
            )}
            {summaryCard(
              'Coupon champion',
              couponChampion ? couponChampion.city : '—',
              couponChampion ? `${percent(couponChampion.couponUsageRate)} of carts with promos` : 'No data'
            )}
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">City performance</p>
                <h2 className="text-2xl font-semibold mt-1">Average cart totals vs savings</h2>
              </div>
            </div>
            <div className="mt-4">
              <CityPerformanceChart data={chartData} />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">City table</p>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-[#94a3b8]">
                    <th className="py-2 pr-4">City</th>
                    <th className="py-2 pr-4">Best platform</th>
                    <th className="py-2 pr-4">Cheapest platform</th>
                    <th className="py-2 pr-4">Avg cart</th>
                    <th className="py-2 pr-4">Avg savings</th>
                    <th className="py-2 pr-4">Coupon usage</th>
                    <th className="py-2 pr-4">Comparisons</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((city) => (
                    <tr key={city.city} className="border-t border-[#e2e8f0]">
                      <td className="py-3 pr-4 font-medium">{city.city}</td>
                      <td className="py-3 pr-4 capitalize">
                        {city.bestPlatform ? `${city.bestPlatform.platform} · ${percent(city.bestPlatform.winRate)}` : '—'}
                      </td>
                      <td className="py-3 pr-4 capitalize">
                        {city.cheapestPlatform
                          ? `${city.cheapestPlatform.platform} · ${currency(city.cheapestPlatform.avgTotal)}`
                          : '—'}
                      </td>
                      <td className="py-3 pr-4">{currency(city.avgCartTotal)}</td>
                      <td className="py-3 pr-4">{currency(city.avgSavingsPotential)}</td>
                      <td className="py-3 pr-4">{percent(city.couponUsageRate)}</td>
                      <td className="py-3 pr-4">{city.totalComparisons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Serviceability hotspots</p>
            <h2 className="text-2xl font-semibold mt-1">Where users can’t order yet</h2>
          </div>
          {serviceabilityError && <p className="text-sm text-[#b91c1c]">{serviceabilityError}</p>}
        </div>
        {serviceability && serviceability.hotspots.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[#94a3b8]">
                  <th className="py-2 pr-4">Platform</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Reason</th>
                  <th className="py-2 pr-4">Occurrences</th>
                  <th className="py-2 pr-4">Last reported</th>
                </tr>
              </thead>
              <tbody>
                {serviceability.hotspots.slice(0, 8).map((hotspot) => (
                  <tr key={`${hotspot.platform}-${hotspot.locationLabel}`} className="border-t border-[#e2e8f0]">
                    <td className="py-3 pr-4 capitalize">{hotspot.platform}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{hotspot.locationLabel}</div>
                      <div className="text-xs text-[#475569]">
                        {[hotspot.city, hotspot.state, hotspot.pincode].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[#475569]">{hotspot.reason || 'Unavailable'}</td>
                    <td className="py-3 pr-4">{hotspot.occurrences}</td>
                    <td className="py-3 pr-4 text-[#475569]">{dateTime(hotspot.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#475569] mt-4">No coverage gaps captured yet.</p>
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Platform coverage gaps</p>
        {serviceability && serviceability.totals.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {serviceability.totals.map((entry) => (
              <div key={entry.platform} className="border border-[#e2e8f0] rounded-2xl p-4">
                <p className="text-sm text-[#94a3b8] uppercase tracking-[0.3em]">{entry.platform}</p>
                <p className="text-3xl font-semibold mt-2">{entry.occurrences}</p>
                <p className="text-sm text-[#475569]">Recent unavailable reports</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#475569] mt-4">No recent serviceability issues recorded.</p>
        )}
      </section>
    </main>
  )
}
