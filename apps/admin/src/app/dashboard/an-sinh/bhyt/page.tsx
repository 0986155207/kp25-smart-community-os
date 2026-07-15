import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Plus, AlertTriangle, Clock, CheckCircle2, XCircle, Search } from 'lucide-react'
import { layDanhSachBHYT } from './actions'
import { DOI_TUONG_LABEL, TRANG_THAI_BHYT } from './constants'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const metadata: Metadata = { title: 'Bảo hiểm Y tế — An sinh KP25' }
export const revalidate = 60

const TRANG_THAI_ICON = {
  CON_HAN:     CheckCircle2,
  SAP_HET_HAN: Clock,
  HET_HAN:     XCircle,
  CHUA_CO:     AlertTriangle,
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber:   'bg-amber-100 text-amber-700',
  red:     'bg-red-100 text-red-700',
  slate:   'bg-slate-100 text-slate-600',
}
const ICON_COLOR: Record<string, string> = {
  emerald: 'text-emerald-500',
  amber:   'text-amber-500',
  red:     'text-red-500',
  slate:   'text-slate-400',
}

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>
}

export default async function BhytPage({ searchParams }: Props) {
  const { filter, q } = await searchParams
  const records = await layDanhSachBHYT(filter, q)

  const counts = {
    con_han:     records.filter(r => r.trang_thai === 'CON_HAN').length,
    sap_het_han: records.filter(r => r.trang_thai === 'SAP_HET_HAN').length,
    het_han:     records.filter(r => r.trang_thai === 'HET_HAN').length,
    chua_co:     records.filter(r => r.trang_thai === 'CHUA_CO').length,
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
            <ShieldCheck size={20} className="text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Bảo hiểm Y tế (BHYT)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi thẻ BHYT toàn bộ nhân khẩu KP25 — Nghị định 146/2018, cập nhật 2026
          </p>
        </div>
        <Link
          href="/dashboard/an-sinh/bhyt/them"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={15} /> Thêm BHYT
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: undefined,       label: 'Tất cả',         count: records.length         },
          { key: 'con_han',       label: 'Còn hiệu lực',   count: counts.con_han,     color: 'emerald' },
          { key: 'sap_het_han',   label: 'Sắp hết hạn',   count: counts.sap_het_han, color: 'amber'   },
          { key: 'het_han',       label: 'Hết hạn',         count: counts.het_han,     color: 'red'     },
          { key: 'chua_co',       label: 'Chưa có thẻ',    count: counts.chua_co,     color: 'slate'   },
        ].map(tab => {
          const active = (filter ?? '') === (tab.key ?? '')
          return (
            <Link
              key={tab.key ?? 'all'}
              href={tab.key ? `/dashboard/an-sinh/bhyt?filter=${tab.key}` : '/dashboard/an-sinh/bhyt'}
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
      </div>

      {/* Thông tin chính sách BHYT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Mức đóng 2026',    value: '4,5% lương CS',    sub: 'Lương CS: 2.530.000 đ'  },
          { label: 'Hộ nghèo',         value: 'Miễn 100%',        sub: 'Nhà nước đóng toàn bộ'  },
          { label: 'Cận nghèo',        value: 'Hỗ trợ 70%',       sub: 'Tự đóng 30%'            },
          { label: 'Từ 80 tuổi',       value: 'Miễn phí',         sub: 'Không lương hưu/TC'      },
        ].map(info => (
          <div key={info.label} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
            <div className="text-emerald-800 font-bold text-sm">{info.value}</div>
            <div className="text-xs text-emerald-600 font-medium">{info.label}</div>
            <div className="text-[10px] text-emerald-500 mt-0.5">{info.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có dữ liệu BHYT</p>
            <p className="text-sm mt-1">Nhấn &quot;Thêm BHYT&quot; để nhập thẻ đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên / Hộ dân</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã thẻ / Đối tượng</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nơi KCB</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn thẻ</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Chi trả</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(r => {
                  const tt    = TRANG_THAI_BHYT[r.trang_thai] ?? { label: r.trang_thai, color: 'slate' }
                  const Icon  = TRANG_THAI_ICON[r.trang_thai as keyof typeof TRANG_THAI_ICON] ?? ShieldCheck
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{r.ho_ten}</div>
                        {r.chu_ho && r.chu_ho !== r.ho_ten && (
                          <div className="text-xs text-slate-400">Hộ: {r.chu_ho}</div>
                        )}
                        {r.ngay_sinh && (
                          <div className="text-xs text-slate-400">
                            Ngày sinh: {format(new Date(r.ngay_sinh), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">
                          {r.ma_the_bhyt ?? '—'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {DOI_TUONG_LABEL[r.doi_tuong] ?? r.doi_tuong}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[160px] truncate">
                        {r.noi_dang_ky_kcb ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.han_the_den ? (
                          <>
                            <div className="text-xs font-medium text-slate-700">
                              {format(new Date(r.han_the_den), 'dd/MM/yyyy', { locale: vi })}
                            </div>
                            {r.han_the_tu && (
                              <div className="text-[10px] text-slate-400">
                                Từ: {format(new Date(r.han_the_tu), 'dd/MM/yyyy')}
                              </div>
                            )}
                          </>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-emerald-700 text-sm">{r.phan_tram_huong}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${COLOR_MAP[tt.color]}`}>
                          <Icon size={11} className={ICON_COLOR[tt.color]} />
                          {tt.label}
                        </span>
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
          Hiển thị {records.length} bản ghi
        </p>
      )}
    </div>
  )
}
