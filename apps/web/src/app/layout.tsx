import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { KHU_PHO } from '@/lib/khu-pho'

const beVietnamPro = Be_Vietnam_Pro({
  subsets:  ['vietnamese', 'latin'],
  weight:   ['300', '400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${KHU_PHO.ma} Smart Community`,
    default:  `${KHU_PHO.ma} Smart Community OS - ${KHU_PHO.ten} ${KHU_PHO.phuong.replace(/^Phường\s+/, '')}`,
  },
  description:
    `Hệ điều hành số cộng đồng ${KHU_PHO.ten}, ${KHU_PHO.phuong}, TP.HCM. Phản ánh hiện trường, tra cứu thông tin, AI hỗ trợ 24/7.`,
  keywords: [KHU_PHO.ten.toLowerCase(), 'long trường', 'smart community', 'chuyển đổi số', 'phản ánh hiện trường'],
  authors:  [{ name: `${KHU_PHO.ma} Smart Community OS` }],
  robots:   'index, follow',
  openGraph: {
    title:       `${KHU_PHO.ma} Smart Community OS`,
    description: `Hệ điều hành số cộng đồng ${KHU_PHO.ten}, ${KHU_PHO.phuong}, TP.HCM`,
    locale:      'vi_VN',
    type:        'website',
  },
}

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  themeColor:    '#8B1A1A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={beVietnamPro.variable}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        {/* PWA meta — cả hai variant để tránh cảnh báo Chrome */}
        <meta name="mobile-web-app-capable"       content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title"   content={KHU_PHO.ma} />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background:  '#1E3A5F',
              color:       '#fff',
              borderRadius:'12px',
              fontSize:    '14px',
              fontFamily:  'var(--font-be-vietnam-pro), Be Vietnam Pro, sans-serif',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              style:     { background: '#8B1A1A' },
              iconTheme: { primary: '#fca5a5', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
