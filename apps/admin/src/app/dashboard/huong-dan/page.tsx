import { KHU_PHO } from '@/lib/khu-pho'
import { BookOpen } from 'lucide-react'
import HuongDanClient from './HuongDanClient'

export const dynamic = 'force-dynamic'

export default function HuongDanPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={24} className="text-[#1E3A5F]" />
          Hướng dẫn sử dụng hệ thống
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Hướng dẫn chi tiết tất cả tính năng dành cho cán bộ {KHU_PHO.ten} · Phường Long Trường
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <HuongDanClient />
      </div>
    </div>
  )
}
