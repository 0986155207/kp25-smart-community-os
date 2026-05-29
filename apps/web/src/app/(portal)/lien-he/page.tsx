import type { Metadata } from 'next'
import { Phone, MapPin, Clock, Mail, AlertCircle, Shield, User } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Liên hệ — KP25 Smart Community',
  description: 'Thông tin liên hệ Ban quản lý Khu phố 25, Phường Long Trường, TP.HCM',
}

const contacts = [
  {
    title:     'Trưởng khu phố',
    name:      'Nguyễn Thị Hồng Thủy',
    phone:     '0773 735 317',
    phoneRaw:  '0773735317',
    role:      'Phụ trách chung',
    color:     'bg-red-50',
    iconColor: 'text-[#8B1A1A]',
    iconBg:    'bg-[#8B1A1A]/10',
    icon:      User,
  },
  {
    title:     'Bí thư Chi bộ',
    name:      'Phan Tấn Tài',
    phone:     '0986 155 207',
    phoneRaw:  '0986155207',
    role:      'Công tác Đảng',
    color:     'bg-blue-50',
    iconColor: 'text-[#1E3A5F]',
    iconBg:    'bg-[#1E3A5F]/10',
    icon:      User,
  },
  {
    title:     'Công an khu vực',
    name:      'Trần Hữu Hùng',
    phone:     '0988 897 709',
    phoneRaw:  '0988897709',
    role:      'An ninh trật tự',
    color:     'bg-emerald-50',
    iconColor: 'text-emerald-700',
    iconBg:    'bg-emerald-100',
    icon:      Shield,
  },
  {
    title:     'An ninh khu phố',
    name:      'Mai Ngọc Nhân',
    phone:     '0907 235 682',
    phoneRaw:  '0907235682',
    role:      'Tuần tra – Bảo vệ',
    color:     'bg-amber-50',
    iconColor: 'text-amber-700',
    iconBg:    'bg-amber-100',
    icon:      Shield,
  },
]

export default function LienHePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Tiêu đề ──────────────────────────────────────── */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Liên hệ Ban quản lý</h1>
        <p className="text-slate-500">Khu phố 25 · Phường Long Trường · TP.HCM</p>
      </div>

      {/* ── Khẩn cấp ─────────────────────────────────────── */}
      <div className="bg-[#8B1A1A] text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={24} />
          <h2 className="text-xl font-bold">Khẩn cấp?</h2>
        </div>
        <p className="text-white/80 mb-4">
          Trong trường hợp khẩn cấp về an ninh, hỏa hoạn, y tế — hãy gọi ngay:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Công an', number: '113' },
            { label: 'Cứu hỏa', number: '114' },
            { label: 'Cấp cứu', number: '115' },
          ].map(e => (
            <a
              key={e.number}
              href={`tel:${e.number}`}
              className="flex flex-col items-center p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors active:scale-95"
            >
              <span className="text-2xl font-bold">{e.number}</span>
              <span className="text-sm text-white/70">{e.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Danh sách liên hệ ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {contacts.map(c => (
          <div key={c.title} className={`rounded-2xl border border-slate-100 shadow-sm p-5 ${c.color}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
                <c.icon size={18} className={c.iconColor} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <User size={13} className="text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-800">{c.name}</span>
              </div>
              <a
                href={`tel:${c.phoneRaw}`}
                className={`flex items-center gap-2 group`}
              >
                <Phone size={13} className={`shrink-0 ${c.iconColor}`} />
                <span className={`text-sm font-bold ${c.iconColor} group-hover:underline`}>
                  {c.phone}
                </span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── UBND Phường Long Trường ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
            <MapPin size={16} className="text-[#1E3A5F]" />
          </div>
          <h2 className="font-bold text-slate-900">UBND Phường Long Trường</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-[#8B1A1A] mt-0.5 shrink-0" />
            <span className="text-slate-700">
              1341 Nguyễn Duy Trinh – Phường Long Trường – TP.HCM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-emerald-600 shrink-0" />
            <a
              href="tel:02837461111"
              className="text-emerald-700 font-semibold hover:underline"
            >
              028 3746 1111
            </a>
            <span className="text-slate-400 text-xs">(Hotline UBND)</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-blue-500 shrink-0" />
            <a
              href="mailto:taip2704@gmail.com"
              className="text-[#1E3A5F] font-semibold hover:underline"
            >
              taip2704@gmail.com
            </a>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-slate-600">
              <p>Thứ Hai – Thứ Sáu: 7:30 – 11:30 &amp; 13:30 – 17:00</p>
              <p>Thứ Bảy: 7:30 – 11:30</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Địa chỉ KP25 ─────────────────────────────────── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-slate-500" />
          <h2 className="font-bold text-slate-700">Khu phố 25</h2>
        </div>
        <p className="text-sm text-slate-600">
          Thuộc Phường Long Trường – TP.HCM (hành chính 2 cấp, không còn cấp Thủ Đức).
          Ranh giới: Hẻm 43 đến Đường Số 4, từ Nguyễn Duy Trinh đến Hẻm 1106.
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="text-center">
        <p className="text-slate-500 mb-4">Hoặc sử dụng hệ thống trực tuyến để phản ánh nhanh hơn</p>
        <div className="flex justify-center gap-3">
          <Link href="/phan-anh/tao" className="btn-primary">
            Gửi phản ánh
          </Link>
          <Link href="/chat" className="btn-outline">
            Hỏi AI
          </Link>
        </div>
      </div>

    </div>
  )
}
