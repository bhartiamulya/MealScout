import Link from 'next/link'

export default function OrderRedirectPage({ searchParams }: { searchParams: Record<string, string> }) {
  const link = searchParams.link
  const platform = searchParams.platform

  if (!link || !platform) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p className="text-2xl font-semibold">Missing order link</p>
        <Link href="/" className="inline-flex px-6 py-3 rounded-2xl bg-[#1d4ed8] text-white font-semibold">
          Go home
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-6 space-y-6 text-center">
      <p className="text-sm uppercase tracking-[0.4em] text-[#94a3b8]">Redirecting</p>
      <h1 className="text-4xl font-semibold">Order on {platform}</h1>
      <p className="text-lg text-[#475569]">We generated the best link for you. Open it below and complete the order.</p>
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex px-6 py-3 rounded-2xl bg-[#1d4ed8] text-white font-semibold"
      >
        Open {platform}
      </Link>
    </main>
  )
}
