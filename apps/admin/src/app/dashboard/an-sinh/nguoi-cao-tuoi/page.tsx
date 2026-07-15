import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, ArrowLeft, Plus, Heart, AlertTriangle, CheckCircle2, Clock, Pencil } from 'lucide-react'
import { layDanhSachNCT } from './actions'
import { SK_LABEL } from './constants'
import { format } from 'date-fns'
import ExportWordButton from './ExportWordButton'

export const metadata: Metadata = { title: `Người cao tuổi — An sinh ${KHU_PHO.ma}` }
export const revalidate = 0

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  amber:   'bg-amber-100 text-amber-700',
  red:     'bg-red-100 text-red-700',
}
const SK_ICON = {
  TOT:          CheckCircle2,
  ON_DINH:      Heart,
  YEU:          Clock,
  CAN_CHAM_SOC: AlertTriangle,
}

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>
}

export default async function NguoiCaoTuoiPage({ searchParams }: Props) {
  const { filter, q } = await searchParams
  const records = await layDanhSachNCT(filter, q)

  const counts = {
    tat_ca:       records.length,
    co_don:       records.filter(r => r.song_co_don).length,
    tro_cap:      records.filter(r => r.nhan_tro_cap_xh).length,
    can_cham_soc: records.filter(r => r.tinh_trang_sk === 'CAN_CHAM_SOC').length,
    tu_80:        records.filter(r => r.tuoi !== undefined && r.tuoi >= 80).length,
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
            <Users size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Người cao tuổi</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Luật NCT 2009 · NĐ 20/2021/NĐ-CP · HCMC 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportWordButton filter={filter ?? 'all'} totalCount={records.length} />
          <Link
            href="/dashboard/an-sinh/nguoi-cao-tuoi/them"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={15} /> Thêm NCT
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Tổng NCT',       value: counts.tat_ca,       color: 'text-blue-700',    bg: 'bg-blue-50'    },
          { label: 'Từ 80 tuổi',     value: counts.tu_80,        color: 'text-indigo-700',  bg: 'bg-indigo-50'  },
          { label: 'Sống cô đơn',    value: counts.co_don,       color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Nhận trợ cấp',   value: counts.tro_cap,      color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Cần chăm sóc',   value: counts.can_cham_soc, color: 'text-red-700',     bg: 'bg-red-50'     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chính sách NCT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Từ 60 tuổi',   value: 'Ưu tiên KCB',            sub: 'Miễn phí dịch vụ VH công'  },
          { label: 'Từ 80 tuổi',   value: 'Trợ cấp XH',             sub: '≥ 360.000 đ/tháng'         },
          { label: 'BHYT ≥ 80',   value: 'Miễn phí 100%',          sub: 'Nhà nước đóng toàn bộ'      },
          { label: 'NCT cô đơn',   value: 'Vào TTBTXH',             sub: 'Không nơi nương tựa'        },
        ].map(info => (
          <div key={info.label} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <div className="text-blue-800 font-bold text-sm">{info.value}</div>
            <div className="text-xs text-blue-600 font-medium">{info.label}</div>
            <div className="text-[10px] text-blue-500 mt-0.5">{info.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: undefined,        label: 'Tất cả',           count: counts.tat_ca       },
          { key: 'tu_80',          label: 'Từ 80 tuổi',       count: counts.tu_80        },
          { key: 'co_don',         label: 'Sống cô đơn',      count: counts.co_don       },
          { key: 'tro_cap',        label: 'Nhận trợ cấp',     count: counts.tro_cap      },
          { key: 'can_cham_soc',   label: 'Cần chăm sóc',     count: counts.can_cham_soc },
        ].map(tab => {
          const active = (filter ?? '') === (tab.key ?? '')
          return (
            <Link
              key={tab.key ?? 'all'}
              href={tab.key ? `/dashboard/an-sinh/nguoi-cao-tuoi?filter=${tab.key}` : '/dashboard/an-sinh/nguoi-cao-tuoi'}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có dữ liệu người cao tuổi</p>
            <p className="text-sm mt-1">Nhấn &quot;Thêm NCT&quot; để nhập người đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên / Tuổi</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sức khỏe</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lương hưu</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trợ cấp XH</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Người chăm sóc</th>
                  <th className="w-16 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(r => {
                  const sk   = SK_LABEL[r.tinh_trang_sk] ?? { label: r.tinh_trang_sk, color: 'slate' }
                  const Icon = SK_ICON[r.tinh_trang_sk as keyof typeof SK_ICON] ?? Heart
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{r.ho_ten}</span>
                          {r.song_co_don && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Cô đơn</span>
                          )}
                          {r.la_liet_si && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">LS</span>
                          )}
                          {r.la_nguoi_co_cong && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">NCC</span>
                          )}
                        </div>
                        {r.ngay_sinh && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {format(new Date(r.ngay_sinh), 'dd/MM/yyyy')}
                            {r.tuoi !== undefined && (
                              <span className="ml-1 text-blue-600 font-semibold">({r.tuoi} tuổi)</span>
                            )}
                          </div>
                        )}
                        {r.gioi_tinh && (
                          <div className="text-[10px] text-slate-400">{r.gioi_tinh === 'NAM' ? 'Nam' : r.gioi_tinh === 'NU' ? 'Nữ' : r.gioi_tinh}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600 max-w-[160px] truncate">{r.dia_chi_day ?? '—'}</div>
                        {r.co_bhyt && r.ma_the_bhyt && (
                          <div className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 w-fit">
                            {r.ma_the_bhyt}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${COLOR_MAP[sk.color] ?? 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={11} />
                          {sk.label}
                        </span>
                        {r.benh_man_tinh && (
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-[140px] truncate" title={r.benh_man_tinh}>
                            {r.benh_man_tinh}
                          </div>
                        )}
                        {r.ngay_cap_nhat_sk && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Cập nhật: {format(new Date(r.ngay_cap_nhat_sk), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.co_luong_huu ? (
                          <>
                            <div className="text-xs font-semibold text-emerald-700">Có</div>
                            {r.muc_luong_huu && (
                              <div className="text-[10px] text-slate-400">
                                {r.muc_luong_huu.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Không</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.nhan_tro_cap_xh ? (
                          <>
                            <div className="text-xs font-semibold text-blue-700">Có</div>
                            {r.muc_tro_cap_xh && (
                              <div className="text-[10px] text-slate-400">
                                {r.muc_tro_cap_xh.toLocaleString('vi-VN')}đ/tháng
                              </div>
                            )}
                            {r.quyet_dinh_tro_cap && (
                              <div className="font-mono text-[10px] text-slate-500 mt-0.5">{r.quyet_dinh_tro_cap}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Không</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.co_nguoi_cham_soc && r.ten_nguoi_cham_soc ? (
                          <>
                            <div className="text-xs text-slate-700 font-medium">{r.ten_nguoi_cham_soc}</div>
                            {r.sdt_nguoi_cham_soc && (
                              <a
                                href={`tel:${r.sdt_nguoi_cham_soc}`}
                                className="text-[10px] text-blue-600 hover:underline"
                              >
                                {r.sdt_nguoi_cham_soc}
                              </a>
                            )}
                          </>
                        ) : (
                          <span className={`text-xs ${r.song_co_don ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                            {r.song_co_don ? 'Không có' : '—'}
                          </span>
                        )}
                      </td>
                      {/* Nút cập nhật */}
                      <td className="px-3 py-3">
                        <Link
                          href={`/dashboard/an-sinh/nguoi-cao-tuoi/${r.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Cập nhật hồ sơ"
                        >
                          <Pencil size={12} />
                          Sửa
                        </Link>
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
          Hiển thị {records.length} người · Cần chú ý: {counts.can_cham_soc + counts.co_don} người
        </p>
      )}
    </div>
  )
}
