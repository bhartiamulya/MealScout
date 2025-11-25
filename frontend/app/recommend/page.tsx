import { decodePayload } from '../../lib/payload'
import type { ComparisonResponse } from '../../lib/types'
import RecommendationPanel from '../../components/RecommendationPanel'
import PlatformCard from '../../components/PlatformCard'

export default function RecommendPage({ searchParams }: { searchParams: Record<string, string> }) {
  const encoded = searchParams.payload
  if (!encoded) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p className="text-2xl font-semibold">Missing payload</p>
        <p className="text-[#475569]">Generate a comparison first.</p>
      </main>
    )
  }

  const data = decodePayload<ComparisonResponse>(encoded)

  return (
    <main className="max-w-5xl mx-auto py-16 px-6 space-y-10">
      <RecommendationPanel data={data} />
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.results.map((platform) => (
          <PlatformCard key={platform.platform} platform={platform} highlight={platform.platform === data.bestPlatform.platform} />
        ))}
      </section>
    </main>
  )
}
