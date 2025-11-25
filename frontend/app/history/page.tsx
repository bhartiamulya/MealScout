import HistoryList from '../../components/HistoryList'
import type { HistoryEntry } from '../../lib/types'

async function loadHistory(): Promise<HistoryEntry[]> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'
  const res = await fetch(`${base}/history/list`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to load history')
  }
  return res.json()
}

export default async function HistoryPage() {
  let entries: HistoryEntry[] = []
  let error: string | null = null

  try {
    entries = await loadHistory()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  return (
    <main className="max-w-5xl mx-auto py-16 px-6 space-y-6">
      <header className="space-y-2 text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
        <p className="text-sm uppercase tracking-[0.4em] text-white/70">History</p>
        <h1 className="text-4xl font-semibold">Your last 25 comparisons</h1>
        <p className="text-white/80">Every run is stored so you can revisit recommendations and monitor price swings.</p>
      </header>
      {error ? (
        <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-[#b91c1c]">
          Couldn’t load history right now. Refresh, or rerun a comparison to generate new entries.
        </div>
      ) : (
        <HistoryList entries={entries} />
      )}
    </main>
  )
}
