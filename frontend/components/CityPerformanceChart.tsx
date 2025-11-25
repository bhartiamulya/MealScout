"use client"

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type CityChartDatum = {
  city: string
  avgTotal: number
  savings: number
}

type Props = {
  data: CityChartDatum[]
}

export default function CityPerformanceChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[#475569]">
        Not enough data yet — run a few comparisons to unlock insights.
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="city" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `₹${value}`} />
          <Tooltip formatter={(value: number) => `₹${value.toFixed(0)}`} labelStyle={{ fontWeight: 600 }} />
          <Legend />
          <Bar dataKey="avgTotal" name="Avg cart" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
          <Bar dataKey="savings" name="Savings" fill="#22c55e" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
