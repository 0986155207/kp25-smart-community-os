import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, FileText, Printer, Search } from 'lucide-react'
import { DS_MAU_DON } from './data'

export const metadata: Metadata = {
  title: `Mẫu đơn hành chính — ${KHU_PHO.ten}`,
  description: 'Tải và in các mẫu đơn hành chính chính thức tại UBND Phường Long Trường, TP.HCM.',
}

// ─── Nhóm mẫu đơn theo cơ quan ban hành ─────────────────────
const BAN_HANH_ORDER = [
  'Bộ Tư pháp',
  'Bộ Công an',
  'Bộ Lao động – Thương binh & Xã hội',
  'Bộ Xây dựng',
  'Bộ Kế hoạch & Đầu tư',
  'UBND TP.HCM',
]

function groupByBanHanh() {
  const map: Record<string, typeof DS_MAU_DON> = {}
  for (const m of DS_MAU_DON) {
    if (!map[m.banHanh]) map[m.banHanh] = []
    map[m.banHanh]!.push(m)
  }
  // Sort by predetermined order, then alphabetically for extras
  const ordered: [string, typeof DS_MAU_DON][] = []
  for (const key of BAN_HANH_ORDER) {
    if (map[key]) ordered.push([key, map[key]!])
  }
  for (const [key, val] of Object.entries(map)) {
    if (!BAN_HANH_ORDER.includes(key)) ordered.push([key, val])
  }
  return ordered
}

// ─── Icon per cơ quan ────────────────────────────────────────
const BAN_HANH_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  'Bộ Tư pháp':                             { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  'Bộ Công an':                              { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  'Bộ Lao động – Thương binh & Xã hội':     { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Bộ Xây dựng':                            { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  'Bộ Kế hoạch & Đầu tư':                   { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
  'UBND TP.HCM':                             { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
}

function getBanHanhColor(banHanh: string) {
  return BAN_HANH_COLOR[banHanh] ?? { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' }
}

// ─── Page ────────────────────────────────────────────────────
export default function MauDonListPage() {
  const grouped = groupByBanHanh()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Breadcrumb ────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={11} />
        <Link href="/thu-tuc" className="hover:text-slate-600 transition-colors">Thủ tục hành chính</Link>
        <ChevronRight size={11} />
        <span className="text-slate-600 font-medium">Mẫu đơn</span>
      </nav>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center">
            <FileText size={22} className="text-[#8B1A1A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Mẫu đơn hành chính</h1>
            <p className="text-sm text-slate-500 mt-0.5">Tải và in miễn phí — Cập nhật theo quy định mới nhất 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className="w-5 h-5 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#8B1A1A]">{DS_MAU_DON.length}</span>
            </span>
            mẫu đơn
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-blue-600">{grouped.length}</span>
            </span>
            cơ quan ban hành
          </div>
          <div className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
            <Printer size={14} />
            In ngay, miễn phí
          </div>
        </div>
      </div>

      {/* ── Hướng dẫn sử dụng ───────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <Search size={18} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Cách sử dụng mẫu đơn</p>
            <ol className="space-y-1 text-blue-700 list-decimal list-inside">
              <li>Chọn mẫu đơn phù hợp với thủ tục cần thực hiện</li>
              <li>Xem trước mẫu đơn trên màn hình và đọc hướng dẫn điền</li>
              <li>Nhấn <strong>In / Lưu PDF</strong> để tải về hoặc in trực tiếp</li>
              <li>Điền thông tin vào mẫu đơn — viết rõ ràng, không tẩy xóa</li>
              <li>Nộp hồ sơ tại UBND Phường hoặc qua cổng dịch vụ công trực tuyến</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── Danh sách mẫu đơn theo nhóm ──────────────────── */}
      <div className="space-y-8">
        {grouped.map(([banHanh, forms]) => {
          const color = getBanHanhColor(banHanh)
          return (
            <div key={banHanh}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wide">{banHanh}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                  {forms.length} mẫu
                </span>
              </div>

              {/* Form cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {forms.map(form => (
                  <Link
                    key={form.id}
                    href={`/thu-tuc/mau-don/${form.id}`}
                    className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100
                               shadow-sm hover:border-[#8B1A1A]/30 hover:shadow-md transition-all group"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.bg}`}>
                      <FileText size={18} className={color.text} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${color.bg} ${color.text}`}>
                          {form.maSo}
                        </span>
                        <span className="text-[10px] text-slate-400">{form.trangIn} trang</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-[#8B1A1A]
                                    transition-colors line-clamp-2">
                        {form.ten}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{form.canCu}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 shrink-0 mt-1">
                      <Printer size={14} className="text-slate-300 group-hover:text-[#8B1A1A] transition-colors" />
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-[#8B1A1A] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer note ───────────────────────────────────── */}
      <div className="mt-10 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600">
        <p className="font-semibold text-slate-700 mb-2">Lưu ý khi sử dụng mẫu đơn</p>
        <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-500">
          <li>Mẫu đơn được cập nhật theo quy định pháp luật mới nhất — kiểm tra số hiệu văn bản trước khi sử dụng.</li>
          <li>Một số thủ tục yêu cầu in 02 bản — đọc hướng dẫn cụ thể trên từng mẫu.</li>
          <li>Không được tẩy xóa, sửa chữa nội dung đã điền — cần điền lại trên tờ mới.</li>
          <li>Để hỏi thêm, liên hệ bộ phận một cửa UBND Phường Long Trường hoặc <Link href="/chat" className="text-[#8B1A1A] font-semibold hover:underline">Hỏi AI Trợ lý</Link>.</li>
        </ul>
      </div>
    </div>
  )
}
