import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { mapThongBao } from '@/lib/utils'
import ThongBaoForm from '../../ThongBaoForm'

export const metadata: Metadata = { title: 'Chỉnh sửa thông báo' }

export default async function SuaThongBaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('thong_bao')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!data) notFound()

  const item = mapThongBao(data)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/thong-bao/${id}`}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Edit size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa thông báo</h1>
            <p className="text-slate-500 text-sm line-clamp-1">{item.tieuDe}</p>
          </div>
        </div>
      </div>

      <ThongBaoForm
        mode="edit"
        id={id}
        defaultValues={{
          tieuDe: item.tieuDe,
          noiDung: item.noiDung,
          loai: item.loai as 'THONG_BAO_CHUNG' | 'HOP_KHU_PHO' | 'AN_NINH' | 'MOI_TRUONG' | 'SU_KIEN',
          anhUrl: item.anhUrl,
          ghimLen: item.ghimLen,
          ngayHetHan: item.ngayHetHan,
        }}
      />
    </div>
  )
}
