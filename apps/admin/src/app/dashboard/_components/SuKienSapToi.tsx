import Link from 'next/link'
import { CalendarDays, ArrowRight, Star, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SuKienSapToi as SuKienType } from '../actions'

const LOAI_LABEL: Record<string, string> = {
  CHINH_TRI:   'Chính trị',
  VAN_HOA:     'Văn hóa',
  THE_THAO:    'Thể thao',
  GIAO_DUC:    'Giáo dục',
  Y_TE:        'Y tế',
  AN_NINH:     'An ninh',
  MOI_TRUONG:  'Môi trường',
  AN_SINH:     'An sinh',
  KHAC:        'Khác',
}

const LOAI_COLOR: Record<string, string> = {
  CHINH_TRI:  'bg-red-100 text-red-700',
  VAN_HOA:    'bg-purple-100 text-purple-700',
  THE_THAO:   'bg-orange-100 text-orange-700',
  GIAO_DUC:   'bg-blue-100 text-blue-700',
  Y_TE:       'bg-emerald-100 text-emerald-700',
  AN_NINH:    'bg-slate-100 text-slate-700',
  MOI_TRUONG: 'bg-green-100 text-green-700',
  AN_SINH:    'bg-pink-100 text-pink-700',
  KHAC:       'bg-gray-100 text-gray-600',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function SuKienSapToi({ items }: { items: SuKienType[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-violet-600" />
          <h3 className="font-bold text-slate-900 text-sm">Sự kiện sắp tới</h3>
        </div>
        <Link
          href="/dashboard/su-kien"
          className="text-xs text-[#8B1A1A] font-medium flex items-center gap-1 hover:underline"
        >
          Tất cả <ArrowRight size={12} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-300 text-sm py-8">
          Không có sự kiện sắp tới
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map(sk => (
            <Link
              key={sk.id}
              href={`/dashboard/su-kien/${sk.id}`}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              {/* Date block */}
              <div className="shrink-0 w-10 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                  {new Date(sk.ngay_bat_dau).toLocaleDateString('vi-VN', { month: 'short' })}
                </div>
                <div className="text-lg font-bold text-[#1E3A5F] leading-tight">
                  {new Date(sk.ngay_bat_dau).getDate()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    LOAI_COLOR[sk.loai] ?? 'bg-gray-100 text-gray-600'
                  )}>
                    {LOAI_LABEL[sk.loai] ?? sk.loai}
                  </span>
                  {sk.noi_bat && (
                    <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                  )}
                  {sk.trang_thai === 'DANG_DIEN_RA' && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                      <Radio size={9} className="text-emerald-500" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate leading-snug">
                  {sk.tieu_de}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(sk.ngay_bat_dau)} · {formatTime(sk.ngay_bat_dau)}
                  {sk.dia_diem && ` · ${sk.dia_diem}`}
                </p>
              </div>

              <ArrowRight
                size={13}
                className="text-slate-200 group-hover:text-slate-400 shrink-0 mt-1 transition-colors"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
