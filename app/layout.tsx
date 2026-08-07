import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Nunito } from 'next/font/google'
import { BottomNav } from '@/components/bottom-nav'
import './globals.css'

const _nunito = Nunito({ subsets: ['latin'], display: 'swap' })
const _fraunces = Fraunces({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Jasdor by Esaashop',
  description: 'Pencatat nomor telepon penjualan kopi — 5 room, 3 nomor tiap room.',
  applicationName: 'Jasdor',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Jasdor',
    statusBarStyle: 'default',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon-512.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f1e5d3',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-background">
      <body className="bg-background text-foreground font-sans antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-md pb-24">{children}</div>
        <BottomNav />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
