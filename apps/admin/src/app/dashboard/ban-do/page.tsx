import type { Metadata } from 'next'
import { layDuLieuBanDo, layRanhGioiKhuPho } from './actions'
import BanDoPage from './BanDoPage'
import { KHU_PHO } from '@/lib/khu-pho'

export const metadata: Metadata = { title: `Bản đồ GIS — ${KHU_PHO.ten}` }
export const revalidate = 60

export default async function BanDoGISPage() {
  const [{ hoDan, phanAnh }, { ranhGioi, tam, zoom }] = await Promise.all([
    layDuLieuBanDo(),
    layRanhGioiKhuPho(),
  ])
  return (
    <BanDoPage
      hoDan={hoDan}
      phanAnh={phanAnh}
      ranhGioi={ranhGioi}
      tam={tam}
      zoom={zoom}
    />
  )
}
