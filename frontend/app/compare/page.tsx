import CompareResults from '../../components/CompareResults'

type SearchParams = {
  item?: string
  location?: string
  items?: string | string[]
}

export default function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const item = searchParams.item
  const location = searchParams.location
  const itemsParam = searchParams.items
  const items = Array.isArray(itemsParam) ? itemsParam : itemsParam ? [itemsParam] : undefined

  if (!item || !location) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p className="text-2xl font-semibold">Missing details</p>
        <p className="text-[#475569]">Provide both an item and a location to compare.</p>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto py-16 px-6">
      <CompareResults item={item} items={items} location={location} />
    </main>
  )
}
