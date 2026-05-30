import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertCircle, MapPin, Phone, User,
  Clock, Calendar, ChevronRight, CheckCircle,
  XCircle, Image as ImageIcon, Sparkles, Navigation,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatDate, mapPhanAnh, truncate } from '@/lib/utils'
import { Suspense } from 'react'
import ShareButton from '../../thong-bao/[id]/ShareButton'
import PhanAnhLiveStatus from '@/components/phan-anh/PhanAnhLiveStatus'
import ThanhCongBanner from './ThanhCongBanner'

// ─── Config ─────────────────────────────────────────────────
const TRANG_THAI_CFG: Record<string, {
  label: string; badge: string; color: string; bg: string
  Icon: typeof Clock; desc: string
}> = {
  MOI: {
    label: 'Mới — Chờ tiếp nhận',
    badge: 'badge-yellow', color: 'text-amber-600', bg: 'bg-amber-50',
    Icon: Clock,
    desc: 'Phản ánh của bạn đã được ghi nhận. Ban quản lý khu phố sẽ sớm tiếp nhận.',
  },
  DANG_XU_LY: {
    label: 'Đang xử lý',
    badge: 'badge-blue', color: 'text-blue-600', bg: 'bg-blue-50',
    Icon: Clock,
    desc: 'Cán bộ đã tiếp nhận và đang trong quá trình xử lý phản ánh của bạn.',
  },
  DA_XU_LY: {
    label: 'Đã xử lý xong',
    badge: 'badge-green', color: 'text-emerald-600', bg: 'bg-emerald-50',
    Icon: CheckCircle,
    desc: 'Phản ánh của bạn đã được giải quyết hoàn toàn. Cảm ơn bạn đã đóng góp!',
  },
  DONG: {
    label: 'Đã đóng',
    badge: 'badge-gray', color: 'text-slate-500', bg: 'bg-slate-100',
    Icon: XCircle,
    desc: 'Hồ sơ phản ánh đã được đóng lại.',
  },
}

const MUC_DO_CFG: Record<string, { label: string; badge: string; color: string }> = {
  KHAN_CAP: { label: 'Khẩn cấp', badge: 'badge-red',    color: 'text-red-600' },
  CAO:      { label: 'Cao',      badge: 'badge-orange',  color: 'text-orange-600' },
  TRUNG_BINH: { label: 'Trung bình', badge: 'badge-yellow', color: 'text-amber-600' },
  THAP:     { label: 'Thấp',     badge: 'badge-gray',    color: 'text-slate-500' },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh', MOI_TRUONG: 'Môi trường',
  HA_TANG: 'Hạ tầng', AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông', KHAC: 'Khác',
}

// ─── Timeline bước xử lý ────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'MOI',       label: 'Gửi phản ánh',      icon: AlertCircle },
  { key: 'DANG_XU_LY', label: 'Đang xử lý',       icon: Clock },
  { key: 'DA_XU_LY',  label: 'Hoàn thành',         icon: CheckCircle },
]

// ─── Metadata ───────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('phan_anh')
    .select('tieu_de, mo_ta')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!data) return { title: 'Phản ánh không tồn tại' }
  return {
    title: data.tieu_de,
    description: truncate(data.mo_ta, 160),
  }
}

// ─── Page ───────────────────────────────────────────────────
export default async function ChiTietPhanAnhPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }   = await params
  const supabase = await createClient()

  const [mainResult, relatedResult] = await Promise.all([
    supabase
      .from('phan_anh')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('phan_anh')
      .select('id, tieu_de, loai, trang_thai, muc_do, created_at, dia_chi_phan_anh')
      .is('deleted_at', null)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  if (!mainResult.data) notFound()

  const item    = mapPhanAnh(mainResult.data)
  const related = (relatedResult.data ?? []).map(mapPhanAnh)

  // AI fields từ raw data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw           = mainResult.data as any
  const aiDaPhanTich  = raw.ai_da_phan_tich  as boolean | null
  const aiTomTat      = raw.ai_tom_tat       as string  | null
  const aiTinhNang    = raw.ai_tinh_nang     as string[] | null
  const aiDeXuat      = raw.ai_de_xuat       as string  | null
  const aiDoTinCay    = raw.ai_do_tin_cay    as number  | null
  const aiMucDo       = raw.ai_muc_do        as string  | null

  const ttCfg  = TRANG_THAI_CFG[item.trangThai] ?? TRANG_THAI_CFG['MOI']!
  const mdCfg  = MUC_DO_CFG[item.mucDo]          ?? MUC_DO_CFG['TRUNG_BINH']!
  const isDone = item.trangThai === 'DA_XU_LY' || item.trangThai === 'DONG'

  // Bước hiện tại trong timeline
  const currentStep = item.trangThai === 'DONG' ? 'DA_XU_LY' : item.trangThai
  const stepIndex   = TIMELINE_STEPS.findIndex((s) => s.key === currentStep)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Banner thành công — client-side, tự đọc ?moi=1, cần Suspense vì useSearchParams */}
      <Suspense fallback={null}>
        <ThanhCongBanner
          phanAnhId={item.id}
          shortCode={item.id.slice(0, 8).toUpperCase()}
        />
      </Suspense>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link href="/phan-anh" className="hover:text-slate-600 transition-colors">Phản ánh</Link>
        <ChevronRight size={14} />
        <span className="text-slate-600 truncate max-w-[200px]">{item.tieuDe}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cột trái: nội dung ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* Trạng thái realtime — tự cập nhật khi cán bộ thay đổi */}
              <PhanAnhLiveStatus
                phanAnhId={item.id}
                initialStatus={item.trangThai}
              />
              <span className={`badge ${mdCfg.badge}`}>{mdCfg.label}</span>
              <span className="badge badge-gray">{LOAI_LABEL[item.loai] ?? item.loai}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {item.tieuDe}
            </h1>
            <div className="flex items-center flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDateTime(item.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs">
                Mã: {item.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Trạng thái tiến trình */}
          <div className={`rounded-2xl p-5 ${ttCfg.bg}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/80`}>
                <ttCfg.Icon size={20} className={ttCfg.color} />
              </div>
              <div>
                <p className={`font-bold ${ttCfg.color}`}>{ttCfg.label}</p>
                <p className="text-sm text-slate-600 mt-0.5">{ttCfg.desc}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const done    = i <= stepIndex
                const current = i === stepIndex
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-white border-current shadow-sm ' + ttCfg.color
                          : 'bg-white/50 border-slate-300 text-slate-300'
                      } ${current ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
                        <step.icon size={14} className={done ? ttCfg.color : 'text-slate-300'} />
                      </div>
                      <span className={`text-xs mt-1 text-center w-20 leading-tight ${
                        done ? 'font-semibold ' + ttCfg.color : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 ${
                        i < stepIndex ? ttCfg.bg.replace('bg-', 'bg-') + ' opacity-100' : 'bg-slate-200'
                      } ${i < stepIndex ? 'bg-current opacity-50' : ''}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Nội dung mô tả */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" />
              Nội dung phản ánh
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.moTa}</p>
          </div>

          {/* ── AI Analysis Panel ──────────────────────── */}
          {aiDaPhanTich && (
            <div className="rounded-2xl border-2 border-violet-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-white" />
                  <span className="text-sm font-bold text-white">Kết quả phân tích AI</span>
                  <span className="text-[10px] text-violet-200 bg-white/20 px-2 py-0.5 rounded-full">
                    Gemini 2.5 Flash
                  </span>
                </div>
                {aiDoTinCay !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${aiDoTinCay >= 80 ? 'bg-green-400' : aiDoTinCay >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${aiDoTinCay}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{aiDoTinCay}%</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-violet-50/40 space-y-3">
                {/* Tóm tắt */}
                {aiTomTat && (
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiTomTat}</p>
                )}

                {/* Mức độ AI gợi ý */}
                {aiMucDo && aiMucDo !== item.mucDo && (
                  <div className="flex items-center gap-2 text-xs text-violet-600">
                    <Sparkles size={11} />
                    <span>AI gợi ý mức độ: <strong>{
                      aiMucDo === 'KHAN_CAP' ? 'Khẩn cấp' :
                      aiMucDo === 'CAO' ? 'Cao' :
                      aiMucDo === 'TRUNG_BINH' ? 'Trung bình' : 'Thấp'
                    }</strong></span>
                  </div>
                )}

                {/* Các vấn đề phát hiện */}
                {aiTinhNang && aiTinhNang.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vấn đề AI phát hiện</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiTinhNang.map((t, i) => (
                        <span key={i} className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-lg font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Đề xuất xử lý */}
                {aiDeXuat && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <ChevronRight size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-bold">Đề xuất xử lý: </span>{aiDeXuat}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Địa điểm */}
          {(item.diaChiPhanAnh || item.toaDoLat) && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                Địa điểm phản ánh
              </h2>
              {item.diaChiPhanAnh && (
                <p className="text-slate-700 mb-2">{item.diaChiPhanAnh}</p>
              )}
              {item.toaDoLat && item.toaDoLng && (
                <div className="space-y-2">
                  {/* Mini map preview via static maps */}
                  <div className="rounded-xl overflow-hidden border border-slate-100 aspect-video max-h-48 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300&center=lonlat:${item.toaDoLng},${item.toaDoLat}&zoom=17&marker=lonlat:${item.toaDoLng},${item.toaDoLat};type:awesome;color:%238B1A1A;size:small|apiKey=null`}
                      alt="Bản đồ địa điểm"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback: ẩn nếu không load được map
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Navigation size={10} />
                      {(item.toaDoLat as number).toFixed(6)}, {(item.toaDoLng as number).toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${item.toaDoLat},${item.toaDoLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#8B1A1A] hover:underline font-medium"
                    >
                      <MapPin size={13} />
                      Xem trên Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hình ảnh */}
          {item.anhUrls.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-violet-500" />
                Hình ảnh đính kèm
                <span className="font-normal text-slate-400 text-sm">
                  ({item.anhUrls.length} ảnh)
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {item.anhUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Ảnh ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-xl hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Kết quả xử lý */}
          {isDone && item.ketQuaXuLy && (
            <div className="card border-emerald-100 bg-emerald-50/60">
              <h2 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                Kết quả xử lý từ Ban quản lý
              </h2>
              <p className="text-emerald-700 leading-relaxed whitespace-pre-wrap">
                {item.ketQuaXuLy}
              </p>
              {item.thoiGianXuLy && (
                <p className="text-emerald-500 text-xs mt-3 flex items-center gap-1">
                  <Clock size={11} />
                  Hoàn thành lúc {formatDateTime(item.thoiGianXuLy)}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href="/phan-anh"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={15} />
              Xem tất cả phản ánh
            </Link>
            <ShareButton title={item.tieuDe} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-5">

          {/* Thông tin hồ sơ */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Thông tin hồ sơ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-400 shrink-0 mt-0.5">Trạng thái</span>
                <PhanAnhLiveStatus
                  phanAnhId={item.id}
                  initialStatus={item.trangThai}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mức độ</span>
                <span className={`font-semibold ${mdCfg.color}`}>{mdCfg.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loại</span>
                <span className="text-slate-700">{LOAI_LABEL[item.loai] ?? item.loai}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày gửi</span>
                <span className="text-slate-700">{formatDate(item.createdAt)}</span>
              </div>
              {item.thoiGianXuLy && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày xử lý</span>
                  <span className="text-slate-700">{formatDate(item.thoiGianXuLy)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Mã hồ sơ</span>
                <span className="text-slate-400 font-mono text-xs">
                  {item.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Người gửi */}
          {(item.nguoiGuiTen || item.nguoiGuiSdt) && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <User size={15} className="text-slate-400" />
                Người phản ánh
              </h3>
              <div className="space-y-2 text-sm">
                {item.nguoiGuiTen && (
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">{item.nguoiGuiTen}</span>
                  </div>
                )}
                {item.nguoiGuiSdt && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <a href={`tel:${item.nguoiGuiSdt}`} className="text-[#8B1A1A] hover:underline font-medium">
                      {item.nguoiGuiSdt}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA gửi phản ánh mới */}
          <div className="card bg-orange-50 border-orange-100">
            <AlertCircle size={20} className="text-orange-500 mb-2" />
            <h3 className="font-bold text-slate-900 mb-1">Có vấn đề khác?</h3>
            <p className="text-slate-500 text-sm mb-3">
              Gửi phản ánh mới để Ban quản lý khu phố xử lý kịp thời.
            </p>
            <Link
              href="/phan-anh/tao"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#8B1A1A] hover:bg-[#7a1616] px-3 py-2 rounded-lg transition-colors"
            >
              Gửi phản ánh mới
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Phản ánh khác */}
          {related.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                Phản ánh gần đây
              </h3>
              <div className="space-y-1">
                {related.map((r) => {
                  const rCfg = TRANG_THAI_CFG[r.trangThai] ?? TRANG_THAI_CFG['MOI']!
                  return (
                    <Link
                      key={r.id}
                      href={`/phan-anh/${r.id}`}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${rCfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <AlertCircle size={14} className={rCfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-[#8B1A1A] transition-colors leading-snug">
                          {r.tieuDe}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`badge ${rCfg.badge} text-[10px]`}>
                            {rCfg.label.split(' —')[0]}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <Link
                href="/phan-anh"
                className="flex items-center justify-center gap-1 mt-3 text-sm text-[#8B1A1A] hover:underline font-medium"
              >
                Xem tất cả <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
