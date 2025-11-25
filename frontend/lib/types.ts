export type PlatformId = 'zomato' | 'swiggy' | 'blinkit' | 'zepto'

export type LocationDetails = {
  raw?: string
  displayName?: string
  city?: string | null
  state?: string | null
  pincode?: string | null
  source?: string | null
}

export type LineItem = {
  name: string
  price: number
  inStock: boolean
  replacement?: string | null
}

export type Discount = {
  type: string
  code?: string
  description?: string
  amount: number
}

export type PlatformResult = {
  platform: PlatformId
  items: string[]
  lineItems: LineItem[]
  subtotal: number
  discounts: Discount[]
  discountTotal: number
  deliveryTime: string
  deliveryFee: number
  tax: number
  link: string
  total: number
  serviceable?: boolean
  unavailableReason?: string | null
}

export type ComparisonResponse = {
  item: string
  items: string[]
  location: string
  locationDetails?: LocationDetails | null
  results: PlatformResult[]
  bestPlatform: PlatformResult
  breakdown: {
    cheapest: number
    fastest: number
    difference: number
  }
}

export type HistoryEntry = {
  _id: string
  item: string
  location: string
  locationDetails?: LocationDetails | null
  bestPlatform: PlatformId
  bestPlatformTotal: number
  results: PlatformResult[]
  createdAt: string
}

export type CityPlatformStats = {
  platform: PlatformId
  appearances: number
  winRate: number
  avgTotal: number
  couponRate: number
}

export type CitySummary = {
  city: string
  totalComparisons: number
  avgCartTotal: number
  avgSavingsPotential: number
  couponUsageRate: number
  bestPlatform: CityPlatformStats | null
  cheapestPlatform: CityPlatformStats | null
  platforms: CityPlatformStats[]
}

export type ServiceabilityHotspot = {
  platform: PlatformId
  locationLabel: string
  pincode?: string
  city?: string
  state?: string
  reason?: string
  occurrences: number
  lastSeen: string
}

export type ServiceabilitySummary = {
  hotspots: ServiceabilityHotspot[]
  totals: { platform: PlatformId; occurrences: number }[]
}
