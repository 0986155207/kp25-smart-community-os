import type { Metadata } from 'next'
import { layDuLieuBanDo } from './actions'
import BanDoPage from './BanDoPage'

export const metadata: Metadata = { title: 'Bản đồ GIS — Khu phố 25' }
export const revalidate = 60

export default async function BanDoGISPage() {
  const { hoDan, phanAnh } = await layDuLieuBanDo()
  return <BanDoPage hoDan={hoDan} phanAnh={phanAnh} />
}
