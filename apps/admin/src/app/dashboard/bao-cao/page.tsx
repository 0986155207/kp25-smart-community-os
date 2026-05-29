import type { Metadata } from 'next'
import { layDuLieuBaoCao } from './actions'
import BaoCaoCharts from './BaoCaoCharts'

export const metadata: Metadata = { title: 'Báo cáo & KPI — KP25' }
export const revalidate = 0

export default async function BaoCaoPage() {
  const data = await layDuLieuBaoCao()
  return (
    <div className="space-y-0">
      <BaoCaoCharts data={data} />
    </div>
  )
}
