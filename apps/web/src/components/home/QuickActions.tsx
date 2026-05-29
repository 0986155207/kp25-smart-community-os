'use client'

import Link from 'next/link'
import {
  MessageSquare,
  AlertCircle,
  Bell,
  Map,
  Users,
  FileText,
  Phone,
  QrCode,
} from 'lucide-react'
import { motion } from 'framer-motion'

const actions = [
  {
    href: '/chat',
    icon: MessageSquare,
    label: 'AI Trợ lý',
    desc: 'Hỏi đáp 24/7',
    color: 'bg-[#8B1A1A]',
    lightColor: 'bg-red-50',
    textColor: 'text-[#8B1A1A]',
  },
  {
    href: '/phan-anh/tao',
    icon: AlertCircle,
    label: 'Phản ánh',
    desc: 'Hiện trường',
    color: 'bg-orange-600',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  {
    href: '/thong-bao',
    icon: Bell,
    label: 'Thông báo',
    desc: 'Tin tức khu phố',
    color: 'bg-[#1E3A5F]',
    lightColor: 'bg-blue-50',
    textColor: 'text-[#1E3A5F]',
  },
  {
    href: '/ban-do',
    icon: Map,
    label: 'Bản đồ',
    desc: 'GIS khu phố',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    href: '/dan-cu',
    icon: Users,
    label: 'Dân cư',
    desc: 'Tra cứu hộ dân',
    color: 'bg-violet-600',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-700',
  },
  {
    href: '/thu-tuc',
    icon: FileText,
    label: 'Thủ tục',
    desc: 'Hành chính',
    color: 'bg-cyan-600',
    lightColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
  },
  {
    href: '/lien-he',
    icon: Phone,
    label: 'Liên hệ',
    desc: 'Ban quản lý',
    color: 'bg-slate-600',
    lightColor: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
  {
    href: '/qr',
    icon: QrCode,
    label: 'QR Hộ dân',
    desc: 'Tra cứu nhanh',
    color: 'bg-amber-600',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
]

export default function QuickActions() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="section-title">Truy cập nhanh</h2>
          <p className="section-subtitle text-base">Chọn dịch vụ bạn cần</p>
        </div>

        {/* Mobile: 2 cột lớn — Tablet: 4 cột — Desktop: 8 cột */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {actions.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center gap-3 p-4 md:p-3 rounded-2xl
                            border border-transparent hover:border-slate-100
                            hover:bg-slate-50 active:bg-slate-100
                            transition-all duration-200 group`}
              >
                {/* Icon — lớn hơn trên mobile */}
                <div
                  className={`w-16 h-16 md:w-14 md:h-14 rounded-2xl ${action.lightColor}
                               flex items-center justify-center
                               group-hover:scale-105 transition-transform duration-200`}
                >
                  <action.icon size={30} className={action.textColor} />
                </div>

                {/* Label + mô tả — luôn hiện cả 2 trên mobile */}
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm leading-tight">
                    {action.label}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">{action.desc}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
