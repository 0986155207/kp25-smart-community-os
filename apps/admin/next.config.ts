import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Leaflet không tương thích React StrictMode (double-mount)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'localhost:3001',
        'admin.kp25-longtruong.net',
        'smart-kp25-admin.vercel.app',
        '*.vercel.app',
      ],
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@kp25/types', '@kp25/config'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── PWA / Service Worker headers ──────────────────────────
  async headers() {
    return [
      {
        // Service Worker: không cache SW file để luôn nhận bản mới nhất
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',   value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          { key: 'Cache-Control',   value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Manifest: cache ngắn
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Cache-Control',   value: 'public, max-age=3600' },
          { key: 'Content-Type',    value: 'application/manifest+json' },
        ],
      },
      {
        // Offline fallback page
        source: '/offline.html',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        // Icons: cache dài
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
