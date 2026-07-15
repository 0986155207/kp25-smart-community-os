import { ImageResponse } from 'next/og'
import { KHU_PHO } from '@/lib/khu-pho'

// Icon màn hình chính iOS — sinh động theo khu phố của deployment.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        <span style={{ color: '#FFFFFF', fontSize: 68 }}>{KHU_PHO.logoChu}</span>
        <span style={{ color: '#FCD34D', fontSize: 68 }}>{KHU_PHO.logoSo}</span>
      </div>
    ),
    { ...size }
  )
}
