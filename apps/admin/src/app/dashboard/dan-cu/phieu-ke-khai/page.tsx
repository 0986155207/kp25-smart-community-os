import Link from 'next/link'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import PhieuKeKhaiClient from './PhieuKeKhaiClient'

export const dynamic = 'force-dynamic'

export default function PhieuKeKhaiPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
          <ArrowLeft size={14} /> Quản lý dân cư
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList size={24} className="text-[#1E3A5F]" />
          Phiếu kê khai & thu thập dữ liệu tận hộ
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          In bộ tài liệu (Thư ngỏ + QR + Phiếu kê khai) để cán bộ phát trực tiếp cho từng hộ gia đình
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <PhieuKeKhaiClient />
      </div>
    </div>
  )
}
