import Link from 'next/link'
import type { ComparisonResponse } from '../lib/types'
import { encodePayload } from '../lib/payload'

type Props = {
  data: ComparisonResponse
}

function platformTitle(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function RecommendationPanel({ data }: Props) {
  const { bestPlatform } = data
  const reasons = [
    `Total cost ₹${bestPlatform.total.toFixed(0)} (includes delivery and tax)`,
    `Delivery window ${bestPlatform.deliveryTime}`,
    `You save up to ₹${data.breakdown.difference.toFixed(0)} versus other apps`
  ]

  return (
    <section className="bg-black/35 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg p-8 space-y-6 text-white">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/70">Redirecting</p>
        <h1 className="text-4xl font-extrabold drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
          Order on {platformTitle(bestPlatform.platform)}
        </h1>
        <p className="text-lg text-white/80 drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
          We generated the best link for you. Open it below and complete the order.
        </p>
      </header>

      <div className="space-y-3 text-left">
        {reasons.map((reason) => (
          <div key={reason} className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-[#f97316] mt-1" />
            <p className="text-base text-white/90 drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)]">{reason}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href={`/order?link=${encodeURIComponent(bestPlatform.link)}&platform=${bestPlatform.platform}`}
          className="inline-flex px-6 py-3 rounded-2xl bg-white text-[#0f172a] font-semibold shadow-lg"
        >
          Open {platformTitle(bestPlatform.platform)}
        </Link>
        <Link
          href={`/compare?item=${encodeURIComponent(data.item)}&location=${encodeURIComponent(data.location)}`}
          className="inline-flex px-6 py-3 rounded-2xl border border-white/40 text-white/80"
        >
          Run again
        </Link>
      </div>
    </section>
  )
}
