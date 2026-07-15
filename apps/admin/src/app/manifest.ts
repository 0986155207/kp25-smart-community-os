import type { MetadataRoute } from 'next'
import { KHU_PHO } from '@/lib/khu-pho'

// Next.js tự serve file này tại /manifest.webmanifest
// với Content-Type: application/manifest+json (đúng chuẩn).
// Nội dung SINH ĐỘNG theo khu phố của deployment (biến NEXT_PUBLIC_KP_*),
// icon dùng route sinh động /icon và /apple-icon → mỗi khu phố có icon riêng.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             `${KHU_PHO.ma} Admin — Hệ thống điều hành`,
    short_name:       `${KHU_PHO.ma} Admin`,
    description:      `Hệ thống quản trị thông minh dành cho cán bộ ${KHU_PHO.ten}, ${KHU_PHO.phuong}, TP.HCM`,
    start_url:        '/dashboard',
    scope:            '/',
    display:          'standalone',
    orientation:      'any',
    theme_color:      '#1E3A5F',
    background_color: '#ffffff',
    lang:             'vi',
    categories:       ['government', 'productivity', 'utilities'],
    icons: [
      { src: '/icon',       sizes: '64x64',   type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
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
