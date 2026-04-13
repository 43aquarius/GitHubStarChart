import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitHub 命盤',
  description: '用中国古代星宿解读你的GitHub轨迹',
  manifest: '/manifest.json',
  openGraph: {
    title: 'GitHub 命盤',
    description: '输入GitHub用户名，生成你的专属星宿命盘',
  },
}

export const viewport: Viewport = {
  themeColor: '#050510',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
