import type { MetadataRoute } from 'next'
import { KHU_PHO, TEN_THUONG_HIEU } from '@/lib/khu-pho'

// Manifest PWA SINH ĐỘNG theo khu phố của deployment (biến NEXT_PUBLIC_KP_*).
// Next serve tại /manifest.webmanifest và tự chèn <link rel="manifest">.
// Icon dùng route sinh động /icon và /apple-icon → mỗi khu phố có icon riêng.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             `${TEN_THUONG_HIEU} OS`,
    short_name:       KHU_PHO.ma,
    description:      `Hệ điều hành số cộng đồng ${KHU_PHO.ten}, ${KHU_PHO.phuong}, TP.HCM`,
    start_url:        '/',
    scope:            '/',
    display:          'standalone',
    orientation:      'portrait',
    theme_color:      KHU_PHO.mau,
    background_color: '#ffffff',
    lang:             'vi',
    categories:       ['government', 'utilities'],
    icons: [
      { src: '/icon',       sizes: '64x64',   type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  }
}
