import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Home, Users, UserCheck, UserMinus, Plus,
  Phone, MapPin, ChevronRight, Search, AlertCircle, FileSpreadsheet,
  UserRound, Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, mapHoDan, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import SearchBar from './SearchBar'
import DonTrungBtn from './DonTrungBtn'

export const metadata: Metadata = { title: 'Quản lý dân cư' }
export const revalidate = 0

// ─── Config ────────────────────────────────────────────────
// trang_thai_ho ENUM: THUONG_TRU | TAM_TRU | TAM_VANG
const TINH_TRANG_CFG: Record<string, { label: string; badge: string; color: string; bg: string }> = {
  THUONG_TRU: { label: 'Thường trú', badge: 'badge-green', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  TAM_TRU: { label: 'Tạm trú', badge: 'badge-blue', color: 'text-blue-600', bg: 'bg-blue-50' },
  TAM_VANG: { label: 'Tạm vắng', badge: 'badge-gray', color: 'text-slate-500', bg: 'bg-slate-100' },
}

// ─── Data ───────────────────────────────────────────────────
async function getStats() {
  const supabase = await createClient()

  // Ngưỡng người cao tuổi: sinh trước ngày này (>= 60 tuổi)
  const now = new Date()
  const cutoff = new Date(now.getFullYear() - 60, now.getMonth(), now.getDate())
  const cutoffStr = cutoff.toISOString().split('T')[0]!

  const [all, thuongTru, tamTru, tamVang, soNam, soNu, caoTuoi] = await Promise.all([
    supabase.from('ho_dan').select('id, so_nhan_khau').is('deleted_at', null),
    supabase.from('ho_dan').select('id', { count: 'exact' }).eq('trang_thai', 'THUONG_TRU').is('deleted_at', null),
    supabase.from('ho_dan').select('id', { count: 'exact' }).eq('trang_thai', 'TAM_TRU').is('deleted_at', null),
    supabase.from('ho_dan').select('id', { count: 'exact' }).eq('trang_thai', 'TAM_VANG').is('deleted_at', null),
    supabase.from('nhan_khau').select('id', { count: 'exact' }).eq('gioi_tinh', 'NAM').is('deleted_at', null),
    supabase.from('nhan_khau').select('id', { count: 'exact' }).eq('gioi_tinh', 'NU').is('deleted_at', null),
    supabase.from('nhan_khau').select('id', { count: 'exact' })
      .not('ngay_sinh', 'is', null)
      .lte('ngay_sinh', cutoffStr)
      .is('deleted_at', null)
      .or('da_mat.is.null,da_mat.eq.false'),
  ])

  const tongNhanKhau = all.data?.reduce((s, h) => s + (h.so_nhan_khau ?? 0), 0) ?? 0
  const soNamVal = soNam.count ?? 0
  const soNuVal  = soNu.count  ?? 0

  return {
    tongHo: all.data?.length ?? 0,
    tongNhanKhau,
    thuongTru: thuongTru.count ?? 0,
    tamTru: tamTru.count ?? 0,
    tamVang: tamVang.count ?? 0,
    soNam: soNamVal,
    soNu: soNuVal,
    phanTramNam: tongNhanKhau > 0 ? Math.round(soNamVal * 100 / tongNhanKhau) : 0,
    phanTramNu:  tongNhanKhau > 0 ? Math.round(soNuVal  * 100 / tongNhanKhau) : 0,
    nguoiCaoTuoi: caoTuoi.count ?? 0,
    phanTramCaoTuoi: tongNhanKhau > 0 ? Math.round((caoTuoi.count ?? 0) * 100 / tongNhanKhau) : 0,
  }
}

async function getHoDan(tinhTrang?: string, timKiem?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('ho_dan')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (tinhTrang && tinhTrang !== 'TAT_CA') {
    query = query.eq('trang_thai', tinhTrang)
  }

  if (timKiem) {
    query = query.or(
      `chu_ho.ilike.%${timKiem}%,dia_chi_day.ilike.%${timKiem}%,so_nha.ilike.%${timKiem}%,so_dien_thoai.ilike.%${timKiem}%,ma_ho.ilike.%${timKiem}%`
    )
  }

  const { data } = await query
  return (data ?? []).map(mapHoDan)
}

// ─── Page ────────────────────────────────────────────────────
export default async function DanCuPage({
  searchParams,
}: {
  searchParams: Promise<{ tinh_trang?: string; tim_kiem?: string }>
}) {
  const params = await searchParams
  const filterTinhTrang = params.tinh_trang ?? 'TAT_CA'
  const timKiem = params.tim_kiem?.trim() ?? ''

  const [stats, items] = await Promise.all([
    getStats(),
    getHoDan(filterTinhTrang === 'TAT_CA' ? undefined : filterTinhTrang, timKiem || undefined),
  ])

  const TABS = [
    { key: 'TAT_CA', label: 'Tất cả', count: stats.tongHo },
    { key: 'THUONG_TRU', label: 'Thường trú', count: stats.thuongTru },
    { key: 'TAM_TRU', label: 'Tạm trú', count: stats.tamTru },
    { key: 'KHAI_BAO_TAM_VANG', label: 'Tạm vắng', count: stats.tamVang },
  ]

  const STAT_CARDS = [
    { label: 'Tổng hộ dân',    value: stats.tongHo,        unit: 'hộ',    icon: Home,      color: 'text-[#8B1A1A]',   bg: 'bg-red-50' },
    { label: 'Tổng nhân khẩu', value: stats.tongNhanKhau,  unit: 'người', icon: Users,     color: 'text-[#1E3A5F]',   bg: 'bg-blue-50' },
    { label: 'Thường trú',     value: stats.thuongTru,     unit: 'hộ',    icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tạm trú',       value: stats.tamTru,         unit: 'hộ',    icon: UserMinus, color: 'text-amber-600',   bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý dân cư</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Hộ dân và nhân khẩu — Khu phố 25, Long Trường
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <DonTrungBtn />
          <Link
            href="/dashboard/dan-cu/nhap-excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <FileSpreadsheet size={15} />
            Nhập từ Excel
          </Link>
          <Link href="/dashboard/dan-cu/them" className="btn-primary">
            <Plus size={15} />
            Thêm hộ dân
          </Link>
        </div>
      </div>

      {/* Stats — hàng 1: 4 thẻ cơ bản */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>
              {s.value.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{s.unit}</div>
            <div className="text-sm font-medium text-slate-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stats — hàng 2: Giới tính + Người cao tuổi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Thẻ Giới tính */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <UserRound size={20} className="text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700">Giới tính</div>
              <div className="text-xs text-slate-400">Phân bố nhân khẩu</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Nam */}
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-[#1E3A5F]">
                {stats.soNam.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">người</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium text-[#1E3A5F]">Nam</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                  {stats.phanTramNam}%
                </span>
              </div>
            </div>
            {/* Nữ */}
            <div className="bg-pink-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-pink-700">
                {stats.soNu.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">người</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium text-pink-700">Nữ</span>
                <span className="text-xs font-bold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-full">
                  {stats.phanTramNu}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar tỉ lệ Nam/Nữ */}
          <div className="h-2 rounded-full overflow-hidden bg-pink-100">
            <div
              className="h-full bg-[#1E3A5F] rounded-full transition-all"
              style={{ width: `${stats.phanTramNam}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Nam {stats.phanTramNam}%</span>
            <span>Nữ {stats.phanTramNu}%</span>
          </div>
        </div>

        {/* Thẻ Người cao tuổi */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-orange-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700">Người cao tuổi</div>
              <div className="text-xs text-slate-400">Từ 60 tuổi trở lên</div>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-4">
            <div>
              <div className="text-4xl font-bold text-orange-500">
                {stats.nguoiCaoTuoi.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">người cao tuổi</div>
            </div>
            <div className="mb-1">
              <span className="text-lg font-bold text-orange-400">
                {stats.phanTramCaoTuoi}%
              </span>
              <div className="text-xs text-slate-400">dân số</div>
            </div>
          </div>

          {/* Progress bar tỉ lệ cao tuổi */}
          <div className="h-2 rounded-full overflow-hidden bg-orange-100">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${stats.phanTramCaoTuoi}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Cao tuổi {stats.phanTramCaoTuoi}%</span>
            <span>{(stats.tongNhanKhau - stats.nguoiCaoTuoi).toLocaleString('vi-VN')} người còn lại</span>
          </div>
        </div>
      </div>

      {/* Danh sách */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 px-2">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/dashboard/dan-cu?tinh_trang=${tab.key}${timKiem ? `&tim_kiem=${encodeURIComponent(timKiem)}` : ''}`}
                className={cn(
                  'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                  filterTinhTrang === tab.key
                    ? 'border-[#8B1A1A] text-[#8B1A1A] bg-red-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                {tab.label}
                <span className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                  filterTinhTrang === tab.key ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'
                )}>
                  {tab.count}
                </span>
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="px-3 pb-2 sm:pb-0 sm:pr-4">
            <SearchBar defaultValue={timKiem} tinhTrang={filterTinhTrang} />
          </div>
        </div>

        {/* Danh sách hộ dân */}
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">
              {timKiem ? `Không tìm thấy kết quả cho "${timKiem}"` : 'Chưa có hộ dân nào'}
            </p>
            {!timKiem && (
              <Link
                href="/dashboard/dan-cu/them"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#8B1A1A] hover:underline"
              >
                <Plus size={14} />
                Thêm hộ dân đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((item) => {
              const ttCfg = TINH_TRANG_CFG[item.trangThai] ?? TINH_TRANG_CFG['THUONG_TRU']!
              const address = [item.soNha, item.duong].filter(Boolean).join(' ') || item.diaChiDay

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/dan-cu/${item.id}`}
                  className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl ${ttCfg.bg} flex items-center justify-center shrink-0`}>
                    <Home size={22} className={ttCfg.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
                      {item.maHo && (
                        <span className="badge badge-gray font-mono text-[10px]">{item.maHo}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-[#8B1A1A] transition-colors">
                      {item.chuHo}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      {address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {truncate(address, 50)}
                        </span>
                      )}
                      {item.soDienThoai && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {item.soDienThoai}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-lg font-bold text-[#1E3A5F]">{item.soNhanKhau}</div>
                      <div className="text-xs text-slate-400">nhân khẩu</div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-slate-400">Cập nhật</div>
                      <div className="text-xs text-slate-500">{formatDate(item.updatedAt)}</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Footer count */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Hiển thị {items.length} hộ dân
              {timKiem && ` · Kết quả tìm kiếm "${timKiem}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
