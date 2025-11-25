import Link from 'next/link'
import type { PlatformResult } from '../lib/types'

type Props = {
  platform: PlatformResult
  highlight?: boolean
}

export default function PlatformCard({ platform, highlight }: Props) {
  const lineItems = platform.lineItems || []
  const availableCount = lineItems.filter((item) => item.inStock).length
  const previewItems = lineItems.slice(0, 3)
  const remainingItems = Math.max(lineItems.length - previewItems.length, 0)
  const discountBadges = platform.discounts.slice(0, 3)
  const serviceable = platform.serviceable !== false
  const cardTone = highlight && serviceable ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]' : 'bg-white border-[#e2e8f0]'
  const mutedText = highlight ? 'text-white/80' : 'text-[#475569]'
  const badgeTone = highlight ? 'bg-white/20 border-white/40 text-white' : 'bg-[#f1f5f9] border-[#cbd5f5] text-[#0f172a]'

  return (
    <div className={`rounded-2xl p-5 border transition ${cardTone}`}>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold capitalize">{platform.platform}</p>
        <p className="text-2xl font-bold">₹{platform.total.toFixed(0)}</p>
      </div>
      <p className={`text-sm mt-1 ${mutedText}`}>
        Subtotal ₹{platform.subtotal.toFixed(0)} · Delivery ₹{platform.deliveryFee.toFixed(0)} · Tax ₹
        {platform.tax.toFixed(0)}
      </p>
      <p className={`text-sm ${mutedText}`}>ETA {platform.deliveryTime}</p>
      {!serviceable && (
        <p className="mt-2 text-sm text-[#b91c1c]">
          {platform.unavailableReason || 'Unavailable in this area.'}
        </p>
      )}

      <div className="mt-4 space-y-2">
        <p className={`text-xs uppercase tracking-[0.3em] ${highlight ? 'text-white/80' : 'text-[#94a3b8]'}`}>Cart items</p>
        <ul className="space-y-1 text-sm">
          {previewItems.map((item) => (
            <li key={`${platform.platform}-${item.name}`} className="flex items-center justify-between gap-3">
              <span
                className={`flex items-center gap-2 ${item.inStock ? 'text-current' : highlight ? 'text-[#fde68a]' : 'text-[#b45309]'}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-[#22c55e]' : 'bg-[#f97316]'}`}
                />
                {item.name}
                {!item.inStock && item.replacement && (
                  <span className={`text-xs ${mutedText}`}>→ {item.replacement}</span>
                )}
              </span>
              <span className={mutedText}>₹{item.price.toFixed(0)}</span>
            </li>
          ))}
        </ul>
        {remainingItems > 0 && (
          <p className={`text-xs ${mutedText}`}>+ {remainingItems} more item(s) in this cart</p>
        )}
        <p className={`text-xs ${mutedText}`}>
          Availability: {availableCount}/{lineItems.length || 0} in stock
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <p className={`text-xs uppercase tracking-[0.3em] ${highlight ? 'text-white/80' : 'text-[#94a3b8]'}`}>
          Coupons & promos
        </p>
        {discountBadges.length ? (
          <div className="flex flex-wrap gap-2">
            {discountBadges.map((discount, idx) => (
              <span key={`${platform.platform}-discount-${idx}`} className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs ${badgeTone}`}>
                {discount.code ? discount.code : discount.type}
                <span className="font-semibold">₹{discount.amount.toFixed(0)}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-xs ${mutedText}`}>No active promos detected</p>
        )}
        {platform.discountTotal > 0 && (
          <p className={`text-xs font-medium ${mutedText}`}>Total savings: ₹{platform.discountTotal.toFixed(0)}</p>
        )}
      </div>

      <Link
        href={serviceable ? { pathname: '/order', query: { link: platform.link, platform: platform.platform } } : '#'}
        aria-disabled={!serviceable}
        className={`inline-flex mt-5 px-4 py-2 rounded-xl text-sm font-semibold ${
          serviceable
            ? highlight
              ? 'bg-white text-[#1d4ed8]'
              : 'bg-[#1d4ed8] text-white'
            : 'bg-[#cbd5f5] text-[#64748b] cursor-not-allowed'
        }`}
      >
        {serviceable ? `Order on ${platform.platform}` : 'Not available here'}
      </Link>
    </div>
  )
}
