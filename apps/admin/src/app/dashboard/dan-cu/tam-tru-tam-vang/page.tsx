import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft, Plus, UserCheck, UserMinus, Clock, CheckCircle2,
  AlertTriangle, Search, Phone, MapPin, Calendar, FileText,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import {
  layDanhSachTamTru, layDanhSachTamVang, layThongKeTamTruVang,
} from './actions'
import {
  LY_DO_TAM_TRU_LABEL, LY_DO_TAM_VANG_LABEL,
  TRANG_THAI_TAM_TRU_LABEL, TRANG_THAI_TAM_VANG_LABEL,
  type TrangThaiTamTru, type TrangThaiTamVang,
} from './constants'

export const metadata: Metadata = { title: `Tạm trú / Tạm vắng — Dân cư ${KHU_PHO.ma}` }
export const revalidate = 0

// ─── Màu sắc trạng thái ────────────────────────────────────────
const TT_TRU_COLOR: Record<TrangThaiTamTru, string> = {
  DANG_TAM_TRU: 'bg-blue-100 text-blue-700',
  HET_HAN:      'bg-amber-100 text-amber-700',
  DA_ROI_DI:    'bg-slate-100 text-slate-500',
}
const TT_VANG_COLOR: Record<TrangThaiTamVang, string> = {
  DANG_VANG: 'bg-orange-100 text-orange-700',
  DA_VE:     'bg-emerald-100 text-emerald-700',
  QUA_HAN:   'bg-red-100 text-red-700',
}

interface Props {
  searchParams: Promise<{ tab?: string; filter?: string; q?: string }>
}

export default async function TamTruTamVangPage({ searchParams }: Props) {
  const { tab = 'tam-tru', filter, q } = await searchParams

  const [thongKe, dsTamTru, dsTamVang] = await Promise.all([
    layThongKeTamTruVang(),
    layDanhSachTamTru(filter, q),
    layDanhSachTamVang(filter, q),
  ])

  const isTamTru = tab !== 'tam-vang'

  // Helper: số ngày còn lại / đã qua
  function ngayConLai(ngayKetThuc: string | null): { text: string; warn: boolean } {
    if (!ngayKetThuc) return { text: 'Không xác định', warn: false }
    const days = differenceInDays(new Date(ngayKetThuc), new Date())
    if (days < 0)  return { text: `Quá hạn ${Math.abs(days)} ngày`, warn: true }
    if (days === 0) return { text: 'Hết hạn hôm nay', warn: true }
    if (days <= 7) return { text: `Còn ${days} ngày`, warn: true }
    return { text: `Còn ${days} ngày`, warn: false }
  }

  function ngayVangQua(ngayDuKienVe: string | null): { text: string; warn: boolean } {
    if (!ngayDuKienVe) return { text: 'Chưa xác định ngày về', warn: false }
    const days = differenceInDays(new Date(), new Date(ngayDuKienVe))
    if (days > 0) return { text: `Quá hạn ${days} ngày`, warn: true }
    const remain = Math.abs(days)
    if (remain <= 7) return { text: `Còn ${remain} ngày`, warn: true }
    return { text: `Còn ${remain} ngày`, warn: false }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/dan-cu"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Quản lý Tạm trú / Tạm vắng</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nghị định 31/2014/NĐ-CP · Thông tư 35/2014/TT-BCA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/dan-cu/tam-tru-tam-vang/them-tam-tru"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={14} /> Đăng ký tạm trú
          </Link>
          <Link
            href="/dashboard/dan-cu/tam-tru-tam-vang/them-tam-vang"
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={14} /> Khai báo tạm vắng
          </Link>
        </div>
      </div>

      {/* Thống kê 4 thẻ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Đang tạm trú',
            value: thongKe.tamTru.dangTamTru,
            icon: UserCheck,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
          },
          {
            label: 'Tạm trú hết hạn',
            value: thongKe.tamTru.hetHan,
            icon: AlertTriangle,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
          },
          {
            label: 'Đang tạm vắng',
            value: thongKe.tamVang.dangVang,
            icon: UserMinus,
            color: 'text-orange-700',
            bg: 'bg-orange-50',
          },
          {
            label: 'Tạm vắng quá hạn',
            value: thongKe.tamVang.quaHan,
            icon: Clock,
            color: 'text-red-700',
            bg: 'bg-red-50',
          },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quy định pháp lý */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            title: 'Tạm trú tối đa',
            value: '24 tháng',
            sub: 'Gia hạn khi đủ điều kiện · Luật Cư trú 2020',
            color: 'border-blue-200 bg-blue-50',
          },
          {
            title: 'Khai báo tạm vắng',
            value: 'Bắt buộc',
            sub: 'Trước khi rời địa bàn > 30 ngày',
            color: 'border-orange-200 bg-orange-50',
          },
          {
            title: 'Thời hạn xử lý',
            value: '5 ngày làm việc',
            sub: 'Kể từ ngày tiếp nhận hồ sơ',
            color: 'border-emerald-200 bg-emerald-50',
          },
          {
            title: 'CA khu vực xét duyệt',
            value: 'Trần Hữu Hùng',
            sub: `📞 0988 897 709 · CA ${KHU_PHO.ma} Long Trường`,
            color: 'border-violet-200 bg-violet-50',
          },
        ].map(r => (
          <div key={r.title} className={`border rounded-xl p-3 ${r.color}`}>
            <div className="text-xs text-slate-500 font-medium">{r.title}</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">{r.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{r.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs chính */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Tab bar + tìm kiếm */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div className="flex">
            <Link
              href="/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-tru"
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                isTamTru
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserCheck size={15} />
              Tạm trú
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isTamTru ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {thongKe.tamTru.total}
              </span>
            </Link>
            <Link
              href="/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-vang"
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                !isTamTru
                  ? 'border-orange-500 text-orange-700 bg-orange-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserMinus size={15} />
              Tạm vắng
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                !isTamTru ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {thongKe.tamVang.total}
              </span>
            </Link>
          </div>

          {/* Sub-filter + search */}
          <div className="flex items-center gap-2 px-4 py-2">
            <form className="relative">
              <input type="hidden" name="tab" value={tab} />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Tìm theo tên, CCCD..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
          </div>
        </div>

        {/* Sub-filter tabs */}
        {isTamTru ? (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex-wrap">
            {[
              { key: undefined, label: 'Tất cả', count: thongKe.tamTru.total },
              { key: 'dang_tam_tru', label: 'Đang tạm trú', count: thongKe.tamTru.dangTamTru },
              { key: 'het_han', label: 'Hết hạn', count: thongKe.tamTru.hetHan },
              { key: 'da_roi_di', label: 'Đã rời đi', count: thongKe.tamTru.daRoiDi },
            ].map(f => {
              const active = (filter ?? '') === (f.key ?? '')
              const href = f.key
                ? `/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-tru&filter=${f.key}${q ? `&q=${q}` : ''}`
                : `/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-tru${q ? `&q=${q}` : ''}`
              return (
                <Link
                  key={f.key ?? 'all'}
                  href={href}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] px-1 rounded-full font-bold ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                    {f.count}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex-wrap">
            {[
              { key: undefined, label: 'Tất cả', count: thongKe.tamVang.total },
              { key: 'dang_vang', label: 'Đang vắng', count: thongKe.tamVang.dangVang },
              { key: 'da_ve', label: 'Đã về', count: thongKe.tamVang.daVe },
              { key: 'qua_han', label: 'Quá hạn', count: thongKe.tamVang.quaHan },
            ].map(f => {
              const active = (filter ?? '') === (f.key ?? '')
              const href = f.key
                ? `/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-vang&filter=${f.key}${q ? `&q=${q}` : ''}`
                : `/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-vang${q ? `&q=${q}` : ''}`
              return (
                <Link
                  key={f.key ?? 'all'}
                  href={href}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] px-1 rounded-full font-bold ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                    {f.count}
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Bảng Tạm trú ────────────────────────────── */}
        {isTamTru && (
          dsTamTru.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <UserCheck size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">Chưa có hồ sơ tạm trú</p>
              <p className="text-sm mt-1">Nhấn &quot;Đăng ký tạm trú&quot; để thêm hồ sơ đầu tiên</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên / CCCD</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ tạm trú</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Chủ nhà</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lý do</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời hạn</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="w-20 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dsTamTru.map(r => {
                    const hanCon = ngayConLai(r.ngay_ket_thuc)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.ho_ten}</div>
                          {r.ngay_sinh && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {format(new Date(r.ngay_sinh), 'dd/MM/yyyy')}
                              {r.gioi_tinh && (
                                <span className="ml-1.5 text-slate-500">
                                  · {r.gioi_tinh === 'NAM' ? 'Nam' : r.gioi_tinh === 'NU' ? 'Nữ' : r.gioi_tinh}
                                </span>
                              )}
                            </div>
                          )}
                          {r.so_cccd && (
                            <div className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 w-fit">
                              {r.so_cccd}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-1 text-xs text-slate-600">
                            <MapPin size={11} className="mt-0.5 shrink-0 text-slate-400" />
                            <span className="max-w-[160px]">{r.dia_chi_tam_tru}</span>
                          </div>
                          {r.tinh_thanh_goc && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Gốc: {r.tinh_thanh_goc}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.chu_nha_ho_ten ? (
                            <>
                              <div className="text-xs font-medium text-slate-700">{r.chu_nha_ho_ten}</div>
                              {r.chu_nha_sdt && (
                                <a href={`tel:${r.chu_nha_sdt}`} className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-0.5">
                                  <Phone size={10} /> {r.chu_nha_sdt}
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600">
                            {LY_DO_TAM_TRU_LABEL[r.ly_do_tam_tru] ?? r.ly_do_tam_tru}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={11} />
                            {format(new Date(r.ngay_bat_dau), 'dd/MM/yyyy')}
                          </div>
                          {r.ngay_ket_thuc && (
                            <div className={`text-[10px] mt-0.5 font-medium ${hanCon.warn ? 'text-amber-600' : 'text-slate-400'}`}>
                              → {format(new Date(r.ngay_ket_thuc), 'dd/MM/yyyy')}
                            </div>
                          )}
                          {r.trang_thai === 'DANG_TAM_TRU' && (
                            <div className={`text-[10px] mt-0.5 font-semibold ${hanCon.warn ? 'text-red-600' : 'text-emerald-600'}`}>
                              {hanCon.text}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            TT_TRU_COLOR[r.trang_thai] ?? 'bg-slate-100 text-slate-500'
                          }`}>
                            {r.trang_thai === 'DANG_TAM_TRU' && <CheckCircle2 size={10} />}
                            {r.trang_thai === 'HET_HAN' && <AlertTriangle size={10} />}
                            {TRANG_THAI_TAM_TRU_LABEL[r.trang_thai]}
                          </span>
                          {r.so_to_khai && (
                            <div className="font-mono text-[10px] text-slate-500 mt-0.5">#{r.so_to_khai}</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/dashboard/dan-cu/tam-tru-tam-vang/tam-tru/${r.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <FileText size={11} /> Chi tiết
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ── Bảng Tạm vắng ────────────────────────────── */}
        {!isTamTru && (
          dsTamVang.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <UserMinus size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">Chưa có khai báo tạm vắng</p>
              <p className="text-sm mt-1">Nhấn &quot;Khai báo tạm vắng&quot; để thêm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên / CCCD</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ tại {KHU_PHO.ma}</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nơi đến</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lý do</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="w-20 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dsTamVang.map(r => {
                    const hanVang = ngayVangQua(r.ngay_du_kien_ve)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.ho_ten}</div>
                          {r.ngay_sinh && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {format(new Date(r.ngay_sinh), 'dd/MM/yyyy')}
                              {r.gioi_tinh && (
                                <span className="ml-1.5 text-slate-500">
                                  · {r.gioi_tinh === 'NAM' ? 'Nam' : r.gioi_tinh === 'NU' ? 'Nữ' : r.gioi_tinh}
                                </span>
                              )}
                            </div>
                          )}
                          {r.so_cccd && (
                            <div className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 w-fit">
                              {r.so_cccd}
                            </div>
                          )}
                          {r.sdt_lien_lac && (
                            <a href={`tel:${r.sdt_lien_lac}`} className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-0.5">
                              <Phone size={10} /> {r.sdt_lien_lac}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-1 text-xs text-slate-600">
                            <MapPin size={11} className="mt-0.5 shrink-0 text-slate-400" />
                            <span className="max-w-[140px]">{r.dia_chi_hien_tai}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-slate-700">{r.dia_chi_tam_vang}</div>
                          {r.tinh_thanh_den && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{r.tinh_thanh_den}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600">
                            {LY_DO_TAM_VANG_LABEL[r.ly_do_tam_vang] ?? r.ly_do_tam_vang}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={11} />
                            Đi: {format(new Date(r.ngay_di), 'dd/MM/yyyy')}
                          </div>
                          {r.ngay_du_kien_ve && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Dự kiến về: {format(new Date(r.ngay_du_kien_ve), 'dd/MM/yyyy')}
                            </div>
                          )}
                          {r.ngay_thuc_te_ve && (
                            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                              Đã về: {format(new Date(r.ngay_thuc_te_ve), 'dd/MM/yyyy')}
                            </div>
                          )}
                          {r.trang_thai === 'DANG_VANG' && (
                            <div className={`text-[10px] mt-0.5 font-semibold ${hanVang.warn ? 'text-red-600' : 'text-slate-400'}`}>
                              {hanVang.text}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            TT_VANG_COLOR[r.trang_thai] ?? 'bg-slate-100 text-slate-500'
                          }`}>
                            {r.trang_thai === 'DA_VE' && <CheckCircle2 size={10} />}
                            {r.trang_thai === 'QUA_HAN' && <AlertTriangle size={10} />}
                            {TRANG_THAI_TAM_VANG_LABEL[r.trang_thai]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/dashboard/dan-cu/tam-tru-tam-vang/tam-vang/${r.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <FileText size={11} /> Chi tiết
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Footer count */}
        {((isTamTru && dsTamTru.length > 0) || (!isTamTru && dsTamVang.length > 0)) && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Hiển thị {isTamTru ? dsTamTru.length : dsTamVang.length} hồ sơ
              {q && ` · Tìm kiếm "${q}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
