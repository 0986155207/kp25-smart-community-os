import type { Metadata } from 'next'
import Link from 'next/link'
import {
  UserCheck, UserMinus, Search, ArrowRight,
  Clock, FileText, Phone, CheckCircle2, Info,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Đăng ký Tạm trú / Tạm vắng',
  description:
    'Đăng ký tạm trú, khai báo tạm vắng trực tuyến tại Khu phố 25, Phường Long Trường, TP.HCM',
}

// ─── Dữ liệu tĩnh ──────────────────────────────────────────────

const SERVICES = [
  {
    href:    '/dang-ky/tam-tru',
    icon:    UserCheck,
    title:   'Đăng ký Tạm trú',
    desc:    'Dành cho người từ nơi khác đến cư trú tại Khu phố 25 trong thời gian nhất định.',
    color:   'bg-blue-600',
    border:  'border-blue-100',
    bg:      'hover:border-blue-300',
    badge:   'bg-blue-50 text-blue-700',
    badgeTxt:'Từ nơi khác đến',
    steps: [
      'Điền thông tin cá nhân & CCCD',
      'Nhập địa chỉ tạm trú & chủ nhà',
      'Chọn thời gian & lý do lưu trú',
    ],
    note: 'Thời hạn tối đa 24 tháng · Gia hạn khi cần',
  },
  {
    href:    '/dang-ky/tam-vang',
    icon:    UserMinus,
    title:   'Khai báo Tạm vắng',
    desc:    'Dành cho cư dân KP25 rời khỏi địa phương từ 30 ngày trở lên (bắt buộc theo quy định).',
    color:   'bg-orange-500',
    border:  'border-orange-100',
    bg:      'hover:border-orange-300',
    badge:   'bg-orange-50 text-orange-700',
    badgeTxt:'Rời khỏi KP25',
    steps: [
      'Nhập thông tin & số CCCD',
      'Nhập địa chỉ nơi đến',
      'Xác nhận ngày đi & ngày dự kiến về',
    ],
    note: 'Bắt buộc khi vắng mặt > 30 ngày liên tục',
  },
]

const STEPS = [
  { icon: FileText,     label: 'Điền đơn trực tuyến', desc:  'Hoàn toàn miễn phí, không cần đến trực tiếp' },
  { icon: Clock,        label: 'Xử lý 1–3 ngày',      desc:  'Ban quản lý khu phố xem xét và xác nhận' },
  { icon: Phone,        label: 'Nhận thông báo',       desc:  'Kết quả qua điện thoại hoặc trực tiếp' },
  { icon: CheckCircle2, label: 'Hoàn tất thủ tục',     desc:  'Hồ sơ được lưu vào hệ thống khu phố' },
]

// ─── Page ────────────────────────────────────────────────────────
export default function DangKyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-2">
          <FileText size={13} />
          Dịch vụ hành chính trực tuyến
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Đăng ký Tạm trú · Tạm vắng
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
          Khu phố 25, Phường Long Trường, TP.HCM. Nộp đơn trực tuyến 24/7 — không cần
          xếp hàng, không phiền hà thủ tục.
        </p>
      </div>

      {/* ── 2 dịch vụ chính ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SERVICES.map((svc) => (
          <Link
            key={svc.href}
            href={svc.href}
            className={`group block bg-white rounded-2xl border-2 ${svc.border} ${svc.bg} shadow-sm p-6 transition-all duration-200 hover:shadow-md`}
          >
            {/* Icon + badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${svc.color} flex items-center justify-center shadow-sm`}>
                <svc.icon size={22} className="text-white" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${svc.badge}`}>
                {svc.badgeTxt}
              </span>
            </div>

            {/* Title + desc */}
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">{svc.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">{svc.desc}</p>

            {/* Steps */}
            <ul className="space-y-1.5 mb-4">
              {svc.steps.map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`w-4 h-4 rounded-full ${svc.color} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>

            {/* Note */}
            <p className="text-[11px] text-slate-400 mb-4 flex items-center gap-1">
              <Info size={11} />
              {svc.note}
            </p>

            {/* CTA */}
            <div className={`flex items-center gap-2 text-sm font-semibold ${svc.color.replace('bg-', 'text-')} group-hover:gap-3 transition-all`}>
              Bắt đầu đăng ký
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Tra cứu ──────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
          <Search size={22} className="text-slate-600" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-slate-800 mb-1">Tra cứu trạng thái hồ sơ</h3>
          <p className="text-sm text-slate-500">
            Nhập số CCCD để kiểm tra tình trạng đơn đăng ký tạm trú hoặc khai báo tạm vắng đã nộp.
          </p>
        </div>
        <Link
          href="/dang-ky/tra-cuu"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm rounded-xl transition-all"
        >
          <Search size={15} />
          Tra cứu ngay
        </Link>
      </div>

      {/* ── Công an khu vực phụ trách ────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xl">👮</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-0.5">
            Công an khu vực xét duyệt đơn
          </p>
          <p className="font-bold text-blue-900 text-lg">Trần Hữu Hùng</p>
          <p className="text-sm text-blue-700">
            Công an khu vực — Khu phố 25, Phường Long Trường, TP.HCM
          </p>
          <a
            href="tel:0988897709"
            className="inline-flex items-center gap-1.5 mt-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            📞 0988 897 709
          </a>
        </div>
        <div className="hidden sm:block text-right shrink-0">
          <p className="text-xs text-blue-500">Thời hạn xét duyệt</p>
          <p className="font-bold text-blue-800">1–5 ngày làm việc</p>
        </div>
      </div>

      {/* ── Quy trình ────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-5 text-center">Quy trình xử lý</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-slate-200" />
              )}
              <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-3 relative z-10">
                <step.icon size={18} className="text-[#8B1A1A]" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{step.label}</p>
              <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quy định pháp lý ─────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Căn cứ pháp lý</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• <strong>Luật Cư trú 2020</strong> (số 68/2020/QH14) — Có hiệu lực từ 01/07/2021, thay thế NĐ 31/2014</li>
              <li>• <strong>Thông tư 56/2021/TT-BCA</strong> — Quy định chi tiết đăng ký, quản lý cư trú</li>
              <li>• Thời hạn đăng ký tạm trú tối đa <strong>24 tháng</strong>, được gia hạn nhiều lần</li>
            </ul>
            <p className="text-xs text-amber-700 mt-2">
              Không khai báo tạm vắng khi vắng mặt hơn 30 ngày có thể bị xử phạt vi phạm hành chính.
            </p>
          </div>
        </div>
      </div>

      {/* ── Hỗ trợ ───────────────────────────────────────────── */}
      <div className="text-center text-sm text-slate-500">
        Cần hỗ trợ?{' '}
        <Link href="/lien-he" className="text-[#8B1A1A] font-semibold hover:underline">
          Liên hệ Ban quản lý Khu phố 25
        </Link>
        {' '}hoặc gọi <a href="tel:0773735317" className="text-[#8B1A1A] font-semibold hover:underline">0773 735 317</a>
      </div>
    </div>
  )
}
