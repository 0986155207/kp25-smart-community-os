import Link from 'next/link'
import { Bell, ChevronRight, Pin, Eye, Calendar } from 'lucide-react'
import { formatRelativeTime, formatDate, truncate } from '@/lib/utils'
import type { ThongBao } from '@kp25/types'

interface Props {
  items: ThongBao[]
}

const LOAI_LABEL: Record<string, string> = {
  THONG_BAO_CHUNG: 'Thông báo',
  HOP_KHU_PHO: 'Họp khu phố',
  AN_NINH: 'An ninh',
  MOI_TRUONG: 'Môi trường',
  SU_KIEN: 'Sự kiện',
}

export default function NewsSection({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Thông báo mới nhất</h2>
              <p className="section-subtitle">Tin tức và thông báo từ Ban quản lý</p>
            </div>
          </div>
          <div className="text-center py-12 text-slate-400">
            <Bell size={48} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có thông báo nào</p>
          </div>
        </div>
      </section>
    )
  }

  const pinned = items.filter((i) => i.ghimLen)
  const regular = items.filter((i) => !i.ghimLen)
  const sorted = [...pinned, ...regular].slice(0, 6)

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Thông báo mới nhất</h2>
            <p className="section-subtitle">Tin tức và thông báo từ Ban quản lý</p>
          </div>
          <Link
            href="/thong-bao"
            className="flex items-center gap-1 text-[#8B1A1A] text-sm font-semibold hover:underline"
          >
            Xem tất cả
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <Link
              key={item.id}
              href={`/thong-bao/${item.id}`}
              className="card-hover group flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="badge badge-red text-xs">
                  {LOAI_LABEL[item.loai] ?? item.loai}
                </span>
                {item.ghimLen && (
                  <Pin size={14} className="text-[#8B1A1A] shrink-0 mt-0.5" />
                )}
              </div>

              {/* Tiêu đề */}
              <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-[#8B1A1A] transition-colors">
                {item.tieuDe}
              </h3>

              {/* Mô tả */}
              <p className="text-slate-500 text-sm flex-1 leading-relaxed">
                {truncate(item.noiDung, 120)}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Calendar size={12} />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Eye size={12} />
                  <span>{item.luotXem}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
