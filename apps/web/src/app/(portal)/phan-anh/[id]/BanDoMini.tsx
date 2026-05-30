'use client'

interface Props {
  lat: number
  lng: number
}

export default function BanDoMini({ lat, lng }: Props) {
  const src = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300` +
    `&center=lonlat:${lng},${lat}&zoom=17` +
    `&marker=lonlat:${lng},${lat};type:awesome;color:%238B1A1A;size:small|apiKey=null`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Bản đồ địa điểm"
      className="w-full h-full object-cover"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
