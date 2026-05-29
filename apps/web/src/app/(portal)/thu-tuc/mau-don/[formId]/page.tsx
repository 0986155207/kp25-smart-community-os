import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, FileText, Info, AlertCircle } from 'lucide-react'
import { getMauDonById, DS_MAU_DON, type MauDon } from '../data'
import PrintButton from './PrintButton'

// ─── Form component registry ─────────────────────────────────
import FormKhaiSinh    from './forms/KhaiSinh'
import FormKhaiTu      from './forms/KhaiTu'
import FormKetHon      from './forms/KetHon'
import FormNhanChaMe   from './forms/NhanChaMe'
import FormHoKhau      from './forms/HoKhau'
import FormTroCap      from './forms/TroCap'
import FormHoNgheo     from './forms/HoNgheo'
import FormXayDung     from './forms/XayDung'
import FormHoKinhDoanh from './forms/HoKinhDoanh'
import FormLyLichTuPhap from './forms/LyLichTuPhap'

const FORM_REGISTRY: Record<string, React.ComponentType> = {
  'to-khai-khai-sinh':        FormKhaiSinh,
  'to-khai-khai-tu':          FormKhaiTu,
  'to-khai-ket-hon':          FormKetHon,
  'to-khai-nhan-cha-me-con':  FormNhanChaMe,
  'phieu-bao-thay-doi-ho-khau': FormHoKhau,
  'to-khai-tro-cap-xa-hoi':   FormTroCap,
  'don-xet-ho-ngheo':         FormHoNgheo,
  'don-de-nghi-phep-xay-dung': FormXayDung,
  'giay-de-nghi-dang-ky-ho-kd': FormHoKinhDoanh,
  'don-xac-nhan-ly-lich-tu-phap': FormLyLichTuPhap,
}

// ─── Metadata ────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ formId: string }> }
): Promise<Metadata> {
  const { formId } = await params
  const mauDon = getMauDonById(formId)
  if (!mauDon) return { title: 'Không tìm thấy mẫu đơn' }
  return {
    title: `${mauDon.ten} — ${mauDon.maSo}`,
    description: mauDon.huongDan,
  }
}

// ─── Static params ───────────────────────────────────────────
export function generateStaticParams() {
  return DS_MAU_DON.map(m => ({ formId: m.id }))
}

// ─── Chip lĩnh vực / cơ quan ban hành ───────────────────────
function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs font-medium text-slate-700 leading-snug">{value}</span>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default async function MauDonPage(
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params
  const found = getMauDonById(formId)
  if (!found) notFound()
  const mauDon = found as MauDon

  const FormComponent = FORM_REGISTRY[formId]

  return (
    <>
      {/* ── Toolbar — ẩn khi in ─────────────────────────── */}
      <div className="print:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={11} />
            <Link href="/thu-tuc" className="hover:text-slate-600 transition-colors">Thủ tục hành chính</Link>
            <ChevronRight size={11} />
            <Link href="/thu-tuc/mau-don" className="hover:text-slate-600 transition-colors">Mẫu đơn</Link>
            <ChevronRight size={11} />
            <span className="text-slate-600 font-medium truncate max-w-[200px]">{mauDon.maSo}</span>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Tiêu đề mẫu đơn */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[#8B1A1A]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-[#8B1A1A] bg-red-50 px-2 py-0.5 rounded-lg">
                    {mauDon.maSo}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{mauDon.trangIn} trang A4</span>
                </div>
                <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                  {mauDon.ten}
                </h1>
              </div>
            </div>

            {/* Nút in */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/thu-tuc/mau-don"
                className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200
                           rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Danh sách mẫu đơn
              </Link>
              <PrintButton />
            </div>
          </div>
        </div>
      </div>

      {/* ── Meta info — ẩn khi in ────────────────────────── */}
      <div className="print:hidden max-w-5xl mx-auto px-4 py-5">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <InfoChip label="Cơ quan ban hành" value={mauDon.banHanh} />
            <InfoChip label="Số trang" value={`${mauDon.trangIn} trang A4`} />
            <InfoChip label="Căn cứ pháp lý" value={mauDon.canCu} />
            <InfoChip label="Mã số biểu mẫu" value={mauDon.maSo} />
          </div>

          {/* Hướng dẫn */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Hướng dẫn điền</p>
              <p className="text-xs text-amber-700 leading-relaxed">{mauDon.huongDan}</p>
            </div>
          </div>
        </div>

        {/* Hướng dẫn in */}
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl mb-5 text-xs text-blue-700">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p>
            Nhấn <strong>In / Lưu PDF</strong> để tải mẫu đơn về hoặc in trực tiếp.
            Mẫu đơn được định dạng chuẩn khổ A4 — điền tay hoặc điền trên máy trước khi in.
            Không tẩy xóa sau khi đã ký tên.
          </p>
        </div>
      </div>

      {/* ── Form preview (screen) ────────────────────────── */}
      <div className="print:hidden max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header preview */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Xem trước — {mauDon.maSo}
            </span>
            <span className="text-xs text-slate-400">{mauDon.trangIn} trang · A4</span>
          </div>

          {/* Form content */}
          <div className="p-6">
            {FormComponent ? (
              <FormComponent />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText size={40} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">Mẫu đơn đang được cập nhật</p>
                <p className="text-xs mt-1">Vui lòng liên hệ UBND Phường để nhận bản cứng</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Form khi in — full page ──────────────────────── */}
      <div className="hidden print:block">
        {FormComponent && <FormComponent />}
      </div>
    </>
  )
}
