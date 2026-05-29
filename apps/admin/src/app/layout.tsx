import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PWAManager from '@/components/pwa/PWAManager'

const beVietnamPro = Be_Vietnam_Pro({
  subsets:  ['vietnamese', 'latin'],
  weight:   ['300', '400', '500', '600', '700', '800'],
  display:  'swap',
  variable: '--font-be-vietnam-pro',
})

export const viewport: Viewport = {
  themeColor:           '#1E3A5F',
  width:                'device-width',
  initialScale:         1,
  maximumScale:         1,
  userScalable:         false,
  viewportFit:          'cover',
}

export const metadata: Metadata = {
  title: {
    template: '%s | KP25 Admin',
    default:  'KP25 Admin — Hệ thống điều hành Khu phố 25',
  },
  description:  'Hệ thống quản trị thông minh dành cho cán bộ Khu phố 25, Phường Long Trường, TP.HCM',
  // manifest được handle tự động bởi src/app/manifest.ts — không khai báo ở đây để tránh duplicate
  robots:       'noindex, nofollow',
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'KP25 Admin',
    startupImage:    '/icons/icon-512x512.png',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#1E3A5F' },
    ],
  },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth" className={beVietnamPro.variable}>
      <head>

        {/* PWA / iOS meta */}
        <meta name="mobile-web-app-capable"                content="yes" />
        <meta name="apple-mobile-web-app-capable"          content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"            content="KP25 Admin" />
        <meta name="application-name"                      content="KP25 Admin" />
        <meta name="msapplication-TileColor"               content="#1E3A5F" />
        <meta name="msapplication-TileImage"               content="/icons/icon-144x144.png" />
        <meta name="format-detection"                      content="telephone=no" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

        {/* PWA: service worker + install prompt + offline banner */}
        <PWAManager />
      </body>
    </html>
  )
}
