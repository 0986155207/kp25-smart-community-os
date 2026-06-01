import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Clock, Banknote, Wifi, Building2, Users,
  FileCheck, BookOpen, MapPin, Phone, Calendar, Download,
  CheckCircle2, ChevronRight, Info, AlertCircle, Star,
} from 'lucide-react'
import {
  getThuTucById, DS_THU_TUC, LINH_VUC_CONFIG, MUC_DO_CONFIG,
  type ThuTuc,
} from '../data'
import { getMauDonByThuTuc } from '../mau-don/data'
import NopHoSoForm from './NopHoSoForm'
import HuongDanGiaiQuyet from './HuongDanGiaiQuyet'

// ─── Metadata động ──────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const tt = getThuTucById(id)
  if (!tt) return { title: 'Không tìm thấy' }
  return {
    title: tt.ten,
    description: tt.moTa,
  }
}

// ─── Static params ───────────────────────────────────────────
export function generateStaticParams() {
  return DS_THU_TUC.map(tt => ({ id: tt.id }))
}

// ─── Badge mức độ DVC ────────────────────────────────────────
function MucDoBadge({ muc }: { muc: ThuTuc['mucDoTrucTuyen'] }) {
  const cfg = MUC_DO_CONFIG[muc]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.bg }}
    >
      <Wifi size={11} />
      {cfg.label} · {cfg.moTa}
    </span>
  )
}

// ─── Section wrapper ─────────────────────────────────────────
function Section({ icon, title, children }: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#8B1A1A]/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-bold text-slate-900 text-base">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Thủ tục liên quan ───────────────────────────────────────
function ThuTucLienQuan({ current }: { current: ThuTuc }) {
  const lienQuan = DS_THU_TUC
    .filter(t => t.id !== current.id && t.linhVuc === current.linhVuc)
    .slice(0, 3)

  if (!lienQuan.length) return null

  return (
    <div>
      <h2 className="font-bold text-slate-900 text-base mb-3">
        Thủ tục liên quan — {LINH_VUC_CONFIG[current.linhVuc].label}
      </h2>
      <div className="space-y-2">
        {lienQuan.map(tt => (
          <Link
            key={tt.id}
            href={`/thu-tuc/${tt.id}`}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border
                       border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-[#8B1A1A] transition-colors">
                {tt.ten}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                {(tt.thoiHanGiaiQuyet.split('(')[0] ?? tt.thoiHanGiaiQuyet).trim()}
              </p>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:text-[#8B1A1A]" />
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default async function ChiTietThuTucPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const found = getThuTucById(id)
  if (!found) notFound()
  // notFound() throws — found is defined from here
  const tt = found as ThuTuc

  const lv  = LINH_VUC_CONFIG[tt.linhVuc]
  const md  = MUC_DO_CONFIG[tt.mucDoTrucTuyen]
  const coTheNopTrucTuyen = tt.mucDoTrucTuyen >= 3

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Breadcrumb ────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
        <ChevronRight size={12} />
        <Link href="/thu-tuc" className="hover:text-slate-700 transition-colors">Thủ tục hành chính</Link>
        <ChevronRight size={12} />
        <Link
          href={`/thu-tuc?linh_vuc=${tt.linhVuc}`}
          className="hover:text-slate-700 transition-colors"
        >
          {lv.label}
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-600 font-medium truncate max-w-[180px]">{tt.ten}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ CỘT TRÁI — Nội dung chính ════════════════════ */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Header ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* Lĩnh vực + Mã số */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ color: lv.color, backgroundColor: lv.bg }}
              >
                {lv.icon} {lv.label}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                Mã: {tt.maSo}
              </span>
              {tt.noiBat && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600
                                 px-2 py-1 rounded-xl border border-amber-200">
                  <Star size={10} fill="currentColor" /> Phổ biến
                </span>
              )}
            </div>

            {/* Tên */}
            <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-3">
              {tt.ten}
            </h1>

            {/* Mức độ DVC */}
            <MucDoBadge muc={tt.mucDoTrucTuyen} />

            {/* Mô tả */}
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {tt.moTa}
            </p>

            {/* Banner nộp trực tuyến */}
            {coTheNopTrucTuyen && (
              <div className="mt-4 flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  Thủ tục này hỗ trợ <strong>nộp hồ sơ trực tuyến</strong> — Tiết kiệm thời gian, không cần đến trực tiếp.
                </p>
              </div>
            )}
          </div>

          {/* ── Thông tin chính ────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: <Clock size={16} className="text-[#8B1A1A]" />,
                label: 'Thời hạn giải quyết',
                value: tt.thoiHanGiaiQuyet,
                bg: 'bg-red-50',
              },
              {
                icon: <Banknote size={16} className="text-blue-600" />,
                label: 'Lệ phí',
                value: tt.lePhi,
                bg: 'bg-blue-50',
              },
              {
                icon: <Building2 size={16} className="text-emerald-600" />,
                label: 'Cơ quan',
                value: (tt.coQuanGiaiQuyet.split('→')[0] ?? tt.coQuanGiaiQuyet).trim(),
                bg: 'bg-emerald-50',
              },
              {
                icon: <FileCheck size={16} className="text-purple-600" />,
                label: 'Kết quả',
                value: tt.ketQua,
                bg: 'bg-purple-50',
              },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-4`}>
                <div className="mb-2">{item.icon}</div>
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 leading-tight">{item.value}</p>
              </div>
            ))}
          </div>

          {/* ── Hướng dẫn giải quyết (3 cách) — thủ tục cấp Phường ── */}
          <HuongDanGiaiQuyet tt={tt} />

          {/* ── Đối tượng thực hiện ───────────────────── */}
          <Section icon={<Users size={15} className="text-[#8B1A1A]" />} title="Đối tượng thực hiện">
            <p className="text-sm text-slate-700 leading-relaxed">{tt.doiTuong}</p>
          </Section>

          {/* ── Thành phần hồ sơ ──────────────────────── */}
          <Section icon={<FileCheck size={15} className="text-[#8B1A1A]" />} title="Thành phần hồ sơ">
            <div className="space-y-3">
              {tt.thanhPhanHoSo.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="w-6 h-6 rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A] text-xs font-bold
                                   flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{item.ten}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Số lượng: <span className="font-medium text-slate-700">{item.soLuong}</span>
                    </p>
                    {item.ghiChu && (
                      <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                        <Info size={10} />
                        {item.ghiChu}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mẫu đơn liên quan */}
            {(() => {
              const mauDons = getMauDonByThuTuc(tt.id)
              if (!mauDons.length) return (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 border border-dashed
                                border-slate-200 rounded-xl text-xs text-slate-400">
                  <Download size={14} />
                  Không có mẫu đơn riêng — nộp trực tiếp hoặc điền theo hướng dẫn của cán bộ.
                </div>
              )
              return (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Download size={12} />
                    Mẫu đơn cần tải
                  </p>
                  {mauDons.map(md => (
                    <Link
                      key={md.id}
                      href={`/thu-tuc/mau-don/${md.id}`}
                      className="flex items-center justify-between p-3 bg-[#8B1A1A]/5 border border-[#8B1A1A]/20
                                 hover:bg-[#8B1A1A]/10 hover:border-[#8B1A1A]/40 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
                          <Download size={13} className="text-[#8B1A1A]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#8B1A1A]">{md.maSo}</p>
                          <p className="text-xs text-slate-700 font-medium truncate">{md.ten}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium shrink-0 ml-2 group-hover:text-[#8B1A1A]">
                        Xem &amp; In →
                      </span>
                    </Link>
                  ))}
                </div>
              )
            })()}
          </Section>

          {/* ── Trình tự thực hiện ────────────────────── */}
          <Section icon={<CheckCircle2 size={15} className="text-[#8B1A1A]" />} title="Trình tự thực hiện">
            <ol className="space-y-3">
              {tt.trinhTu.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#8B1A1A] text-white text-xs font-bold
                                   flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </Section>

          {/* ── Căn cứ pháp lý ───────────────────────── */}
          <Section icon={<BookOpen size={15} className="text-[#8B1A1A]" />} title="Căn cứ pháp lý">
            <ul className="space-y-2">
              {tt.canCuPhapLy.map((canCu, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#8B1A1A] mt-0.5 shrink-0">▪</span>
                  {canCu}
                </li>
              ))}
            </ul>
          </Section>

          {/* ── Lưu ý quan trọng ─────────────────────── */}
          {tt.liuY && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">Lưu ý quan trọng</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">{tt.liuY}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ══ CỘT PHẢI — Sidebar ═══════════════════════════ */}
        <div className="space-y-5">

          {/* ── Nộp hồ sơ ───────────────────────────────── */}
          <div id="nop-ho-so" className="scroll-mt-24" />
          {coTheNopTrucTuyen ? (
            <NopHoSoForm thuTucId={tt.id} tenThuTuc={tt.ten} />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Building2 size={24} className="text-slate-500" />
                </div>
                <h3 className="font-bold text-slate-800">Nộp trực tiếp</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thủ tục này cần đến UBND Phường để thực hiện trực tiếp
                </p>
              </div>
              <Link
                href="/lien-he"
                className="block w-full py-3 px-4 bg-[#8B1A1A] text-white text-sm font-semibold
                           rounded-xl text-center hover:bg-[#6d1414] transition-colors"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          )}

          {/* ── Thông tin nơi nộp ───────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-900">Thông tin nộp hồ sơ</h3>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[#8B1A1A]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Địa điểm</p>
                <p className="text-sm font-medium text-slate-800">{tt.diaDiemNop}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Giờ làm việc</p>
                <p className="text-sm font-medium text-slate-800">{tt.thoiGianLamViec}</p>
              </div>
            </div>

            {tt.hotline && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Hotline hỗ trợ</p>
                  <a
                    href={`tel:${tt.hotline.replace(/\s/g, '')}`}
                    className="text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
                  >
                    {tt.hotline}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── Hỏi AI ─────────────────────────────────── */}
          <Link
            href={`/chat?q=${encodeURIComponent(`Hướng dẫn thủ tục: ${tt.ten}`)}`}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#8B1A1A] to-[#6d1414]
                       text-white rounded-2xl hover:opacity-90 transition-opacity shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Hỏi AI Trợ lý</p>
              <p className="text-xs text-white/80">Giải đáp chi tiết về thủ tục này 24/7</p>
            </div>
            <ChevronRight size={16} className="text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* ── Tra cứu hồ sơ ───────────────────────────── */}
          <Link
            href="/thu-tuc/tra-cuu"
            className="flex items-center gap-4 p-4 bg-white border border-slate-200
                       rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800">Tra cứu hồ sơ</p>
              <p className="text-xs text-slate-500">Kiểm tra trạng thái xử lý</p>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:text-slate-600" />
          </Link>

          {/* ── Tất cả mẫu đơn ──────────────────────────── */}
          <Link
            href="/thu-tuc/mau-don"
            className="flex items-center gap-4 p-4 bg-white border border-slate-200
                       rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Download size={18} className="text-[#8B1A1A]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800">Kho mẫu đơn</p>
              <p className="text-xs text-slate-500">Tải &amp; in tất cả mẫu đơn miễn phí</p>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:text-[#8B1A1A]" />
          </Link>

          {/* ── Thủ tục liên quan ───────────────────────── */}
          <ThuTucLienQuan current={tt} />

          {/* ── Nút quay lại ────────────────────────────── */}
          <Link
            href="/thu-tuc"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách thủ tục
          </Link>

        </div>
      </div>
    </div>
  )
}
