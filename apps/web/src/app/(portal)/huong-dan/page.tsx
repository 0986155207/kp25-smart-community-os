import { KHU_PHO } from '@/lib/khu-pho'
import { layThongTinKhuPho, dinhDangSdt } from '@/lib/khu-pho-data'
import type { Metadata } from 'next'
import { BookOpen, Phone, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import HuongDanClient from './HuongDanClient'

export const metadata: Metadata = {
  title: `Hướng dẫn sử dụng — ${KHU_PHO.ma}`,
  description: `Hướng dẫn chi tiết sử dụng cổng dịch vụ số ${KHU_PHO.ten}, Phường Long Trường, TP.HCM`,
}

export default async function HuongDanPage() {
  const tt = await layThongTinKhuPho()
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-7">
        <div className="w-16 h-16 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center mx-auto">
          <BookOpen size={28} className="text-[#8B1A1A]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Hướng dẫn sử dụng</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Hướng dẫn chi tiết các dịch vụ trên cổng {KHU_PHO.ma} Smart Community<br />
          {KHU_PHO.ten} · Phường Long Trường · TP.HCM
        </p>
      </div>

      <HuongDanClient />

      {/* Hỗ trợ */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tt.truongKpSdt && (
          <a
            href={`tel:${tt.truongKpSdt}`}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Gọi Trưởng khu phố</p>
              <p className="text-xs text-slate-500">{dinhDangSdt(tt.truongKpSdt)}</p>
            </div>
          </a>
        )}
        <Link
          href="/chat"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#8B1A1A] to-[#a52a2a] text-white rounded-2xl hover:opacity-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">Hỏi Trợ lý AI</p>
            <p className="text-xs text-white/70">Hỗ trợ 24/7</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
