import Link from 'next/link'
import {
  Zap, ArrowLeft, Clock, Baby, Skull, LogIn, LogOut,
  MapPinned, RotateCcw, HandCoins, TrendingUp, Pencil, Heart,
} from 'lucide-react'
import QuickEventClient from './QuickEventClient'
import { layDanhSachSuKien, layThongKeSuKien, type SuKienItem } from './actions'

export const dynamic = 'force-dynamic'

// ─── Config hiển thị từng loại ──────────────────────────────
const LOAI_CFG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SINH:          { label: 'Khai sinh',     icon: Baby,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  MAT:           { label: 'Khai tử',       icon: Skull,      color: 'text-slate-600',   bg: 'bg-slate-50' },
  CHUYEN_DEN:    { label: 'Chuyển đến',    icon: LogIn,      color: 'text-blue-600',    bg: 'bg-blue-50' },
  CHUYEN_DI:     { label: 'Chuyển đi',     icon: LogOut,     color: 'text-orange-600',  bg: 'bg-orange-50' },
  TAM_TRU:       { label: 'Tạm trú',       icon: MapPinned,  color: 'text-cyan-600',    bg: 'bg-cyan-50' },
  TAM_VANG:      { label: 'Tạm vắng',      icon: MapPinned,  color: 'text-amber-600',   bg: 'bg-amber-50' },
  VE_THUONG_TRU: { label: 'Về thường trú', icon: RotateCcw,  color: 'text-teal-600',    bg: 'bg-teal-50' },
  HO_NGHEO:      { label: 'Hộ nghèo',      icon: HandCoins,  color: 'text-red-600',     bg: 'bg-red-50' },
  THOAT_NGHEO:   { label: 'Thoát nghèo',   icon: TrendingUp, color: 'text-green-600',   bg: 'bg-green-50' },
  KET_HON:       { label: 'Kết hôn',       icon: Heart,      color: 'text-pink-600',    bg: 'bg-pink-50' },
  CAP_NHAT:      { label: 'Cập nhật',      icon: Pencil,     color: 'text-violet-600',  bg: 'bg-violet-50' },
  KHAC:          { label: 'Khác',          icon: Pencil,     color: 'text-slate-600',   bg: 'bg-slate-50' },
}

function fmtThoiGian(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = Math.floor((now - d.getTime()) / 1000)
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
}

// ════════════════════════════════════════════════════════════
export default async function SuKienNhanhPage() {
  const [suKienList, thongKe] = await Promise.all([
    layDanhSachSuKien(30),
    layThongKeSuKien(),
  ])

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
            <ArrowLeft size={14} /> Quản lý dân cư
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap size={24} className="text-amber-500" />
            Cập nhật nhanh biến động dân cư
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Ghi nhận sinh, mất, chuyển đến/đi, tạm trú/vắng, hộ nghèo... chỉ trong vài chạm
          </p>
        </div>
      </div>

      {/* ── Thống kê nhanh ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Hôm nay',    value: thongKe.homNay,   color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Tuần này',   value: thongKe.tuanNay,  color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Tháng này',  value: thongKe.thangNay, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Cột trái: Form ghi nhận ──────────────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <QuickEventClient />
          </div>
        </div>

        {/* ── Cột phải: Timeline lịch sử ───────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-slate-500" />
              <h2 className="font-bold text-slate-800 text-sm">Lịch sử gần đây</h2>
              <span className="text-xs text-slate-400 ml-auto">{suKienList.length} sự kiện</span>
            </div>

            {suKienList.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <Zap size={22} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Chưa có sự kiện nào được ghi nhận.</p>
                <p className="text-xs text-slate-400 mt-1">Bắt đầu bằng cách chọn loại sự kiện bên trái.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto -mr-2 pr-2">
                {suKienList.map((sk: SuKienItem) => {
                  const cfg = LOAI_CFG[sk.loai_su_kien] ?? LOAI_CFG['KHAC']!
                  const Icon = cfg.icon
                  return (
                    <div key={sk.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={15} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                          {sk.trang_thai === 'CHO_DUYET' && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">Chờ duyệt</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 leading-snug mt-0.5">{sk.mo_ta}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{fmtThoiGian(sk.created_at)}</span>
                          {sk.can_bo_ghi_ten && <span>· {sk.can_bo_ghi_ten}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
