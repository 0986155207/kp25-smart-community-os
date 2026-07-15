import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Shapes } from 'lucide-react'
import { layRanhGioi } from '../../actions'
import RanhGioiClient from './RanhGioiClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RanhGioiPage({ params }: Props) {
  const { id } = await params
  const dv = await layRanhGioi(id)
  if (!dv) notFound()

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/khu-pho"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Quản lý Khu phố
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shapes size={24} className="text-[#1E3A5F]" />
          Vẽ ranh giới — {dv.ten}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Vẽ ranh giới hành chính của khu phố trực tiếp trên bản đồ. Ranh giới được lưu vào
          hệ thống và dùng chung cho bản đồ GIS của cán bộ lẫn bản đồ công khai trên portal.
        </p>
      </div>

      <RanhGioiClient dv={dv} />
    </div>
  )
}
