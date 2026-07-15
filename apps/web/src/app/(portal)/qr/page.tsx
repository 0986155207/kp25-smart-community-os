import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { QrCode, Home, MessageSquare, Phone, AlertCircle, ChevronRight, Shield, Scan } from 'lucide-react'

export const metadata: Metadata = {
  title: `QR Hộ dân — ${KHU_PHO.ma} Smart Community`,
  description: `Tra cứu thông tin hộ dân nhanh bằng mã QR. Hướng dẫn sử dụng QR hộ dân điện tử ${KHU_PHO.ten}.`,
}

const HUONG_DAN = [
  {
    step: '1',
    title: 'Nhận phiếu QR',
    desc: `Cán bộ ${KHU_PHO.ten} cấp phiếu QR Hộ dân điện tử khi đăng ký hộ khẩu.`,
    color: 'bg-blue-50 border-blue-100',
    numColor: 'bg-blue-600 text-white',
  },
  {
    step: '2',
    title: 'Quét mã QR',
    desc: 'Mở camera điện thoại, hướng vào mã QR để quét. Hệ thống tự mở trang thông tin.',
    color: 'bg-indigo-50 border-indigo-100',
    numColor: 'bg-indigo-600 text-white',
  },
  {
    step: '3',
    title: 'Tra cứu tức thì',
    desc: 'Xem thông tin hộ dân, liên hệ cán bộ, gửi phản ánh — tất cả trong 1 thao tác.',
    color: 'bg-emerald-50 border-emerald-100',
    numColor: 'bg-emerald-600 text-white',
  },
]

const TINH_NANG = [
  { icon: Home,          label: 'Xem thông tin hộ',      desc: 'Địa chỉ, chủ hộ, nhân khẩu'        },
  { icon: MessageSquare, label: 'Hỏi AI trợ lý',          desc: 'Hướng dẫn thủ tục tức thì'          },
  { icon: AlertCircle,   label: 'Gửi phản ánh',           desc: 'Báo cáo vấn đề trong khu phố'       },
  { icon: Phone,         label: 'Liên hệ cán bộ',         desc: 'Trưởng KP, Công an khu vực'         },
]

export default function QRHubPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
          <QrCode className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">QR Hộ dân điện tử</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
          Mỗi hộ dân tại {KHU_PHO.ten} có một mã QR riêng để tra cứu nhanh thông tin,
          liên hệ cán bộ và thực hiện các thủ tục hành chính.
        </p>
      </div>

      {/* ── Scan CTA ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg">
        <Scan size={36} className="mx-auto mb-3 opacity-80" />
        <h2 className="font-bold text-lg mb-1">Bạn có mã QR hộ dân?</h2>
        <p className="text-blue-200 text-sm mb-4">
          Mở camera điện thoại và quét mã QR trên phiếu hộ dân để truy cập ngay.
        </p>
        <div className="bg-white/10 rounded-xl p-3 text-xs text-blue-200 border border-white/20">
          <p className="font-semibold text-white mb-1">Cách quét QR nhanh:</p>
          <p>iPhone: Mở Camera → hướng vào QR → nhấn thông báo xuất hiện</p>
          <p className="mt-1">Android: Mở Camera hoặc Google Lens → hướng vào QR</p>
        </div>
      </div>

      {/* ── Hướng dẫn ───────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Cách sử dụng QR hộ dân</h2>
        <div className="space-y-3">
          {HUONG_DAN.map(h => (
            <div key={h.step} className={`flex items-start gap-4 p-4 rounded-xl border ${h.color}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${h.numColor}`}>
                {h.step}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{h.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tính năng ────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Tính năng sau khi quét QR</h2>
        <div className="grid grid-cols-2 gap-3">
          {TINH_NANG.map(t => (
            <div key={t.label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-2">
                <t.icon size={17} className="text-[#1E3A5F]" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{t.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bảo mật ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
        <Shield size={18} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Bảo mật thông tin</p>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            Mỗi mã QR là duy nhất, được quản lý bởi hệ thống {KHU_PHO.ma}. Thông tin hiển thị
            chỉ bao gồm dữ liệu cơ bản cần thiết, không lộ thông tin nhạy cảm.
          </p>
        </div>
      </div>

      {/* ── Link hữu ích ─────────────────────────────────────── */}
      <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tra cứu & Hỗ trợ</p>
        {[
          { href: '/dan-cu',   label: 'Tra cứu hộ khẩu',    icon: Home          },
          { href: '/chat',     label: 'AI trợ lý hành chính', icon: MessageSquare },
          { href: '/lien-he',  label: 'Liên hệ cán bộ',      icon: Phone         },
          { href: '/phan-anh', label: 'Gửi phản ánh',        icon: AlertCircle   },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition-colors group"
          >
            <item.icon size={15} className="text-slate-400 group-hover:text-[#1E3A5F]" />
            <span className="text-sm text-slate-700 font-medium flex-1">{item.label}</span>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
          </Link>
        ))}
      </div>

    </div>
  )
}
