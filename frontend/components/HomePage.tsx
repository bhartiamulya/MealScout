"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const maxCartItems = 5

export default function HomePage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<string[]>([''])
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = cartItems.map((value) => value.trim()).filter(Boolean)
    const deliveryLocation = location.trim()
    if (!normalized.length || !deliveryLocation) {
      return
    }
    setLoading(true)
    const params = new URLSearchParams({ location: deliveryLocation })
    params.set('item', normalized[0])
    normalized.forEach((value) => params.append('items', value))
    router.push(`/compare?${params.toString()}`)
  }

  const updateCartItem = (index: number, value: string) => {
    setCartItems((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const addCartItem = () => {
    if (cartItems.length >= maxCartItems) {
      return
    }
    setCartItems((prev) => [...prev, ''])
  }

  const removeCartItem = (index: number) => {
    if (cartItems.length === 1) {
      return
    }
    setCartItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-[#3c1308]">
      <section className="max-w-xl w-full text-center space-y-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.4)]">
          Compare every delivery app before you place the order
        </h1>
        <form onSubmit={handleSubmit} className="bg-white/85 backdrop-blur-lg border border-white/60 rounded-2xl shadow-xl p-5 space-y-4 text-left">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#8b3f28]">What's in your cart?</span>
            <div className="space-y-3">
              {cartItems.map((value, index) => (
                <div key={`cart-item-${index}`} className="flex items-center gap-3">
                  <input
                    value={value}
                    onChange={(e) => updateCartItem(index, e.target.value)}
                    className="flex-1 border border-[#f5cbb5] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#fb923c] focus:border-[#fb923c]"
                    placeholder={`Item ${index + 1}`}
                  />
                  {cartItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCartItem(index)}
                      className="text-sm font-semibold text-[#e23744] hover:text-[#b81f30]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={addCartItem}
                  disabled={cartItems.length >= maxCartItems}
                  className="text-sm font-semibold text-[#f97316] disabled:text-[#fbcfb0]"
                >
                  + Add another item
                </button>
                <p className="text-xs text-[#c97c5d]">Compare up to {maxCartItems} items.</p>
              </div>
            </div>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#8b3f28]">Deliver to</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-[#f5cbb5] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#fb923c] focus:border-[#fb923c]"
              placeholder="Enter your area, city, or pincode"
            />
          </label>
          <button type="submit" disabled={loading} className="w-full rounded-xl py-3 text-lg font-semibold btn-primary">
            {loading ? 'Crunching numbers...' : 'Compare across apps'}
          </button>
        </form>
      </section>
    </main>
  )
}
