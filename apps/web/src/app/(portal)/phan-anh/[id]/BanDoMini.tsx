'use client'

interface Props {
  lat: number
  lng: number
}

export default function BanDoMini({ lat, lng }: Props) {
  // Tính bbox xung quanh điểm (±0.003 độ ≈ 300m)
  const delta  = 0.003
  const bbox   = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const iframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`

  return (
    <iframe
      src={iframeUrl}
      width="100%"
      height="100%"
      style={{ border: 0, minHeight: 180 }}
      loading="lazy"
      title="Bản đồ địa điểm phản ánh"
      allowFullScreen
    />
  )
}
