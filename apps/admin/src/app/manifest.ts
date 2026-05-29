import type { MetadataRoute } from 'next'

// Next.js tự serve file này tại /manifest.webmanifest
// với Content-Type: application/manifest+json (đúng chuẩn)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'KP25 Admin — Hệ thống điều hành',
    short_name:       'KP25 Admin',
    description:      'Hệ thống quản trị thông minh dành cho cán bộ Khu phố 25, Phường Long Trường, TP.HCM',
    start_url:        '/dashboard',
    scope:            '/',
    display:          'standalone',
    orientation:      'any',
    theme_color:      '#1E3A5F',
    background_color: '#ffffff',
    lang:             'vi',
    categories:       ['government', 'productivity', 'utilities'],
    icons: [
      { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'any'          },
      { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'any'          },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any'          },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any'          },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any'          },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable'     },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any'          },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'     },
    ],
    shortcuts: [
      {
        name:       'Phản ánh mới',
        short_name: 'Phản ánh',
        url:        '/dashboard/phan-anh/tao',
        icons:      [{ src: '/icons/shortcut-phan-anh.png', sizes: '96x96' }],
      },
      {
        name:       'Bản đồ GIS',
        short_name: 'Bản đồ',
        url:        '/dashboard/ban-do',
        icons:      [{ src: '/icons/shortcut-ban-do.png', sizes: '96x96' }],
      },
      {
        name:       'Sự kiện',
        short_name: 'Sự kiện',
        url:        '/dashboard/su-kien',
        icons:      [{ src: '/icons/shortcut-su-kien.png', sizes: '96x96' }],
      },
    ],
  }
}
