import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, ArrowLeft, Plus, CheckCircle2, XCircle, Clock, Search } from 'lucide-react'
import { layDanhSachHoNgheo } from './actions'
import { LOAI_HO_NGHEO, TRANG_THAI_HN } from './constants'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const metadata: Metadata = { title: 'Hộ nghèo & Cận nghèo — An sinh KP25' }
export const revalidate = 60

const COLOR_MAP: Record<string, string> = {
  red:     'bg-red-100 text-red-700',
  amber:   'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  slate:   'bg-slate-100 text-slate-600',
}
const TRANG_THAI_ICON = {
  DANG_HUONG:  Home,
  THOAT_NGHEO: CheckCircle2,
  HET_HAN_XET: Clock,
}

const NAM_HIEN_TAI = new Date().getFullYear()

interface Props {
  searchParams: Promise<{ loai?: string; nam?: string; q?: string }>
}

export default async function HoNgheoPage({ searchParams }: Props) {
  const { loai, nam, q } = await searchParams
  const namSo = nam ? parseInt(nam) : undefined
  const records = await layDanhSachHoNgheo(loai, namSo, q)

  const counts = {
    tat_ca:      records.length,
    ngheo:       records.filter(r => r.loai === 'NGHEO').length,
    can_ngheo:   records.filter(r => r.loai === 'CAN_NGHEO').length,
    dang_huong:  records.filter(r => r.trang_thai === 'DANG_HUONG').length,
    thoat_ngheo: records.filter(r => r.trang_thai === 'THOAT_NGHEO').length,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/an-sinh" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Home size={20} className="text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">Hộ nghèo & Cận nghèo</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Chuẩn nghèo đô thị TP.HCM 2026 — QĐ 09/2021/QĐ-TTg
          </p>
        </div>
        <Link
          href="/dashboard/an-sinh/ho-ngheo/them"
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={15} /> Thêm hồ sơ
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng hồ sơ',     value: counts.tat_ca,      color: 'text-slate-700',   bg: 'bg-slate-50'   },
          { label: 'Hộ nghèo',        value: counts.ngheo,       color: 'text-red-700',     bg: 'bg-red-50'     },
          { label: 'Hộ cận nghèo',    value: counts.can_ngheo,   color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Đã thoát nghèo',  value: counts.thoat_ngheo, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chuẩn nghèo info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            loai:  'Hộ nghèo',
            muc:   '≤ 2.000.000 đ/người/tháng',
            hotro: 'BHYT 100% · Giáo dục · Nhà ở · Nước sạch',
            color: 'border-red-200 bg-red-50',
            dot:   'bg-red-500',
          },
          {
            loai:  'Hộ cận nghèo',
            muc:   '2.000.001 – 3.000.000 đ/người/tháng',
            hotro: 'BHYT 70% · Hỗ trợ giáo dục · Nhà ở',
            color: 'border-amber-200 bg-amber-50',
            dot:   'bg-amber-500',
          },
          {
            loai:  'Xét duyệt',
            muc:   'Hàng năm: 01/01 – 31/12',
            hotro: 'Căn cứ: QĐ 09/2021/QĐ-TTg + TP.HCM 2026',
            color: 'border-blue-200 bg-blue-50',
            dot:   'bg-blue-500',
          },
        ].map(info => (
          <div key={info.loai} className={`border rounded-xl p-4 ${info.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${info.dot}`} />
              <span className="font-bold text-slate-800 text-sm">{info.loai}</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 mb-1">{info.muc}</div>
            <div className="text-[11px] text-slate-500">{info.hotro}</div>
          </div>
        ))}
      </div>

      {/* Filter + năm */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: undefined,    label: 'Tất cả',      count: counts.tat_ca    },
          { key: 'NGHEO',      label: 'Hộ nghèo',    count: counts.ngheo     },
          { key: 'CAN_NGHEO',  label: 'Cận nghèo',   count: counts.can_ngheo },
        ].map(tab => {
          const active = (loai ?? '') === (tab.key ?? '')
          const href   = tab.key
            ? `/dashboard/an-sinh/ho-ngheo?loai=${tab.key}${nam ? `&nam=${nam}` : ''}`
            : `/dashboard/an-sinh/ho-ngheo${nam ? `?nam=${nam}` : ''}`
          return (
            <Link
              key={tab.key ?? 'all'}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </Link>
          )
        })}

        <div className="ml-auto flex items-center gap-2">
          {[NAM_HIEN_TAI, NAM_HIEN_TAI - 1, NAM_HIEN_TAI - 2].map(y => (
            <Link
              key={y}
              href={`/dashboard/an-sinh/ho-ngheo${loai ? `?loai=${loai}&nam=${y}` : `?nam=${y}`}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                (namSo ?? NAM_HIEN_TAI) === y
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Home size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có dữ liệu hộ nghèo</p>
            <p className="text-sm mt-1">Nhấn &quot;Thêm hồ sơ&quot; để nhập hộ đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Chủ hộ / Địa chỉ</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Loại / Năm</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Quyết định</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Thu nhập BQ</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hỗ trợ</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(r => {
                  const loaiInfo = LOAI_HO_NGHEO[r.loai]  ?? { label: r.loai, color: 'slate' }
                  const ttInfo   = TRANG_THAI_HN[r.trang_thai] ?? { label: r.trang_thai, color: 'slate' }
                  const TtIcon   = TRANG_THAI_ICON[r.trang_thai as keyof typeof TRANG_THAI_ICON] ?? Clock
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{r.chu_ho ?? '—'}</div>
                        {r.dia_chi_day && (
                          <div className="text-xs text-slate-400 mt-0.5">{r.dia_chi_day}</div>
                        )}
                        {r.so_thanh_vien && (
                          <div className="text-xs text-slate-400">{r.so_thanh_vien} thành viên</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${COLOR_MAP[loaiInfo.color]}`}>
                          {loaiInfo.label}
                        </span>
                        <div className="text-xs text-slate-500 mt-1">Năm {r.nam_xet_duyet}</div>
                      </td>
                      <td className="px-4 py-3">
                        {r.quyet_dinh_so ? (
                          <>
                            <div className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">
                              {r.quyet_dinh_so}
                            </div>
                            {r.ngay_quyet_dinh && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {format(new Date(r.ngay_quyet_dinh), 'dd/MM/yyyy', { locale: vi })}
                              </div>
                            )}
                          </>
                        ) : <span className="text-slate-400">—</span>}
                        {r.ngay_het_han && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Hết hạn: {format(new Date(r.ngay_het_han), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.thu_nhap_bq ? (
                          <span className="font-medium text-slate-700 text-xs">
                            {r.thu_nhap_bq.toLocaleString('vi-VN')} đ
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {r.ho_tro_bhyt && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">BHYT</span>
                          )}
                          {r.ho_tro_giao_duc && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">GD</span>
                          )}
                          {r.ho_tro_nha_o && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">Nhà</span>
                          )}
                          {!r.ho_tro_bhyt && !r.ho_tro_giao_duc && !r.ho_tro_nha_o && (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${COLOR_MAP[ttInfo.color]}`}>
                          <TtIcon size={11} />
                          {ttInfo.label}
                        </span>
                        {r.trang_thai === 'THOAT_NGHEO' && r.ngay_thoat_ngheo && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {format(new Date(r.ngay_thoat_ngheo), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Hiển thị {records.length} bản ghi · Đang hưởng: {counts.dang_huong}
        </p>
      )}
    </div>
  )
}
