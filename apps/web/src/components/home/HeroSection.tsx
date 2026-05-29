'use client'

import Link from 'next/link'
import { MessageSquare, AlertCircle, Search, ChevronRight, Wifi, Shield, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  { icon: Wifi, label: 'Hoạt động 24/7' },
  { icon: Shield, label: 'Bảo mật tuyệt đối' },
  { icon: Users, label: 'Phục vụ toàn dân' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary-gradient text-white">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-medium mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hệ thống đang hoạt động · Khu phố 25
          </motion.div>

          {/* Tiêu đề */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            Hệ điều hành số
            <br />
            <span className="text-[#FCD34D]">Cộng đồng Khu phố 25</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed"
          >
            Phường Long Trường · TP.HCM
            <br className="hidden md:block" />
            Phản ánh hiện trường · Tra cứu thông tin · AI hỗ trợ 24/7
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-10"
          >
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                         bg-white text-[#8B1A1A] font-bold text-base
                         hover:bg-[#FEF9C3] transition-all duration-200 shadow-lg"
            >
              <MessageSquare size={20} />
              Hỏi AI trợ lý
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/phan-anh/tao"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                         bg-white/15 border border-white/30 text-white font-bold text-base
                         hover:bg-white/25 transition-all duration-200"
            >
              <AlertCircle size={20} />
              Gửi phản ánh
            </Link>
            <Link
              href="/tra-cuu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                         bg-white/15 border border-white/30 text-white font-bold text-base
                         hover:bg-white/25 transition-all duration-200"
            >
              <Search size={20} />
              Tra cứu
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-white/70 text-sm">
                <f.icon size={15} />
                <span>{f.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 40L60 33.3C120 26.7 240 13.3 360 10C480 6.7 600 13.3 720 18.3C840 23.3 960 26.7 1080 25C1200 23.3 1320 16.7 1380 13.3L1440 10V40H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
