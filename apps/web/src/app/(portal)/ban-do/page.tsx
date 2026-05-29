import type { Metadata } from 'next'
import { MapPin, Home, Users, AlertCircle, Clock } from 'lucide-react'
import { layDuLieuBanDoPublic } from './actions'
import BanDoMapClient from './BanDoMapClient'

export const metadata: Metadata = {
  title: 'Bản đồ Khu phố 25 — KP25 Smart Community',
  description: 'Bản đồ GIS Khu phố 25 – Phường Long Trường – TP.HCM. Xem vị trí phản ánh hiện trường, ranh giới khu phố.',
}

export const revalidate = 60

const MUC_DO_COLOR: Record<string, string> = {
  KHAN_CAP:   '#DC2626',
  CAO:        '#EA580C',
  TRUNG_BINH: '#CA8A04',
  THAP:       '#6B7280',
}

const MUC_DO_LABEL: Record<string, string> = {
  KHAN_CAP:   'Khẩn cấp',
  CAO:        'Cao',
  TRUNG_BINH: 'Trung bình',
  THAP:       'Thấp',
}

export default async function BanDoPage() {
  const { phanAnh, stats } = await layDuLieuBanDoPublic()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#1E3A5F] flex items-center justify-center shadow-lg shrink-0">
              <MapPin className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bản đồ Khu phố 25</h1>
              <p className="text-slate-500 mt-1 text-sm max-w-xl">
                Bản đồ GIS trực quan khu vực Khu phố 25 – Phường Long Trường – TP.HCM.
                Theo dõi phản ánh hiện trường và ranh giới khu phố.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                <Home size={15} className="text-[#1E3A5F]" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{stats.tongHoDan}</div>
                <div className="text-xs text-slate-500">Hộ dân</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users size={15} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{stats.tongNhanKhau}</div>
                <div className="text-xs text-slate-500">Nhân khẩu</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle size={15} className="text-amber-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{stats.phanAnhMoi}</div>
                <div className="text-xs text-slate-500">Phản ánh mới</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock size={15} className="text-blue-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{stats.phanAnhDangXuLy}</div>
                <div className="text-xs text-slate-500">Đang xử lý</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Map + Legend ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-5 flex-col lg:flex-row">

          {/* Bản đồ */}
          <div className="flex-1 min-w-0">
            <div
              className="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200"
              style={{ height: '560px' }}
            >
              <BanDoMapClient phanAnh={phanAnh} />
            </div>
            <p className="mt-2 text-xs text-slate-400 text-center">
              © OpenStreetMap · © CARTO · Ranh giới KP25 từ Google Maps
            </p>
          </div>

          {/* Chú thích + Danh sách */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">

            {/* Chú thích */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Chú thích
              </h3>
              <div className="space-y-2.5">
                {/* Ranh giới */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-4 rounded border-2 border-dashed border-[#8B1A1A] bg-[#8B1A1A]/5 shrink-0" />
                  <span className="text-sm text-slate-600">Ranh giới KP25</span>
                </div>
                <div className="border-t border-slate-50 pt-2">
                  <p className="text-xs text-slate-400 mb-2">Phản ánh theo mức độ</p>
                  {Object.entries(MUC_DO_LABEL).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-3 h-3 rounded-sm rotate-45 shrink-0"
                        style={{ background: MUC_DO_COLOR[key] }}
                      />
                      <span className="text-sm text-slate-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Danh sách phản ánh gần đây */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Phản ánh có vị trí GPS ({phanAnh.length})
              </h3>
              {phanAnh.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Chưa có phản ánh nào có tọa độ GPS
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {phanAnh.slice(0, 20).map(p => (
                    <a
                      key={p.id}
                      href={`/phan-anh/${p.id}`}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: MUC_DO_COLOR[p.mucDo] ?? '#6B7280' }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 group-hover:text-[#8B1A1A] truncate transition-colors">
                          {p.tieuDe}
                        </p>
                        {p.diaChiPhanAnh && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {p.diaChiPhanAnh}
                          </p>
                        )}
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold
                          ${p.trangThai === 'MOI'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {p.trangThai === 'MOI' ? 'Mới' : 'Đang xử lý'}
                        </span>
                      </div>
                    </a>
                  ))}
                  {phanAnh.length > 20 && (
                    <p className="text-xs text-center text-slate-400 pt-1">
                      + {phanAnh.length - 20} phản ánh khác
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
