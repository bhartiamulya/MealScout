import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Food Price Comparison',
  description: 'Track food delivery prices across every platform'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-[#0f172a]">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative min-h-screen">
          <div className="absolute top-12 left-8 text-white text-2xl font-extrabold tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
            MealScout
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
