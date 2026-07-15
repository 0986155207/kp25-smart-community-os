import { ImageResponse } from 'next/og'
import { KHU_PHO } from '@/lib/khu-pho'

// Favicon SINH ĐỘNG theo khu phố của deployment (biến NEXT_PUBLIC_KP_*).
// Nhờ vậy mỗi khu phố có icon riêng trên tab trình duyệt mà không cần upload file.
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: KHU_PHO.mau,
          borderRadius: 12,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        <span style={{ color: '#FFFFFF', fontSize: 24 }}>{KHU_PHO.logoChu}</span>
        <span style={{ color: '#FCD34D', fontSize: 24 }}>{KHU_PHO.logoSo}</span>
      </div>
    ),
    { ...size }
  )
}
