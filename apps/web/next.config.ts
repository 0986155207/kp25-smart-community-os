import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Leaflet không tương thích React StrictMode (double-mount)
  transpilePackages: ['@kp25/types', '@kp25/config'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'maps.geoapify.com',
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        // Local
        'localhost:3000',
        // Production (Vercel)
        'smart-kp25-web.vercel.app',
        // Preview deployments (Vercel)
        '*.vercel.app',
      ],
    },
  },

  // Tắt build errors từ ESLint (CI xử lý riêng)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
