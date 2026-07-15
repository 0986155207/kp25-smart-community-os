import { KHU_PHO } from '@/lib/khu-pho'
import Link from 'next/link'
import { CalendarDays, MapPin, Clock, ArrowRight, Star } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface SuKienTomTat {
  id: string
  tieuDe: string
  loai: string
  trangThai: string
  ngayBatDau: string
  diaDiem: string
  noiBat: boolean
  anhBiaUrl: string | null
}

const LOAI_COLOR: Record<string, string> = {
  CHINH_TRI:  '#8B1A1A',
  VAN_HOA:    '#7C3AED',
  THE_THAO:   '#059669',
  TU_THIEN:   '#D97706',
  HOP_MAT:    '#1E3A5F',
  AN_NINH:    '#374151',
  SUCK_KHOE:  '#DB2777',
  GIAO_DUC:   '#B45309',
  KHAC:       '#6B7280',
}

const LOAI_LABEL: Record<string, string> = {
  CHINH_TRI:  'Chính trị',
  VAN_HOA:    'Văn hóa',
  THE_THAO:   'Thể thao',
  TU_THIEN:   'Từ thiện',
  HOP_MAT:    'Họp mặt',
  AN_NINH:    'An ninh',
  SUCK_KHOE:  'Sức khỏe',
  GIAO_DUC:   'Giáo dục',
  KHAC:       'Khác',
}

export default function EventsSection({ items }: { items: SuKienTomTat[] }) {
  if (items.length === 0) return null

  return (
    <section className="py-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-[#1E3A5F]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sự kiện sắp tới</h2>
              <p className="text-xs text-slate-400">{KHU_PHO.ten}</p>
            </div>
          </div>
          <Link
            href="/su-kien"
            className="flex items-center gap-1 text-sm font-semibold text-[#1E3A5F]
                       hover:text-[#152d4a] transition-colors"
          >
            Xem tất cả
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((sk) => {
            const color = LOAI_COLOR[sk.loai] ?? '#6B7280'
            const isLive = sk.trangThai === 'DANG_DIEN_RA'

            return (
              <Link
                key={sk.id}
                href={`/su-kien/${sk.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm
                           overflow-hidden hover:shadow-md hover:-translate-y-0.5
                           transition-all duration-200"
              >
                {/* Stripe màu loại */}
                <div className="h-1.5 w-full" style={{ background: color }} />

                <div className="p-4">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color, background: `${color}15` }}
                    >
                      {LOAI_LABEL[sk.loai] ?? sk.loai}
                    </span>
                    {isLive && (
                      <span className="flex items-center gap-1 text-xs font-semibold
                                       text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Đang diễn ra
                      </span>
                    )}
                    {sk.noiBat && !isLive && (
                      <span className="flex items-center gap-1 text-xs font-semibold
                                       text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star size={10} fill="currentColor" />
                        Nổi bật
                      </span>
                    )}
                  </div>

                  {/* Tiêu đề */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug mb-3
                                 group-hover:text-[#1E3A5F] transition-colors line-clamp-2">
                    {sk.tieuDe}
                  </h3>

                  {/* Thời gian + địa điểm */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={12} className="shrink-0 text-slate-400" />
                      <span>{formatDateTime(sk.ngayBatDau)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate">{sk.diaDiem}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
