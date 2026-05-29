import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CalendarDays, Plus, MapPin, Clock, Users,
  Star, Search, ChevronRight, Pencil,
} from 'lucide-react'
import { format, isPast, isFuture, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { layDanhSachSuKien, layThongKeSuKien } from './actions'
import { LOAI_SK_CFG, TRANG_THAI_SK_CFG, type LoaiSuKien, type TrangThaiSuKien } from './constants'

export const metadata: Metadata = { title: 'Sự kiện — KP25' }
export const revalidate = 0

// ─── Filter tabs ──────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'tat_ca',       label: 'Tất cả'       },
  { key: 'SAP_DIEN_RA',  label: 'Sắp diễn ra'  },
  { key: 'DANG_DIEN_RA', label: 'Đang diễn ra' },
  { key: 'DA_KET_THUC',  label: 'Đã kết thúc'  },
]

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>
}

export default async function SuKienPage({ searchParams }: Props) {
  const { filter, q } = await searchParams

  const [thongKe, dsSuKien] = await Promise.all([
    layThongKeSuKien(),
    layDanhSachSuKien(filter, q),
  ])

  const activeFilter = filter ?? 'tat_ca'

  // Nhóm theo thời gian cho hiển thị nếu không filter
  const noiBat   = dsSuKien.filter(s => s.noi_bat)
  const sapDienRa = dsSuKien.filter(s => s.trang_thai === 'SAP_DIEN_RA' || s.trang_thai === 'DANG_DIEN_RA')
  const daKetThuc = dsSuKien.filter(s => s.trang_thai === 'DA_KET_THUC' || s.trang_thai === 'HUY' || s.trang_thai === 'NHAP')

  function getTabCount(key: string): number {
    if (key === 'tat_ca')        return thongKe.tong
    if (key === 'SAP_DIEN_RA')   return thongKe.sapDienRa
    if (key === 'DANG_DIEN_RA')  return thongKe.dangDienRa
    if (key === 'DA_KET_THUC')   return thongKe.daKetThuc
    return 0
  }

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-[#8B1A1A]" />
            <h1 className="text-2xl font-bold text-slate-900">Sự kiện Khu phố 25</h1>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {thongKe.tong} sự kiện · {thongKe.dangDienRa} đang diễn ra · {thongKe.sapDienRa} sắp tới
          </p>
        </div>
        <Link
          href="/dashboard/su-kien/tao"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} /> Tạo sự kiện
        </Link>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng sự kiện',    value: thongKe.tong,           color: 'text-slate-700',   bg: 'bg-slate-50'   },
          { label: 'Đang diễn ra',    value: thongKe.dangDienRa,     color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Sắp diễn ra',     value: thongKe.sapDienRa,      color: 'text-blue-700',    bg: 'bg-blue-50'    },
          { label: 'Người tham dự',   value: thongKe.tongNguoiThucTe || thongKe.tongNguoiDuKien, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value.toLocaleString('vi-VN')}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Loại sự kiện (chips) ────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(LOAI_SK_CFG) as [LoaiSuKien, (typeof LOAI_SK_CFG)[LoaiSuKien]][]).map(([key, cfg]) => {
          const count = thongKe[key as keyof typeof thongKe] as number
          const active = activeFilter === key
          return (
            <Link
              key={key}
              href={`/dashboard/su-kien?filter=${key}${q ? `&q=${q}` : ''}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? `${cfg.bg} ${cfg.color} border-current shadow-sm`
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <cfg.Icon size={12} />
              {cfg.label}
              <span className={`ml-0.5 font-bold ${active ? '' : 'text-slate-400'}`}>{count}</span>
            </Link>
          )
        })}
      </div>

      {/* ── Danh sách + filter ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Tab bar + search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div className="flex overflow-x-auto">
            {FILTER_TABS.map(tab => {
              const active = activeFilter === tab.key
              return (
                <Link
                  key={tab.key}
                  href={`/dashboard/su-kien?filter=${tab.key}${q ? `&q=${q}` : ''}`}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    active
                      ? 'border-[#8B1A1A] text-[#8B1A1A] bg-red-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {getTabCount(tab.key)}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Search */}
          <form className="px-4 py-2 sm:py-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Tìm sự kiện..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
              />
              <input type="hidden" name="filter" value={activeFilter} />
            </div>
          </form>
        </div>

        {/* Danh sách */}
        {dsSuKien.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Chưa có sự kiện nào</p>
            <p className="text-sm mt-1">Nhấn &quot;Tạo sự kiện&quot; để thêm sự kiện đầu tiên</p>
            <Link href="/dashboard/su-kien/tao" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#8B1A1A] text-white text-sm rounded-xl hover:bg-[#6d1414] transition-colors">
              <Plus size={14} /> Tạo sự kiện
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dsSuKien.map(sk => {
              const cfg   = LOAI_SK_CFG[sk.loai] ?? LOAI_SK_CFG.KHAC
              const ttCfg = TRANG_THAI_SK_CFG[sk.trang_thai]
              const Icon  = cfg.Icon
              const start = new Date(sk.ngay_bat_dau)
              const end   = sk.ngay_ket_thuc ? new Date(sk.ngay_ket_thuc) : null

              const isLive    = sk.trang_thai === 'DANG_DIEN_RA'
              const isUpcoming = sk.trang_thai === 'SAP_DIEN_RA'
              const isDone    = sk.trang_thai === 'DA_KET_THUC' || sk.trang_thai === 'HUY'

              return (
                <div
                  key={sk.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group ${isDone ? 'opacity-70' : ''}`}
                >
                  {/* Date block */}
                  <div className={`shrink-0 w-14 rounded-xl overflow-hidden border ${isDone ? 'border-slate-200' : 'border-slate-200'} hidden sm:block`}>
                    <div className={`text-center py-1 text-[10px] font-bold uppercase ${isLive ? 'bg-emerald-500 text-white' : isUpcoming ? 'bg-[#8B1A1A] text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {isLive ? 'LIVE' : format(start, 'LLL', { locale: vi }).toUpperCase()}
                    </div>
                    <div className="bg-white text-center py-2">
                      <span className="text-2xl font-bold text-slate-800 leading-none">{format(start, 'd')}</span>
                      <div className="text-[10px] text-slate-400">{format(start, 'yyyy')}</div>
                    </div>
                  </div>

                  {/* Icon loại */}
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 sm:hidden`}>
                    <Icon size={18} className={cfg.color} />
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ttCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ttCfg.dot} ${isLive ? 'animate-pulse' : ''}`} />
                        {ttCfg.label}
                      </span>
                      {sk.noi_bat && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <Star size={9} fill="currentColor" /> Nổi bật
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/su-kien/${sk.id}`}
                      className="font-bold text-slate-900 hover:text-[#8B1A1A] transition-colors line-clamp-1 block text-base"
                    >
                      {sk.tieu_de}
                    </Link>

                    {sk.mo_ta && (
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{sk.mo_ta}</p>
                    )}

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {format(start, 'HH:mm dd/MM/yyyy', { locale: vi })}
                        {end && (
                          <span> → {format(end, 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {sk.dia_diem}
                      </span>
                      {(sk.so_luong_du_kien || sk.so_luong_thuc_te) && (
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {sk.so_luong_thuc_te
                            ? `${sk.so_luong_thuc_te.toLocaleString('vi-VN')} người tham dự`
                            : `${sk.so_luong_du_kien?.toLocaleString('vi-VN')} người dự kiến`
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/su-kien/${sk.id}/sua`}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={14} />
                    </Link>
                    <Link
                      href={`/dashboard/su-kien/${sk.id}`}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Xem chi tiết"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {dsSuKien.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Hiển thị {dsSuKien.length} sự kiện
              {q && ` · Tìm kiếm "${q}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
