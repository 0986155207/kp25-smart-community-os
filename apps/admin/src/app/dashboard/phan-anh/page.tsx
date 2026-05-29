import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertCircle, Clock, CheckCircle, ChevronRight,
  MapPin, Phone, User, XCircle, Filter, Plus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, mapPhanAnh, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import DonDepButton from './DonDepButton'

export const metadata: Metadata = { title: 'Quản lý phản ánh' }
export const revalidate = 0

// ─── Config ────────────────────────────────────────────────
const TRANG_THAI_CFG: Record<string, { label: string; badge: string; color: string; bg: string; Icon: typeof Clock }> = {
  MOI: { label: 'Mới', badge: 'badge-yellow', color: 'text-amber-600', bg: 'bg-amber-50', Icon: Clock },
  DANG_XU_LY: { label: 'Đang xử lý', badge: 'badge-blue', color: 'text-blue-600', bg: 'bg-blue-50', Icon: Clock },
  DA_XU_LY: { label: 'Đã xử lý', badge: 'badge-green', color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: CheckCircle },
  DONG: { label: 'Đã đóng', badge: 'badge-gray', color: 'text-slate-500', bg: 'bg-slate-100', Icon: XCircle },
}

const MUC_DO_CFG: Record<string, { label: string; badge: string }> = {
  KHAN_CAP: { label: 'Khẩn cấp', badge: 'badge-red' },
  CAO: { label: 'Cao', badge: 'badge-orange' },
  TRUNG_BINH: { label: 'Trung bình', badge: 'badge-yellow' },
  THAP: { label: 'Thấp', badge: 'badge-gray' },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh',
  MOI_TRUONG: 'Môi trường',
  CO_SO_HA_TANG: 'Cơ sở hạ tầng',
  HA_TANG: 'Hạ tầng',
  AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông',
  KHAC: 'Khác',
}

// ─── Data ───────────────────────────────────────────────────
async function getStats() {
  const supabase = await createClient()
  const [moi, dangXuLy, daXuLy, dong] = await Promise.all([
    supabase.from('phan_anh').select('id', { count: 'exact' }).eq('trang_thai', 'MOI').is('deleted_at', null),
    supabase.from('phan_anh').select('id', { count: 'exact' }).eq('trang_thai', 'DANG_XU_LY').is('deleted_at', null),
    supabase.from('phan_anh').select('id', { count: 'exact' }).eq('trang_thai', 'DA_XU_LY').is('deleted_at', null),
    supabase.from('phan_anh').select('id', { count: 'exact' }).eq('trang_thai', 'DONG').is('deleted_at', null),
  ])
  return {
    MOI: moi.count ?? 0,
    DANG_XU_LY: dangXuLy.count ?? 0,
    DA_XU_LY: daXuLy.count ?? 0,
    DONG: dong.count ?? 0,
    TONG: (moi.count ?? 0) + (dangXuLy.count ?? 0) + (daXuLy.count ?? 0) + (dong.count ?? 0),
  }
}

async function getPhanAnh(trangThai?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('phan_anh')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (trangThai && trangThai !== 'TONG') {
    query = query.eq('trang_thai', trangThai)
  }

  const { data } = await query
  return (data ?? []).map(mapPhanAnh)
}

// ─── Page ────────────────────────────────────────────────────
export default async function PhanAnhPage({
  searchParams,
}: {
  searchParams: Promise<{ trang_thai?: string }>
}) {
  const params = await searchParams
  const filterTrangThai = params.trang_thai ?? 'TONG'

  const [stats, items] = await Promise.all([
    getStats(),
    getPhanAnh(filterTrangThai === 'TONG' ? undefined : filterTrangThai),
  ])

  const TABS = [
    { key: 'TONG', label: 'Tất cả', count: stats.TONG },
    { key: 'MOI', label: 'Mới', count: stats.MOI },
    { key: 'DANG_XU_LY', label: 'Đang xử lý', count: stats.DANG_XU_LY },
    { key: 'DA_XU_LY', label: 'Đã xử lý', count: stats.DA_XU_LY },
    { key: 'DONG', label: 'Đã đóng', count: stats.DONG },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý phản ánh</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tiếp nhận và xử lý phản ánh hiện trường của người dân</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <DonDepButton soLuong={stats.DA_XU_LY + stats.DONG} />
          <Link
            href="/dashboard/phan-anh/tao"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#7a1616] transition-colors"
          >
            <Plus size={16} />
            Tạo mới
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['MOI', 'DANG_XU_LY', 'DA_XU_LY', 'DONG'] as const).map((key) => {
          const cfg = TRANG_THAI_CFG[key]!
          return (
            <Link
              key={key}
              href={`/dashboard/phan-anh?trang_thai=${key}`}
              className={cn(
                'card transition-all hover:shadow-md',
                filterTrangThai === key && 'ring-2 ring-[#8B1A1A]'
              )}
            >
              <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center mb-3`}>
                <cfg.Icon size={20} className={cfg.color} />
              </div>
              <div className={`text-3xl font-bold ${cfg.color}`}>{stats[key]}</div>
              <div className="text-sm font-medium text-slate-600 mt-1">{cfg.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Tabs filter */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/dashboard/phan-anh?trang_thai=${tab.key}`}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                filterTrangThai === tab.key
                  ? 'border-[#8B1A1A] text-[#8B1A1A] bg-red-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <Filter size={13} className={filterTrangThai === tab.key ? 'text-[#8B1A1A]' : 'text-slate-400'} />
              {tab.label}
              <span className={cn(
                'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                filterTrangThai === tab.key ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Danh sách */}
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Không có phản ánh nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((item) => {
              const ttCfg = TRANG_THAI_CFG[item.trangThai] ?? TRANG_THAI_CFG['MOI']!
              const mdCfg = MUC_DO_CFG[item.mucDo] ?? MUC_DO_CFG['TRUNG_BINH']!
              const isKhanCap = item.mucDo === 'KHAN_CAP'

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/phan-anh/${item.id}`}
                  className={cn(
                    'flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group',
                    isKhanCap && 'border-l-4 border-l-red-500'
                  )}
                >
                  {/* Ảnh thumbnail hoặc icon */}
                  {item.anhUrls.length > 0 ? (
                    <img
                      src={item.anhUrls[0]}
                      alt={item.tieuDe}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl ${ttCfg.bg} flex items-center justify-center shrink-0`}>
                      <AlertCircle size={24} className={ttCfg.color} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
                      <span className={`badge ${mdCfg.badge}`}>{mdCfg.label}</span>
                      <span className="badge badge-gray">{LOAI_LABEL[item.loai] ?? item.loai}</span>
                    </div>

                    {/* Tiêu đề */}
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-[#8B1A1A] transition-colors">
                      {item.tieuDe}
                    </h3>
                    <p className="text-slate-500 text-sm mt-0.5">{truncate(item.moTa, 90)}</p>

                    {/* Meta */}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      {item.diaChiPhanAnh && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {truncate(item.diaChiPhanAnh, 40)}
                        </span>
                      )}
                      {item.nguoiGuiTen && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {item.nguoiGuiTen}
                        </span>
                      )}
                      {item.nguoiGuiSdt && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {item.nguoiGuiSdt}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.anhUrls.length > 0 && (
                        <span className="text-slate-300">📷 {item.anhUrls.length} ảnh</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-1" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
