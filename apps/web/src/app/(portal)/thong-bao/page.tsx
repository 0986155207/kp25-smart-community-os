import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, Pin, Eye, Calendar, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { KHU_PHO } from '@/lib/khu-pho'
import { formatDate, truncate, mapThongBao } from '@/lib/utils'
import type { ThongBao } from '@kp25/types'

export const metadata: Metadata = {
  title: 'Thông báo',
  description: 'Thông báo và tin tức từ Ban quản lý Khu phố 25',
}

export const revalidate = 30

const LOAI_LABEL: Record<string, string> = {
  THONG_BAO_CHUNG: 'Thông báo chung',
  HOP_KHU_PHO: 'Họp khu phố',
  AN_NINH: 'An ninh',
  MOI_TRUONG: 'Môi trường',
  SU_KIEN: 'Sự kiện',
}

async function getThongBao(): Promise<ThongBao[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('thong_bao')
      .select('*')
      .is('deleted_at', null)
      .eq('don_vi_id', KHU_PHO.id)
      .order('ghim_len', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    return (data ?? []).map(mapThongBao) as ThongBao[]
  } catch {
    return []
  }
}

export default async function ThongBaoPage() {
  const items = await getThongBao()
  const pinned = items.filter((i) => i.ghimLen)
  const regular = items.filter((i) => !i.ghimLen)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
          <Bell size={24} className="text-[#8B1A1A]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-500">Khu phố 25 · Phường Long Trường</p>
        </div>
      </div>

      {/* Thông báo ghim */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Pin size={16} className="text-[#8B1A1A]" />
            <h2 className="font-bold text-slate-900">Thông báo quan trọng</h2>
          </div>
          <div className="space-y-3">
            {pinned.map((item) => (
              <Link
                key={item.id}
                href={`/thong-bao/${item.id}`}
                className="card-hover flex items-start gap-4 border-l-4 border-[#8B1A1A]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-red text-xs">
                      {LOAI_LABEL[item.loai] ?? item.loai}
                    </span>
                    <span className="badge badge-gray text-xs">Ghim</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 hover:text-[#8B1A1A] transition-colors">
                    {item.tieuDe}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">{truncate(item.noiDung, 150)}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar size={12} />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Eye size={12} />
                      {item.luotXem} lượt xem
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách thông báo */}
      {regular.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 mb-4">Tất cả thông báo</h2>
          {regular.map((item) => (
            <Link
              key={item.id}
              href={`/thong-bao/${item.id}`}
              className="card-hover flex items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-blue text-xs">
                    {LOAI_LABEL[item.loai] ?? item.loai}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 hover:text-[#8B1A1A] transition-colors">
                  {item.tieuDe}
                </h3>
                <p className="text-slate-500 text-sm mt-1">{truncate(item.noiDung, 120)}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar size={12} />
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <Eye size={12} />
                    {item.luotXem} lượt xem
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <Bell size={56} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Chưa có thông báo nào</p>
          <p className="text-sm mt-1">Hãy quay lại sau</p>
        </div>
      )}
    </div>
  )
}
