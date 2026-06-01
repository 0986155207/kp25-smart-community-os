import Link from 'next/link'
import {
  Globe, Building2, HandHelping, ExternalLink, MapPin, Clock, Phone,
  Smartphone, Info,
} from 'lucide-react'
import type { ThuTuc } from '../data'

// Cổng dịch vụ công chính thức
const CONG_DVC_QUOC_GIA = 'https://dichvucong.gov.vn'
const CONG_DVC_HCM      = 'https://dichvucong.hochiminhcity.gov.vn'

/**
 * Hướng dẫn 3 cách giải quyết thủ tục thuộc thẩm quyền UBND Phường.
 * Hiển thị khi cơ quan giải quyết là UBND Phường (khu phố không trực tiếp giải quyết).
 */
export default function HuongDanGiaiQuyet({ tt }: { tt: ThuTuc }) {
  const coQuan = tt.coQuanGiaiQuyet
  const thuocPhuong = /phường|ubnd/i.test(coQuan)
  if (!thuocPhuong) return null

  const onlineDuoc = tt.mucDoTrucTuyen >= 3
  const coTheNopTaiCong = tt.id   // dùng cổng KP25 (mức 3-4 có form nộp)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
          <Info size={17} className="text-amber-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base">Thủ tục này do UBND Phường giải quyết</h2>
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
            Theo mô hình hành chính 2 cấp, thủ tục thuộc thẩm quyền của <strong>{coQuan}</strong>.
            Khu phố 25 là điểm tiếp nhận và hỗ trợ — bạn có <strong>3 cách</strong> để hoàn tất:
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* ── Cách 1: Trực tuyến ── */}
        <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <Globe size={15} className="text-blue-600" />
            <span className="font-bold text-slate-800 text-sm">Nộp trực tuyến (khuyến khích)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {onlineDuoc
              ? 'Thủ tục này hỗ trợ nộp hồ sơ trực tuyến. Nộp ngay tại cổng này, hoặc qua Cổng Dịch vụ công chính thức / ứng dụng VNeID.'
              : 'Tra cứu và theo dõi trên Cổng Dịch vụ công chính thức. Một số bước có thể cần nộp trực tiếp.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {onlineDuoc && (
              <Link
                href={`#nop-ho-so`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#8B1A1A] text-white text-xs font-semibold rounded-lg hover:bg-[#6d1414] transition-colors"
              >
                <Smartphone size={13} /> Nộp tại cổng KP25
              </Link>
            )}
            <a
              href={CONG_DVC_QUOC_GIA}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Cổng DVC Quốc gia <ExternalLink size={11} />
            </a>
            <a
              href={CONG_DVC_HCM}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Cổng DVC TP.HCM <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* ── Cách 2: Trực tiếp tại Một cửa ── */}
        <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <Building2 size={15} className="text-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">Nộp trực tiếp tại UBND Phường</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{tt.diaDiemNop}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={12} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{tt.thoiGianLamViec}</span>
            </div>
            {tt.hotline && (
              <div className="flex items-start gap-2">
                <Phone size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                <a href={`tel:${tt.hotline.replace(/\s/g, '')}`} className="font-semibold text-emerald-700 hover:underline">
                  {tt.hotline}
                </a>
                <span className="text-slate-400">(UBND Phường Long Trường)</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Cách 3: Nhờ Khu phố hỗ trợ ── */}
        <div className="border border-[#8B1A1A]/15 bg-red-50/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center">3</span>
            <HandHelping size={15} className="text-[#8B1A1A]" />
            <span className="font-bold text-slate-800 text-sm">Nhờ Khu phố 25 hỗ trợ</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Chưa rõ thủ tục hoặc cần giúp chuẩn bị hồ sơ? Ban quản lý Khu phố 25 hướng dẫn,
            hỗ trợ chuẩn bị và chuyển hồ sơ lên UBND Phường giúp bạn.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#8B1A1A] text-white text-xs font-semibold rounded-lg hover:bg-[#6d1414] transition-colors"
            >
              <Phone size={13} /> Liên hệ Ban quản lý KP25
            </Link>
            <Link
              href={`/chat?q=${encodeURIComponent(`Hướng dẫn thủ tục: ${tt.ten}`)}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#8B1A1A]/20 text-[#8B1A1A] text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              🤖 Hỏi AI Trợ lý
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
