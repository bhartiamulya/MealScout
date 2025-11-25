import Link from 'next/link'
import type { HistoryEntry, PlatformResult } from '../lib/types'

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleString()
}

function currency(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '₹—'
  }
  return `₹${value.toFixed(0)}`
}

function getResults(entry: HistoryEntry): PlatformResult[] {
  return Array.isArray(entry.results) ? entry.results : []
}

function resolveBest(entry: HistoryEntry): PlatformResult | undefined {
  const results = getResults(entry)
  return results.find((result) => result.platform === entry.bestPlatform) ?? results[0]
}

function resolveSavings(entry: HistoryEntry) {
  const totals = getResults(entry).map((result) => result.total)
  if (!totals.length) {
    return 0
  }
  return Math.max(...totals) - Math.min(...totals)
}

type Props = {
  entries: HistoryEntry[]
}

export default function HistoryList({ entries }: Props) {
  if (!entries.length) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-[#475569]">No history yet. Start comparing dishes.</p>
        <Link
          href="/"
          className="inline-flex mt-4 px-6 py-3 rounded-2xl bg-[#1d4ed8] text-white font-semibold"
        >
          New comparison
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => {
        const results = getResults(entry)
        const best = resolveBest(entry)
        const savings = resolveSavings(entry)
        const items = best?.items ?? []
        const lineItems = best?.lineItems ?? []
        const availabilityCount = lineItems.filter((item) => item?.inStock).length
        const availabilityTotal = lineItems.length
        const discounts = best?.discounts?.slice(0, 3) ?? []
        const ranked = [...results].sort((a, b) => a.total - b.total)

        return (
          <li key={entry._id} className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{entry.item}</p>
                <p className="text-sm text-[#475569]">{entry.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-[0.3em] text-[#94a3b8]">Best platform</p>
                <p className="text-lg font-semibold capitalize">
                  {entry.bestPlatform} · {best ? currency(best.total) : '—'}
                </p>
                {savings > 0 && <p className="text-xs text-[#22c55e]">Saved up to {currency(savings)}</p>}
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] mt-2">{formatTime(entry.createdAt)}</p>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Cart</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {items.map((item) => (
                    <span key={`${entry._id}-${item}`} className="px-3 py-1 rounded-full bg-[#f1f5f9] text-sm text-[#0f172a]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {best && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="bg-[#f8fafc] rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Fees breakdown</p>
                    <p className="text-sm text-[#0f172a] mt-2">
                      Subtotal {currency(best.subtotal)} · Delivery {currency(best.deliveryFee)} · Tax {currency(best.tax)}
                    </p>
                    <p className="text-xs text-[#475569] mt-1">Total {currency(best.total)}</p>
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Availability</p>
                    <p className="text-sm text-[#0f172a] mt-2">
                      {availabilityCount}/{availabilityTotal} line items in stock
                    </p>
                    {lineItems.slice(0, 2).map((item) => (
                      <p key={`${entry._id}-${item.name}`} className="text-xs text-[#475569]">
                        {item.name} · {item.inStock ? 'Available' : `OOS → ${item.replacement || 'Suggest alt'}`}
                      </p>
                    ))}
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Coupons</p>
                    {discounts.length ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {discounts.map((discount, idx) => (
                          <span
                            key={`${entry._id}-discount-${idx}`}
                            className="px-3 py-1 rounded-full bg-[#ecfccb] text-xs text-[#365314] font-medium"
                          >
                            {discount.code || discount.type}: {currency(discount.amount)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#475569] mt-2">No promos captured</p>
                    )}
                    {best?.discountTotal && best.discountTotal > 0 && (
                      <p className="text-xs text-[#16a34a] mt-2">Total savings {currency(best.discountTotal)}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">All platforms</p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ranked.map((result) => (
                    <div
                      key={`${entry._id}-${result.platform}`}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        result.platform === entry.bestPlatform ? 'border-[#1d4ed8] bg-[#eef2ff]' : 'border-[#e2e8f0]'
                      }`}
                    >
                      <p className="font-semibold capitalize">{result.platform}</p>
                      <p className="text-[#0f172a]">{currency(result.total)}</p>
                      <p className="text-xs text-[#475569]">ETA {result.deliveryTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
